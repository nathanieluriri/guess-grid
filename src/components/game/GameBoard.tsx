"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
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

const SECRET_LENGTH = 4;
const DEFAULT_FEEDBACK = "Drag digits to build your guess";

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
  const [currentSession, setCurrentSession] = useState(session);
  const [slots, setSlots] = useState<Array<number | null>>(() => Array(SECRET_LENGTH).fill(null));
  const [history, setHistory] = useState<GuessResult[]>(() => toGuessHistory(session));
  const [feedback, setFeedback] = useState(waitingFeedback(mode, session.status));
  const [activeDrag, setActiveDrag] = useState<ActiveDragState | null>(null);
  const [equipped, setEquipped] = useState(() => session.loadout.map((powerUp) => ({ ...powerUp })));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCurrentSession(session);
    setHistory(toGuessHistory(session));
    setEquipped(session.loadout.map((powerUp) => ({ ...powerUp })));
    setSlots(Array(SECRET_LENGTH).fill(null));
    setFeedback(waitingFeedback(mode, session.status));
  }, [mode, session]);

  const inPlay = useMemo(() => new Set(slots.filter((slot): slot is number => slot !== null)), [slots]);

  const eliminated = useMemo(() => {
    const next = new Set<number>();
    history.forEach((entry) => {
      if (entry.dead === 0 && entry.injured === 0) {
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

  useEffect(() => {
    if (!currentSession.streamUrl || !["started", "waiting"].includes(currentSession.status)) {
      return;
    }

    const streamPath = currentSession.streamUrl.replace(/^\/api\/v1/, "");
    const eventSource = new EventSource(buildApiUrl(streamPath), { withCredentials: true });
    eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { session?: GameSession };
      if (!payload.session) return;
      setCurrentSession(payload.session);
      setHistory(toGuessHistory(payload.session));
      setEquipped(payload.session.loadout.map((powerUp) => ({ ...powerUp })));
    };
    eventSource.onerror = () => {
      eventSource.close();
    };
    return () => eventSource.close();
  }, [currentSession.id, currentSession.status, currentSession.streamUrl]);

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

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!currentSession.canGuess) return;
      if (event.key >= "0" && event.key <= "9") {
        tapDigit(Number.parseInt(event.key, 10));
      } else if (event.key === "Backspace") {
        const lastFilledSlot = slots
          .map((slot, index) => (slot !== null ? index : -1))
          .filter((index) => index !== -1)
          .pop();
        if (lastFilledSlot !== undefined) removeFromSlot(lastFilledSlot);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [slots, currentSession.canGuess, inPlay, eliminated]);

  async function refreshSession() {
    const refreshed = await apiRequest<GameSession>(`/matches/${currentSession.id}/session`);
    if (refreshed.error) {
      toast.error("Couldn't refresh the board", { description: refreshed.error });
      return;
    }
    if (refreshed.data) {
      setCurrentSession(refreshed.data);
      setHistory(toGuessHistory(refreshed.data));
      setEquipped(refreshed.data.loadout.map((powerUp) => ({ ...powerUp })));
    }
  }

  async function submitGuess() {
    if (!currentSession.guessUrl) return;
    if (slots.some((slot) => slot === null)) {
      setFeedback("Fill all slots first");
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
    const response = await apiRequest<GameSession>("/games/single", { method: "POST", body: JSON.stringify({}) });
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
    setEquipped(response.data.loadout.map((powerUp) => ({ ...powerUp })));
  }

  const slotsFilled = slots.every((slot) => slot !== null);
  const modeLabel = mode === "bot" ? "vs Bot" : mode === "online" ? "Online" : mode === "friend" ? "Friend Match" : "Pass & Play";
  const won = currentSession.status === "completed" && history[history.length - 1]?.dead === SECRET_LENGTH;

  if (currentSession.status === "expired") {
    return (
      <div className="container max-w-xl py-6 sm:py-10 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl tracking-tight">Match Expired</h1>
          <p className="text-text-secondary">This match timed out due to inactivity. Start a new game to keep playing.</p>
        </header>
        <div className="rounded-2xl surface border border-border p-5 space-y-4">
          <Link href="/play" className="block">
            <Button className="w-full h-12">Back to Lobby</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="container max-w-6xl py-4 sm:py-6 space-y-4">
        <div className="rounded-2xl surface border border-border p-3 sm:p-4 flex items-center justify-between gap-3">
          <Link href="/play" className="size-9 grid place-items-center rounded-lg surface-elevated border border-border ring-focus">
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
          <div className="text-right shrink-0">
            <div className="text-xs text-text-tertiary uppercase tracking-wider">Attempts</div>
            <div className="font-mono text-lg font-semibold">{history.length}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-4">
          <div className="space-y-4">
            <div
              role="list"
              aria-label="Guess history"
              aria-live="polite"
              className="rounded-2xl surface-elevated border border-border p-3 sm:p-4 min-h-[180px] max-h-[40vh] overflow-y-auto space-y-2"
            >
              {history.length === 0 ? (
                <div className="text-center text-text-tertiary text-sm py-8">No guesses yet. Build your first guess below.</div>
              ) : (
                history.map((result, index) => (
                  <GuessRow key={result.attempt} result={result} isLatest={index === history.length - 1} isWin={result.dead === SECRET_LENGTH} />
                ))
              )}
            </div>

            <div
              className={cn(
                "min-h-9 px-4 py-2 rounded-lg flex items-center justify-center text-center text-sm font-medium transition-colors",
                won ? "bg-[hsl(var(--signal-dead)/0.12)] text-[hsl(var(--signal-dead))]" : "text-text-secondary",
              )}
              role="status"
              aria-live="polite"
            >
              {feedback}
            </div>

            <div className="flex justify-center gap-2 sm:gap-3 overflow-x-auto pb-1">
              {slots.map((digit, index) => (
                <GuessSlot key={index} index={index} digit={digit} />
              ))}
            </div>

            <DigitTray digits={trayDigits} inPlay={inPlay} />

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl surface border border-border p-3">
              <div className="flex flex-wrap gap-2">
                {equipped.map((powerUp) => (
                  <PowerUpTile key={powerUp.id} powerUp={powerUp} onUse={() => activatePowerUp(powerUp.id)} size="sm" />
                ))}
              </div>
              <span className="text-[11px] text-text-tertiary uppercase tracking-wider">Equipped</span>
            </div>

            <div className="flex gap-2">
              {mode === "bot" && won ? (
                <Button onClick={resetBot} className="flex-1 h-12 text-base" size="lg">
                  <RotateCcw className="size-4 mr-2" /> New Game
                </Button>
              ) : (
                <Button onClick={submitGuess} disabled={!slotsFilled || !currentSession.canGuess || isSubmitting} className="flex-1 h-12 text-base font-semibold" size="lg">
                  {isSubmitting ? "Submitting..." : "Submit Guess"}
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
                  <dt className="text-text-secondary">Session</dt>
                  <dd className="font-mono">{currentSession.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Status</dt>
                  <dd className="font-mono">{currentSession.status}</dd>
                </div>
              </dl>
            </div>

            {won && (
              <div className="rounded-2xl border border-[hsl(var(--signal-dead)/0.4)] bg-[hsl(var(--signal-dead)/0.06)] p-4 text-center animate-scale-in">
                <Trophy className="size-8 mx-auto mb-2 text-[hsl(var(--signal-dead))]" />
                <div className="font-semibold mb-1">Victory</div>
                <div className="text-xs text-text-secondary mb-3">Server confirmed the final guess.</div>
                {mode === "bot" ? (
                  <Button size="sm" onClick={resetBot} className="w-full">
                    <RotateCcw className="size-3 mr-1.5" /> Rematch
                  </Button>
                ) : null}
              </div>
            )}

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
