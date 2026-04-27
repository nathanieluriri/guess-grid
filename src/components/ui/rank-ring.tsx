import { cn } from "@/lib/utils";

export function RankRing({
  initials,
  progress,
  size = 88,
  className,
}: {
  initials: string;
  progress: number;
  size?: number;
  className?: string;
}) {
  const strokeWidth = 7;
  const normalizedRadius = (size - strokeWidth) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={normalizedRadius}
          fill="none"
          stroke="hsl(var(--border-strong) / 0.35)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={normalizedRadius}
          fill="none"
          stroke="hsl(var(--signal-injured))"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeWidth={strokeWidth}
        />
      </svg>
      <div className="absolute inset-[10px] grid place-items-center rounded-full border border-border bg-elevated font-mono text-base font-semibold shadow-sm">
        {initials}
      </div>
    </div>
  );
}
