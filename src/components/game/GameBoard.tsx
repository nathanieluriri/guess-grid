"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { ArrowLeft, RotateCcw, Trophy, Flag, Loader2, AlertTriangle } from "lucide-react";
import { GuessSlot } from "./GuessSlot";
import { DigitTray } from "./DigitTray";
import { GuessRow } from "./GuessRow";
import { PowerUpTile } from "./PowerUpTile";
import { ProfileMedia } from "@/components/profile/ProfileMedia";
import type { DigitInfo, GuessResult } from "@/lib/game";
import type { GameSession, PlayMode } from "@/lib/api/mock-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiRequest, buildApiUrl } from "@/lib/api/client";
import { useAuth } from "@/components/auth/AuthProvider";

const SECRET_LENGTH = 4;
const DEFAULT_FEEDBACK = "Drag digits to build your guess";
const PLAYABLE_STATUSES = new Set(["started", "waiting", "completed", "expired"]);

type StreamStatus = "idle" | "live" | "reconnecting" | "offline";

interface ActiveDragState {
  digit: number;
  source: "tray" | "slot";
  slotIndex?: number;
}

interface GameBoardProps {
  mode: PlayMode;
  session: GameSession;
}

function toGuessHistory(session: GameSession): GuessResult[] {
  return session.history.map((item) => ({
    attempt: item.attempt,
    digits: item.digits,
    dead: item.dead,
    injured: item.injured,
    byViewer: item.byViewer,
  }));
}

function formatRevealDescription(reveal: { kind: string; digit?: number | null; position?: number | null }) {
  const positionLabel = reveal.position != null ? reveal.position + 1 : null;
  switch (reveal.kind) {
    case "peek-in":
      return `Digit ${reveal.digit} is in the secret`;
    case "peek-out":
      return `Digit ${reveal.digit} is not in the secret`;
    case "pin":
      return `Position ${positionLabel} is locked in`;
    case "lock-in":
      return `Digit ${reveal.digit} sits at position ${positionLabel}`;
    default:
      return "Activated";
  }
}

function waitingFeedback(_mode: PlayMode, status: string) {
  if (status === "waiting") return "Submit your secret to begin the match";
  if (status === "completed") return "Match completed";
  if (status === "expired") return "Match expired due to inactivity";
  return DEFAULT_FEEDBACK;
}

