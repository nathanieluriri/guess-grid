import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-shell";
import { CoinPill } from "@/components/ui/coin-pill";
import { RankRing } from "@/components/ui/rank-ring";
import { TierBadge, type Tier } from "@/components/ui/tier-badge";
import { ProfileActions } from "@/components/profile/ProfileActions";
import { AccountStatusBanner } from "@/components/profile/AccountStatusBanner";
import { getProfilePageData, getWalletData } from "@/lib/api/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Profile",
  description: "Review your Dead & Injured stats, recent matches, and power-up inventory.",
};

function inferTier(rankLabel: string): Tier {
  const normalized = rankLabel.toLowerCase();
  if (normalized.includes("diamond")) return "diamond";
  if (normalized.includes("platinum")) return "platinum";
  if (normalized.includes("gold")) return "gold";
  if (normalized.includes("silver")) return "silver";
  return "bronze";
}

function inferProgress(rankLabel: string) {
  if (rankLabel.includes("III")) return 72;
  if (rankLabel.includes("II")) return 54;
  if (rankLabel.includes("I")) return 32;
  return 64;
}

export default async function ProfilePage() {
  const [data, wallet] = await Promise.all([getProfilePageData(), getWalletData()]);
  const tier = inferTier(data.user.rankLabel);
  const rankProgress = inferProgress(data.user.rankLabel);

  return (
    <PageShell>
      <PageHeader eyebrow="Status" title="Profile" action={<ProfileActions />} />

      <AccountStatusBanner />

      <section className="section-shell flex flex-col gap-5 sm:flex-row sm:items-center">
        <RankRing
          initials={data.user.initials}
          progress={rankProgress}
          className="shrink-0"
          mediaUrl={data.user.profile_media_url ?? data.user.avatar_url}
          mediaKind={data.user.profile_media_kind}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl sm:text-3xl">{data.user.username}</h2>
            <TierBadge tier={tier} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
            <div className="inline-flex items-center gap-1.5">
              <Trophy className="size-4" />
              <span className="font-mono text-foreground">{data.user.wins} wins</span>
            </div>
            <span>{data.user.joinedLabel}</span>
          </div>
          <div className="mt-4">
            <CoinPill amount={wallet.balance} delta={14} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {data.stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "stat-card",
              stat.label.toLowerCase().includes("win") && "border-[hsl(var(--signal-dead)/0.3)]",
              stat.label.toLowerCase().includes("streak") && "border-[hsl(var(--signal-injured)/0.3)]",
            )}
          >
            <div className="text-[11px] uppercase tracking-[0.22em] text-text-tertiary">{stat.label}</div>
            <div className="mt-2 font-mono text-xl font-semibold">{stat.value}</div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-tertiary">Recent matches</h2>
          <Link href="/inventory" className="pill-chip">
            Loadout
          </Link>
        </div>
        <div className="space-y-3">
          {data.recentMatches.map((match) => (
            <div key={match.matchId} className="list-row">
              <div className="grid size-10 shrink-0 place-items-center rounded-full surface-elevated font-mono text-xs font-semibold">
                {match.opp.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{match.opp}</div>
                <div className="mt-1 text-xs text-text-secondary">{match.mode}</div>
              </div>
              <span
                className={cn(
                  "pill-chip h-7 px-2.5 text-[10px]",
                  match.result === "win"
                    ? "border-[hsl(var(--signal-dead)/0.3)] bg-[hsl(var(--signal-dead)/0.12)] text-dead"
                    : "text-text-secondary",
                )}
              >
                {match.result.toUpperCase()}
              </span>
              <div className="font-mono text-sm">{match.change}</div>
            </div>
          ))}
        </div>
      </section>

      <Link href="/inventory" className="list-row ring-focus hover:border-border-strong">
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold">Inventory</div>
          <div className="mt-1 text-sm text-text-secondary">
            {data.inventory.filter((powerUp) => powerUp.count > 0).slice(0, 3).length}/3 equipped for the next match
          </div>
        </div>
        <ChevronRight className="size-4 text-text-tertiary" />
      </Link>
    </PageShell>
  );
}
