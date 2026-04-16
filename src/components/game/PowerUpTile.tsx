import { cn } from "@/lib/utils";
import { POWER_UP_ICONS } from "@/lib/powerups";
import type { PowerUp } from "@/lib/game";

interface PowerUpTileProps {
  powerUp: PowerUp;
  onUse?: () => void;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

const RARITY_RING: Record<string, string> = {
  common: "border-border",
  uncommon: "border-border-strong",
  rare: "border-foreground/40",
  epic: "border-foreground/70 animate-shimmer",
};

export function PowerUpTile({ powerUp, onUse, size = "md", showCount = true }: PowerUpTileProps) {
  const Icon = POWER_UP_ICONS[powerUp.id];
  const dim =
    size === "lg" ? "size-16" : size === "sm" ? "size-10" : "size-12";
  const iconSize = size === "lg" ? "size-7" : size === "sm" ? "size-4" : "size-5";

  return (
    <button
      onClick={onUse}
      disabled={powerUp.count === 0}
      className={cn(
        "relative rounded-xl border-2 surface flex items-center justify-center transition-all ring-focus",
        dim,
        RARITY_RING[powerUp.rarity],
        powerUp.count === 0 ? "opacity-30 cursor-not-allowed" : "hover:scale-105 hover:shadow-md"
      )}
      title={`${powerUp.name} — ${powerUp.description}`}
      aria-label={`${powerUp.name}, ${powerUp.count} remaining`}
    >
      {Icon && <Icon className={cn(iconSize, "text-foreground")} strokeWidth={1.6} />}
      {showCount && (
        <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-foreground text-background text-[10px] font-mono font-semibold grid place-items-center">
          {powerUp.count}
        </span>
      )}
    </button>
  );
}
