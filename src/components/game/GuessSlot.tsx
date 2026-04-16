import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { DigitTile } from "./DigitTile";

interface GuessSlotProps {
  index: number;
  digit: number | null;
}

export function GuessSlot({ index, digit }: GuessSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-drop-${index}` });

  return (
    <div
      ref={setNodeRef}
      data-over={isOver}
      data-filled={digit !== null}
      className={cn(
        "guess-slot size-14 sm:size-16 rounded-xl text-2xl sm:text-3xl",
        digit !== null && "animate-slot-drop"
      )}
      role="region"
      aria-label={`Slot ${index + 1}${digit !== null ? `, contains ${digit}` : ", empty"}`}
    >
      {digit !== null && (
        <DigitTile digit={digit} state="available" source="slot" slotIndex={index} size="lg" />
      )}
    </div>
  );
}
