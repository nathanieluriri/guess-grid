import { cn } from "@/lib/utils";
import { Skull, Bandage } from "lucide-react";

interface BadgeProps {
  count: number;
  size?: "sm" | "md";
}

export function DeadBadge({ count, size = "md" }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-mono font-semibold",
        "bg-[hsl(var(--signal-dead))] text-[hsl(var(--signal-dead-foreground))]",
        size === "sm" ? "px-1.5 h-5 text-[11px]" : "px-2 h-6 text-xs"
      )}
      aria-label={`${count} Dead`}
    >
      <Skull className={size === "sm" ? "size-2.5" : "size-3"} strokeWidth={2.5} />
      <span className="animate-count-up">{count}</span>
    </div>
  );
}

export function InjuredBadge({ count, size = "md" }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-mono font-semibold",
        "bg-[hsl(var(--signal-injured))] text-[hsl(var(--signal-injured-foreground))]",
        size === "sm" ? "px-1.5 h-5 text-[11px]" : "px-2 h-6 text-xs"
      )}
      aria-label={`${count} Injured`}
    >
      <Bandage className={size === "sm" ? "size-2.5" : "size-3"} strokeWidth={2.5} />
      <span className="animate-count-up">{count}</span>
    </div>
  );
}
