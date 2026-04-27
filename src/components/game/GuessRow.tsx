import { cn } from "@/lib/utils";
import { DeadBadge, InjuredBadge } from "./Badges";
import { POWER_UP_ICONS } from "@/lib/powerups";
import type { GuessResult } from "@/lib/game";

interface GuessRowProps {
  result: GuessResult;
  isLatest?: boolean;
  isWin?: boolean;
}

export function GuessRow({ result, isLatest, isWin }: GuessRowProps) {
  const PowerIcon = result.powerUpUsed ? POWER_UP_ICONS[result.powerUpUsed] : null;
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border",
        isLatest && "animate-row-in",
        isWin ? "bg-[hsl(var(--signal-dead)/0.08)] border-[hsl(var(--signal-dead)/0.4)]" : "surface"
      )}
    >
      <span className="text-xs font-mono text-text-tertiary w-6 shrink-0">#{result.attempt}</span>
      <div className="flex gap-1 sm:gap-1.5 flex-1">
        {result.digits.map((d, i) => {
          const hidden = d < 0;
          return (
            <div
              key={i}
              className={cn(
                "size-9 sm:size-10 rounded-md surface-elevated border border-border grid place-items-center font-mono font-semibold text-base sm:text-lg",
                hidden && "text-text-tertiary blur-[1px]",
              )}
            >
              {hidden ? "?" : d}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-1.5">
        {PowerIcon && (
          <div className="size-5 grid place-items-center rounded-md surface-elevated border border-border">
            <PowerIcon className="size-3 text-text-secondary" />
          </div>
        )}
        <DeadBadge count={result.dead} size="sm" />
        <InjuredBadge count={result.injured} size="sm" />
      </div>
    </div>
  );
}
