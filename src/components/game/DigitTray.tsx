import { useDroppable } from "@dnd-kit/core";
import { DigitTile } from "./DigitTile";
import { cn } from "@/lib/utils";
import type { DigitInfo } from "@/lib/game";

interface DigitTrayProps {
  digits: DigitInfo[];
  inPlay: Set<number>;
}

export function DigitTray({ digits, inPlay }: DigitTrayProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "tray-drop" });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-2xl surface border border-border p-3 transition-colors",
        isOver && "border-border-strong"
      )}
    >
      <div className="flex justify-between gap-1.5 sm:gap-2">
        {digits.map((d) => {
          const state = inPlay.has(d.digit) && d.state === "available" ? "in-play" : d.state;
          return <DigitTile key={d.digit} digit={d.digit} state={state} source="tray" />;
        })}
      </div>
    </div>
  );
}
