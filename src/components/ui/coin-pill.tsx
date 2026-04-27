import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

export function CoinPill({
  amount,
  delta,
  className,
}: {
  amount: number | string;
  delta?: number;
  className?: string;
}) {
  return (
    <div className={cn("pill-chip font-mono", className)}>
      <Coins className="size-3.5 text-text-secondary" />
      <span>{amount}</span>
      {delta && delta !== 0 ? (
        <span className={cn("text-[11px]", delta > 0 ? "text-dead" : "text-injured")}>
          {delta > 0 ? `+${delta}` : delta}
        </span>
      ) : null}
    </div>
  );
}
