import { useEffect, useMemo, useState } from "react";
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
import { GuessSlot } from "./GuessSlot";
import { DigitTray } from "./DigitTray";
import { GuessRow } from "./GuessRow";
import { PowerUpTile } from "./PowerUpTile";
import { evaluateGuess, generateSecret, type DigitInfo, type GuessResult } from "@/lib/game";
import { POWER_UPS } from "@/lib/powerups";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const SECRET_LENGTH = 4;

export function GameBoard() {
  const [secret, setSecret] = useState<number[]>(() => generateSecret(SECRET_LENGTH));
  const [slots, setSlots] = useState<(number | null)[]>(() => Array(SECRET_LENGTH).fill(null));
  const [history, setHistory] = useState<GuessResult[]>([]);
  const [eliminated, setEliminated] = useState<Set<number>>(new Set());
  const [present, setPresent] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState("Drag digits to build your guess");
  const [activeDrag, setActiveDrag] = useState<{ digit: number; source: "tray" | "slot"; slotIndex?: number } | null>(null);
  const [won, setWon] = useState(false);
  const [equipped, setEquipped] = useState(POWER_UPS.filter((p) => ["peek-out", "peek-in", "shield"].includes(p.id)));

  const inPlay = useMemo(() => new Set(slots.filter((s): s is number => s !== null)), [slots]);

  const trayDigits: DigitInfo[] = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        digit: i,
        state: eliminated.has(i) ? "eliminated" : present.has(i) ? "present" : "available",
      })),
    [eliminated, present]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 80, tolerance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const placeDigit = (digit: number, slotIndex: number, fromSlotIndex?: number) => {
    setSlots((prev) => {
      const next = [...prev];
      const existing = next[slotIndex];
      if (fromSlotIndex !== undefined) {
        next[fromSlotIndex] = existing;
      }
      next[slotIndex] = digit;
      return next;
    });
  };

  const removeFromSlot = (slotIndex: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  const handleDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current as { digit: number; source: "tray" | "slot"; slotIndex?: number };
    setActiveDrag(data);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = e;
    if (!over) return;
    const data = active.data.current as { digit: number; source: "tray" | "slot"; slotIndex?: number };
    const overId = String(over.id);

    if (overId.startsWith("slot-drop-")) {
      const slotIndex = parseInt(overId.replace("slot-drop-", ""), 10);
      if (data.source === "slot" && data.slotIndex === slotIndex) return;
      placeDigit(data.digit, slotIndex, data.source === "slot" ? data.slotIndex : undefined);
    } else if (overId === "tray-drop" && data.source === "slot" && data.slotIndex !== undefined) {
      removeFromSlot(data.slotIndex);
    }
  };

  // Tap fallback
  const tapDigit = (digit: number) => {
    if (eliminated.has(digit) || inPlay.has(digit)) return;
    const empty = slots.findIndex((s) => s === null);
    if (empty === -1) return;
    placeDigit(digit, empty);
  };

  // Keyboard input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (won) return;
      if (e.key >= "0" && e.key <= "9") {
        tapDigit(parseInt(e.key));
      } else if (e.key === "Backspace") {
        const lastFilled = slots.map((s, i) => (s !== null ? i : -1)).filter((i) => i !== -1).pop();
        if (lastFilled !== undefined) removeFromSlot(lastFilled);
      } else if (e.key === "Enter" && slots.every((s) => s !== null)) {
        submitGuess();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, won]);

  const submitGuess = () => {
    if (slots.some((s) => s === null)) {
      setFeedback("Fill all slots first");
      return;
    }
    const guess = slots as number[];
    const dupe = history.some((h) => h.digits.every((d, i) => d === guess[i]));
    if (dupe) {
      setFeedback("You've already tried this");
      return;
    }
    const { dead, injured } = evaluateGuess(secret, guess);
    const result: GuessResult = { attempt: history.length + 1, digits: [...guess], dead, injured };
    setHistory((h) => [...h, result]);

    if (dead === SECRET_LENGTH) {
      setWon(true);
      setFeedback(`Solved in ${result.attempt} attempts!`);
      toast.success("Victory!", { description: `You cracked ${secret.join("")} in ${result.attempt} attempts.` });
    } else if (dead === 0 && injured === 0) {
      setEliminated((prev) => {
        const next = new Set(prev);
        guess.forEach((d) => next.add(d));
        return next;
      });
      setFeedback("Digits eliminated from tray");
    } else {
      setFeedback(`${dead} Dead, ${injured} Injured`);
    }

    setSlots(Array(SECRET_LENGTH).fill(null));
  };

  const reset = () => {
    setSecret(generateSecret(SECRET_LENGTH));
    setSlots(Array(SECRET_LENGTH).fill(null));
    setHistory([]);
    setEliminated(new Set());
    setPresent(new Set());
    setFeedback("Drag digits to build your guess");
    setWon(false);
  };

  const usePowerUp = (id: string) => {
    const pu = equipped.find((p) => p.id === id);
    if (!pu || pu.count === 0) return;
    if (id === "peek-out") {
      const candidates = Array.from({ length: 10 }, (_, i) => i).filter((d) => !secret.includes(d) && !eliminated.has(d));
      if (candidates.length === 0) return;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      setEliminated((prev) => new Set(prev).add(pick));
      setFeedback(`Peek revealed: ${pick} is NOT in the secret`);
      toast(`Peek used`, { description: `${pick} is not in the secret.` });
    } else if (id === "peek-in") {
      const candidates = secret.filter((d) => !present.has(d));
      if (candidates.length === 0) return;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      setPresent((prev) => new Set(prev).add(pick));
      setFeedback(`Peek revealed: ${pick} IS in the secret`);
      toast(`Peek used`, { description: `${pick} is in the secret.` });
    } else {
      toast(`${pu.name} activated`);
    }
    setEquipped((prev) => prev.map((p) => (p.id === id ? { ...p, count: p.count - 1 } : p)));
  };

  const slotsFilled = slots.every((s) => s !== null);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="container max-w-6xl py-4 sm:py-6 space-y-4">
        {/* Opponent strip */}
        <div className="rounded-2xl surface border border-border p-3 sm:p-4 flex items-center justify-between gap-3">
          <Link to="/play" className="size-9 grid place-items-center rounded-lg surface-elevated border border-border ring-focus">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full surface-elevated border-2 border-border-strong grid place-items-center font-mono text-xs font-semibold">
              BT
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">Bot · Intermediate</div>
              <div className="text-xs text-text-tertiary font-mono">~1,180 ELO</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-text-tertiary uppercase tracking-wider">Attempts</div>
            <div className="font-mono text-lg font-semibold">{history.length}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-4">
          {/* Center column */}
          <div className="space-y-4">
            {/* History */}
            <div className="rounded-2xl surface-elevated border border-border p-3 sm:p-4 min-h-[180px] max-h-[40vh] overflow-y-auto space-y-2">
              {history.length === 0 ? (
                <div className="text-center text-text-tertiary text-sm py-8">
                  No guesses yet. Build your first guess below.
                </div>
              ) : (
                history.map((r, i) => (
                  <GuessRow key={r.attempt} result={r} isLatest={i === history.length - 1} isWin={r.dead === SECRET_LENGTH} />
                ))
              )}
            </div>

            {/* Feedback */}
            <div
              className={cn(
                "h-9 px-4 rounded-lg flex items-center justify-center text-sm font-medium transition-colors",
                won ? "bg-[hsl(var(--signal-dead)/0.12)] text-[hsl(var(--signal-dead))]" : "text-text-secondary"
              )}
              role="status"
              aria-live="polite"
            >
              {feedback}
            </div>

            {/* Slots */}
            <div className="flex justify-center gap-2 sm:gap-3">
              {slots.map((d, i) => (
                <GuessSlot key={i} index={i} digit={d} />
              ))}
            </div>

            {/* Tray */}
            <DigitTray digits={trayDigits} inPlay={inPlay} />

            {/* Power-ups */}
            <div className="flex items-center justify-between gap-3 rounded-2xl surface border border-border p-3">
              <div className="flex gap-2">
                {equipped.map((p) => (
                  <PowerUpTile key={p.id} powerUp={p} onUse={() => usePowerUp(p.id)} size="sm" />
                ))}
              </div>
              <span className="text-[11px] text-text-tertiary uppercase tracking-wider">Equipped</span>
            </div>

            {/* Submit */}
            <div className="flex gap-2">
              {won ? (
                <Button onClick={reset} className="flex-1 h-12 text-base" size="lg">
                  <RotateCcw className="size-4 mr-2" /> New Game
                </Button>
              ) : (
                <Button
                  onClick={submitGuess}
                  disabled={!slotsFilled}
                  className="flex-1 h-12 text-base font-semibold"
                  size="lg"
                >
                  Submit Guess
                </Button>
              )}
            </div>
          </div>

          {/* Right rail (desktop) */}
          <aside className="hidden lg:flex flex-col gap-4">
            <div className="rounded-2xl surface border border-border p-4">
              <div className="text-xs uppercase tracking-wider text-text-tertiary mb-3">Match</div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Mode</dt>
                  <dd>vs Bot</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Length</dt>
                  <dd className="font-mono">{SECRET_LENGTH} digits</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Duplicates</dt>
                  <dd>Off</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Eliminated</dt>
                  <dd className="font-mono">{eliminated.size}/10</dd>
                </div>
              </dl>
            </div>

            {won && (
              <div className="rounded-2xl border border-[hsl(var(--signal-dead)/0.4)] bg-[hsl(var(--signal-dead)/0.06)] p-4 text-center animate-scale-in">
                <Trophy className="size-8 mx-auto mb-2 text-[hsl(var(--signal-dead))]" />
                <div className="font-semibold mb-1">Victory</div>
                <div className="text-xs text-text-secondary mb-3">
                  Secret was <span className="font-mono font-semibold text-foreground">{secret.join("")}</span>
                </div>
                <Button size="sm" onClick={reset} className="w-full">
                  <RotateCcw className="size-3 mr-1.5" /> Rematch
                </Button>
              </div>
            )}

            <div className="rounded-2xl surface border border-border p-4">
              <div className="text-xs uppercase tracking-wider text-text-tertiary mb-3">How to play</div>
              <ul className="space-y-2 text-xs text-text-secondary leading-relaxed">
                <li>• Drag digits into slots, or tap.</li>
                <li>• <span className="text-[hsl(var(--signal-dead))] font-medium">Dead</span> = right digit, right spot.</li>
                <li>• <span className="text-[hsl(var(--signal-injured))] font-medium">Injured</span> = right digit, wrong spot.</li>
                <li>• 0/0 result eliminates digits from your tray.</li>
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
