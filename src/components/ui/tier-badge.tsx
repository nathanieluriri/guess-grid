import { cn } from "@/lib/utils";

export type Tier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

const TIER_STYLES: Record<Tier, string> = {
  bronze: "border-[hsl(24_32%_36%/0.45)] bg-[hsl(24_32%_24%/0.28)] text-[hsl(24_42%_78%)]",
  silver: "border-[hsl(220_10%_56%/0.45)] bg-[hsl(220_12%_28%/0.24)] text-[hsl(220_10%_82%)]",
  gold: "border-[hsl(42_64%_52%/0.48)] bg-[hsl(42_64%_22%/0.24)] text-[hsl(42_84%_76%)]",
  platinum: "border-[hsl(186_40%_54%/0.45)] bg-[hsl(186_42%_22%/0.22)] text-[hsl(186_52%_78%)]",
  diamond: "border-[hsl(201_74%_58%/0.5)] bg-[hsl(201_74%_24%/0.22)] text-[hsl(201_88%_78%)]",
};

export function TierBadge({
  tier,
  className,
}: {
  tier: Tier;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2.5 text-[10px] font-semibold uppercase tracking-[0.2em]",
        TIER_STYLES[tier],
        className,
      )}
    >
      {tier}
    </span>
  );
}