export function GameBoard({ mode, session }: GameBoardProps) {
  const { requireVerifiedUser } = useAuth();
  const router = useRouter();
  const [currentSession, setCurrentSession] = useState(session);
  const [slots, setSlots] = useState<Array<number | null>>(() => Array(SECRET_LENGTH).fill(null));
  const [history, setHistory] = useState<GuessResult[]>(() => toGuessHistory(session));
  const [feedback, setFeedback] = useState(waitingFeedback(mode, session.status));
  const [activeDrag, setActiveDrag] = useState<ActiveDragState | null>(null);
  const [equipped, setEquipped] = useState(() => session.loadout.map((powerUp) => ({ ...powerUp })));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>("idle");

  useEffect(() => {
    setCurrentSession(session);
    setHistory(toGuessHistory(session));
    setEquipped(session.loadout.map((powerUp) => ({ ...powerUp })));
    setSlots(Array(SECRET_LENGTH).fill(null));
    setFeedback(waitingFeedback(mode, session.status));
    setRefreshError(null);
  }, [mode, session]);

  const inPlay = useMemo(() => new Set(slots.filter((slot): slot is number => slot !== null)), [slots]);

  const eliminated = useMemo(() => {
    const next = new Set<number>();
    history.forEach((entry) => {
      // Only the viewer's own 0/0 guesses prove a digit is absent from the
      // opponent's secret. An opponent's row scores against *our* secret, so it
      // must never gray out digits in our tray.
      if (entry.byViewer === false) return;
      if (entry.dead === 0 && entry.injured === 0 && entry.digits.every((d) => d >= 0)) {
        entry.digits.forEach((digit) => next.add(digit));
      }
    });
    return next;
  }, [history]);

  const trayDigits: DigitInfo[] = useMemo(
    () =>
      Array.from({ length: 10 }, (_, digit) => ({
        digit,
        state: eliminated.has(digit) ? "eliminated" : "available",
      })),
    [eliminated],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 80, tolerance: 6 } }),
    useSensor(KeyboardSensor),
  );

  // Live (networked) modes get a server-sent stream so the board reflects the
  // opponent's moves. Bot / local have no remote actor, so we skip the stream
  // entirely. Reconnect with capped exponential backoff and surface the state.
  useEffect(() => {
    const isLive = currentSession.mode === "online" || currentSession.mode === "friend";
    if (!isLive || !currentSession.streamUrl || !["started", "waiting"].includes(currentSession.status)) {
      setStreamStatus("idle");
      return;
    }

    let closed = false;
    let source: EventSource | null = null;
    let attempts = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    const streamPath = currentSession.streamUrl.replace(/^\/api\/v1/, "");

    const connect = () => {
      if (closed) return;
      source = new EventSource(buildApiUrl(streamPath), { withCredentials: true });
      source.onopen = () => {
        attempts = 0;
        setStreamStatus("live");
      };
      source.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as { session?: GameSession };
          if (!payload.session) return;
          setCurrentSession(payload.session);
          setHistory(toGuessHistory(payload.session));
          setEquipped(payload.session.loadout.map((powerUp) => ({ ...powerUp })));
          setRefreshError(null);
        } catch {
          /* ignore malformed frame */
        }
      };
      source.onerror = () => {
        source?.close();
        if (closed) return;
        attempts += 1;
        if (attempts > 6) {
          setStreamStatus("offline");
          return;
        }
        setStreamStatus("reconnecting");
        reconnectTimer = setTimeout(connect, Math.min(1000 * 2 ** (attempts - 1), 15000));
      };
    };

    connect();
    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      source?.close();
    };
  }, [currentSession.id, currentSession.status, currentSession.streamUrl, currentSession.mode]);

  const placeDigit = (digit: number, slotIndex: number, fromSlotIndex?: number) => {
    setSlots((previous) => {
      const next = [...previous];
      const existing = next[slotIndex];

      if (fromSlotIndex !== undefined) {
        next[fromSlotIndex] = existing;
      }

      next[slotIndex] = digit;
      return next;
    });
  };

  const removeFromSlot = (slotIndex: number) => {
    setSlots((previous) => {
      const next = [...previous];
      next[slotIndex] = null;
      return next;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDrag(event.active.data.current as ActiveDragState);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;
    const data = active.data.current as ActiveDragState;
    const overId = String(over.id);
    if (overId.startsWith("slot-drop-")) {
      const slotIndex = Number.parseInt(overId.replace("slot-drop-", ""), 10);
      if (data.source === "slot" && data.slotIndex === slotIndex) return;
      placeDigit(data.digit, slotIndex, data.source === "slot" ? data.slotIndex : undefined);
      return;
    }
    if (overId === "tray-drop" && data.source === "slot" && data.slotIndex !== undefined) {
      removeFromSlot(data.slotIndex);
    }
  };

  const tapDigit = (digit: number) => {
    if (eliminated.has(digit) || inPlay.has(digit)) return;
    const emptySlot = slots.findIndex((slot) => slot === null);
    if (emptySlot === -1) return;
    placeDigit(digit, emptySlot);
  };

  const slotsFilled = slots.every((slot) => slot !== null);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!currentSession.canGuess || isSubmitting) return;
      if (event.key >= "0" && event.key <= "9") {
        tapDigit(Number.parseInt(event.key, 10));
      } else if (event.key === "Backspace") {
        const lastFilledSlot = slots
          .map((slot, index) => (slot !== null ? index : -1))
          .filter((index) => index !== -1)
          .pop();
        if (lastFilledSlot !== undefined) removeFromSlot(lastFilledSlot);
      } else if (event.key === "Enter" && slots.every((slot) => slot !== null)) {
        event.preventDefault();
        void submitGuess();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, currentSession.canGuess, isSubmitting, inPlay, eliminated]);

  async function refreshSession() {
    const refreshed = await apiRequest<GameSession>(`/matches/${currentSession.id}/session`);
    if (refreshed.error) {
      setRefreshError(refreshed.error);
      toast.error("Couldn't refresh the board", { description: refreshed.error });
      return;
    }
    if (refreshed.data) {
      setRefreshError(null);
      setCurrentSession(refreshed.data);
      setHistory(toGuessHistory(refreshed.data));
      setEquipped(refreshed.data.loadout.map((powerUp) => ({ ...powerUp })));
    }
  }

  async function submitGuess() {
    if (!currentSession.guessUrl || isSubmitting) return;
    if (slots.some((slot) => slot === null)) {
      setFeedback("Fill all slots first");
      return;
    }
    // Multiplayer rounds require a verified real user — pre-empt the backend
    // 403 with a friendlier upgrade dialog / verify-email toast.
    if (mode === "online" && !requireVerifiedUser("submit a ranked round")) {
      return;
    }

    setIsSubmitting(true);
    const guess = (slots as number[]).join("");
    const guessPath = currentSession.guessUrl.replace(/^\/api\/v1/, "");
    const query = currentSession.viewerPlayerId ? `?viewer_player_id=${encodeURIComponent(currentSession.viewerPlayerId)}` : "";
    const response = await apiRequest<{ attempt: number; dead: number; injured: number; solved: boolean; status: string }>(
      `${guessPath}${query}`,
      {
        method: "POST",
        body: JSON.stringify({ guess }),
      },
    );
    setIsSubmitting(false);

    if (response.error) {
      toast.error("Guess failed", { description: response.error });
      setFeedback(response.error);
      return;
    }

    setSlots(Array(SECRET_LENGTH).fill(null));
    await refreshSession();
    if (response.data?.solved) {
      toast.success("Victory!", { description: `You solved the match in ${response.data.attempt} attempts.` });
      setFeedback(`Solved in ${response.data.attempt} attempts!`);
    } else {
      setFeedback(`${response.data?.dead ?? 0} Dead, ${response.data?.injured ?? 0} Injured`);
    }
  }

  async function activatePowerUp(id: string) {
    if (!currentSession.powerupUrl) return;
    const powerupPath = currentSession.powerupUrl.replace(/^\/api\/v1/, "");
    const response = await apiRequest<{
      powerup_id: string;
      effect: string;
      remaining: number;
      reveal?: { kind: string; digit?: number | null; position?: number | null } | null;
    }>(powerupPath, {
      method: "POST",
      body: JSON.stringify({ powerup_id: id }),
    });
    if (response.error) {
      toast.error("Power-up failed", { description: response.error });
      return;
    }
    const reveal = response.data?.reveal ?? null;
    const description = reveal
      ? formatRevealDescription(reveal)
      : response.data?.effect ?? "Activated";
    toast("Power-up used", { description });
    await refreshSession();
  }

  async function resetBot() {
    if (isResetting) return;
    setIsResetting(true);
    const response = await apiRequest<GameSession>("/games/single", { method: "POST", body: JSON.stringify({}) });
    setIsResetting(false);
    if (response.error || !response.data) {
      toast.error("Couldn't start a new bot match", {
        description: response.error ?? "Try again in a moment.",
      });
      return;
    }
    setCurrentSession(response.data);
    setHistory([]);
    setSlots(Array(SECRET_LENGTH).fill(null));
    setFeedback(DEFAULT_FEEDBACK);
    setRefreshError(null);
    setEquipped(response.data.loadout.map((powerUp) => ({ ...powerUp })));
  }

  const modeLabel = mode === "bot" ? "vs Bot" : mode === "online" ? "Online" : mode === "friend" ? "Friend Match" : "Pass & Play";
  const myAttempts = currentSession.history.filter((entry) => entry.byViewer).length || history.length;
  const isOver = currentSession.status === "completed";
  // Fallback only (the server now sends `outcome`): infer from the viewer's last
  // row, never the combined history's last row, which may be the opponent's.
  const lastViewerGuess = [...history].reverse().find((entry) => entry.byViewer !== false);
  const lastGuessWon = lastViewerGuess?.dead === SECRET_LENGTH;
  const outcome: "won" | "lost" | null =
    currentSession.outcome ?? (isOver ? (lastGuessWon ? "won" : "lost") : null);
  const won = outcome === "won";
  const opponentsTurn = currentSession.status === "started" && !currentSession.canGuess && !isOver;

  // ---- Match expired ----
  if (currentSession.status === "expired") {
    return (
      <div className="container max-w-xl py-6 sm:py-10 space-y-6 animate-fade-in">
        <header className="space-y-2">
          <h1 className="text-3xl tracking-tight">Match Expired</h1>
          <p className="text-text-secondary">This match timed out due to inactivity. Start a new game to keep playing.</p>
        </header>
        <div className="rounded-2xl surface border border-border p-5 space-y-3">
          {mode === "bot" ? (
            <Button onClick={resetBot} disabled={isResetting} className="w-full h-12">
              {isResetting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <RotateCcw className="size-4 mr-2" />}
              New Game
            </Button>
          ) : null}
          <Link href="/play" className="block">
            <Button variant={mode === "bot" ? "outline" : "default"} className="w-full h-12">Back to Lobby</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ---- Non-playable session (couldn't start / idle fallback) ----
  if (!PLAYABLE_STATUSES.has(currentSession.status)) {
    return (
      <div className="container max-w-xl py-6 sm:py-10 animate-fade-in">
        <div className="rounded-2xl surface border border-border p-8 text-center space-y-4">
          <div className="size-12 mx-auto grid place-items-center rounded-full surface-elevated border border-border">
            <AlertTriangle className="size-5 text-text-secondary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">Couldn&apos;t start the match</h1>
            <p className="text-sm text-text-secondary">
              {currentSession.opponent.subtitle || "The server didn't return a live session. Try again in a moment."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => router.refresh()} className="h-11">
              <RotateCcw className="size-4 mr-2" /> Try again
            </Button>
            <Link href="/play" className="block">
              <Button variant="outline" className="h-11 w-full">Back to Play</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusLine = isOver
    ? won
      ? `Solved in ${myAttempts} ${myAttempts === 1 ? "attempt" : "attempts"}`
      : "Match over"
    : opponentsTurn
      ? "Opponent's turn…"
      : feedback;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="container max-w-6xl py-4 sm:py-6 space-y-4 animate-fade-in">
        <div className="rounded-2xl surface border border-border p-3 sm:p-4 flex items-center justify-between gap-3">
          <Link href="/play" className="size-9 grid place-items-center rounded-lg surface-elevated border border-border ring-focus" aria-label="Back to lobby">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            <ProfileMedia
              src={currentSession.opponent.profile_media_url}
              kind={currentSession.opponent.profile_media_kind}
              initials={currentSession.opponent.initials}
              size={40}
              className="shrink-0 border-2 border-border-strong"
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight truncate">{currentSession.opponent.name}</div>
              <div className="text-xs text-text-tertiary font-mono truncate">{currentSession.opponent.subtitle}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {streamStatus !== "idle" && (mode === "online" || mode === "friend") ? <StreamPill status={streamStatus} /> : null}
            <div className="text-right">
              <div className="text-xs text-text-tertiary uppercase tracking-wider">Attempts</div>
              <div className="font-mono text-lg font-semibold">{myAttempts}</div>
            </div>
          </div>
        </div>

        {isOver ? <ResultPanel won={won} attempts={myAttempts} mode={mode} onRematch={resetBot} isResetting={isResetting} /> : null}

        {refreshError && !isOver ? (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-xl border border-border surface-elevated px-3 py-2 text-sm"
          >
            <span className="flex items-center gap-2 text-text-secondary">
              <AlertTriangle className="size-4 shrink-0" /> Couldn&apos;t sync the board.
            </span>
            <Button size="sm" variant="ghost" className="h-7" onClick={() => void refreshSession()}>
              Retry
            </Button>
          </div>
        ) : null}

        <div className="grid lg:grid-cols-[1fr_320px] gap-4">
          <div className="space-y-4">
            <div
              role="list"
              aria-label="Guess history"
              aria-live="polite"
              className="rounded-2xl surface-elevated border border-border p-3 sm:p-4 min-h-[180px] max-h-[40vh] overflow-y-auto space-y-2"
            >
              {history.length === 0 ? (
                <EmptyHistory waiting={currentSession.status === "waiting"} />
              ) : (
                history.map((result, index) => (
                  <GuessRow
                    key={`${result.attempt}-${index}`}
                    result={result}
                    isLatest={index === history.length - 1}
                    isWin={result.dead === SECRET_LENGTH}
                    showAttribution={mode === "online" || mode === "friend"}
                  />
                ))
              )}
            </div>

            <div
              className={cn(
                "min-h-9 px-4 py-2 rounded-lg flex items-center justify-center text-center text-sm font-medium transition-colors",
                won
                  ? "bg-[hsl(var(--signal-dead)/0.12)] text-[hsl(var(--signal-dead))]"
                  : opponentsTurn
                    ? "text-text-tertiary"
                    : "text-text-secondary",
              )}
              role="status"
              aria-live="polite"
            >
              {opponentsTurn ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-current animate-pulse" />
                  {statusLine}
                </span>
              ) : (
                statusLine
              )}
            </div>

            <fieldset
              disabled={!currentSession.canGuess || isSubmitting}
              className="space-y-4 disabled:opacity-60 disabled:pointer-events-none transition-opacity"
            >
              <div className="flex justify-center gap-2 sm:gap-3 overflow-x-auto pb-1">
                {slots.map((digit, index) => (
                  <GuessSlot key={index} index={index} digit={digit} />
                ))}
              </div>

              <DigitTray digits={trayDigits} inPlay={inPlay} />
            </fieldset>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl surface border border-border p-3">
              <div className="flex flex-wrap gap-2">
                {equipped.length === 0 ? (
                  <span className="text-xs text-text-tertiary py-2">No power-ups equipped</span>
                ) : (
                  equipped.map((powerUp) => (
                    <PowerUpTile
                      key={powerUp.id}
                      powerUp={powerUp}
                      onUse={() => activatePowerUp(powerUp.id)}
                      size="sm"
                    />
                  ))
                )}
              </div>
              <span className="text-[11px] text-text-tertiary uppercase tracking-wider">Equipped</span>
            </div>

            <div className="flex gap-2">
              {isOver ? (
                mode === "bot" ? (
                  <Button onClick={resetBot} disabled={isResetting} className="flex-1 h-12 text-base" size="lg">
                    {isResetting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <RotateCcw className="size-4 mr-2" />}
                    New Game
                  </Button>
                ) : (
                  <Link href="/play" className="flex-1">
                    <Button className="w-full h-12 text-base" size="lg">Back to Lobby</Button>
                  </Link>
                )
              ) : (
                <Button
                  onClick={submitGuess}
                  disabled={!slotsFilled || !currentSession.canGuess || isSubmitting}
                  className="flex-1 h-12 text-base font-semibold"
                  size="lg"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" /> Submitting…
                    </span>
                  ) : opponentsTurn ? (
                    "Waiting for opponent"
                  ) : (
                    "Submit Guess"
                  )}
                </Button>
              )}
            </div>
          </div>

          <aside className="hidden lg:flex flex-col gap-4">
            <div className="rounded-2xl surface border border-border p-4">
              <div className="text-xs uppercase tracking-wider text-text-tertiary mb-3">Match</div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Mode</dt>
                  <dd>{modeLabel}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Length</dt>
                  <dd className="font-mono">{SECRET_LENGTH} digits</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Status</dt>
                  <dd className="font-mono capitalize">{isOver ? (won ? "won" : "lost") : currentSession.status}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl surface border border-border p-4">
              <div className="text-xs uppercase tracking-wider text-text-tertiary mb-3">How to play</div>
              <ul className="space-y-2 text-xs text-text-secondary leading-relaxed">
                <li>• Drag digits into slots, or tap.</li>
                <li>• Dead = right digit, right spot.</li>
                <li>• Injured = right digit, wrong spot.</li>
                <li>• The backend evaluates every guess.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDrag ? (
          <div className="size-14 rounded-xl surface border-2 border-foreground/40 grid place-items-center text-2xl font-mono font-semibold shadow-drag scale-110">
            {activeDrag.digit}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function StreamPill({ status }: { status: StreamStatus }) {
  const label = status === "live" ? "Live" : status === "reconnecting" ? "Reconnecting…" : "Offline";
  return (
    <span
      className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border px-2 h-6 text-[11px] font-medium text-text-tertiary"
      title={`Live updates: ${label}`}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "live" && "bg-foreground",
          status === "reconnecting" && "bg-foreground/60 animate-pulse",
          status === "offline" && "bg-transparent border border-text-tertiary",
        )}
      />
      {label}
    </span>
  );
}

function EmptyHistory({ waiting }: { waiting: boolean }) {
  return (
    <div className="h-full min-h-[150px] grid place-items-center text-center px-4">
      <div className="space-y-1.5">
        <div className="text-sm text-text-secondary">
          {waiting ? "Waiting for both secrets…" : "No guesses yet"}
        </div>
        <div className="text-xs text-text-tertiary">
          {waiting ? "The match begins once secrets are in." : "Build your first guess below to start cracking the code."}
        </div>
      </div>
    </div>
  );
}

function ResultPanel({
  won,
  attempts,
  mode,
  onRematch,
  isResetting,
}: {
  won: boolean;
  attempts: number;
  mode: PlayMode;
  onRematch: () => void;
  isResetting: boolean;
}) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-2xl border p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 animate-scale-in",
        won
          ? "border-[hsl(var(--signal-dead)/0.4)] bg-[hsl(var(--signal-dead)/0.06)]"
          : "border-border surface-elevated",
      )}
    >
      <div
        className={cn(
          "size-12 shrink-0 grid place-items-center rounded-full border",
          won ? "border-[hsl(var(--signal-dead)/0.5)] text-[hsl(var(--signal-dead))]" : "border-border text-text-secondary",
        )}
      >
        {won ? <Trophy className="size-6" /> : <Flag className="size-6" />}
      </div>
      <div className="flex-1 text-center sm:text-left">
        <div className="text-lg font-semibold tracking-tight">{won ? "Victory" : "Match over"}</div>
        <div className="text-sm text-text-secondary">
          {won
            ? `Server confirmed the code in ${attempts} ${attempts === 1 ? "attempt" : "attempts"}.`
            : mode === "bot"
              ? "The bot's code held this round."
              : "Your opponent cracked the code first."}
        </div>
      </div>
      {mode === "bot" ? (
        <Button onClick={onRematch} disabled={isResetting} className="h-11 w-full sm:w-auto">
          {isResetting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <RotateCcw className="size-4 mr-2" />}
          Rematch
        </Button>
      ) : (
        <Link href="/play" className="w-full sm:w-auto">
          <Button variant="outline" className="h-11 w-full">New match</Button>
        </Link>
      )}
    </div>
  );
}
