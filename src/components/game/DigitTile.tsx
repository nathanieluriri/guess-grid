import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import type { DigitState } from "@/lib/game";

interface DigitTileProps {
  digit: number;
  state: DigitState;
  source: "tray" | "slot";
  slotIndex?: number;
  size?: "sm" | "md" | "lg";
}

export function DigitTile({ digit, state, source, slotIndex, size = "md" }: DigitTileProps) {
  const id = source === "tray" ? `tray-${digit}` : `slot-${slotIndex}`;
  const disabled = state === "eliminated" || state === "in-play";

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { digit, source, slotIndex },
    disabled,
  });

  const sizeClass =
    size === "lg" ? "size-14 text-2xl rounded-xl" : size === "sm" ? "size-9 text-base rounded-md" : "size-12 text-xl rounded-lg";

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      disabled={disabled}
      data-state={isDragging ? "dragging" : state}
      className={cn("digit-tile ring-focus touch-none", sizeClass)}
      style={{
        transform: CSS.Translate.toString(transform),
      }}
      aria-label={`Digit ${digit}${state === "eliminated" ? ", eliminated" : ""}`}
    >
      {digit}
      {state === "locked" && <Lock className="absolute -top-1 -right-1 size-3 text-text-secondary" />}
      {state === "present" && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-foreground" />
      )}
    </button>
  );
}
