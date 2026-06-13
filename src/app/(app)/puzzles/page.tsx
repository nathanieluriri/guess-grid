import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ChevronRight, Target, Timer, Brain } from "lucide-react";
import { PageHeader, PageShell, SectionHeader } from "@/components/app/page-shell";
import { TierBadge, type Tier } from "@/components/ui/tier-badge";
import { getPuzzlesPageData } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Puzzles",
  description: "Sharpen specific Dead & Injured skills through curated daily and challenge puzzles.",
};

const ICONS = {
  calendar: Calendar,
  target: Target,
  timer: Timer,
  brain: Brain,
} as const;

function inferTier(index: number): Tier {
  const tiers: Tier[] = ["bronze", "silver", "gold", "platinum", "diamond"];
  return tiers[index % tiers.length];
}

export default async function PuzzlesPage() {
  const data = await getPuzzlesPageData();
  const dailyPuzzle = data.puzzles[0] ?? null;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Puzzle ladder"
        title="Puzzles"
        description="Sharpen your deduction with short focused boards and a weekly completion rhythm."
        action={<div className="pill-chip hidden sm:inline-flex">Wins {data.stats.wins}</div>}
      />

      <section className="hero-card">
        <SectionHeader title="This week" subtitle={`${data.stats.weeklySolved}/${data.stats.weeklyTarget} boards cleared`} />
        <div className="mt-5 space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div className="font-mono text-3xl font-semibold leading-none">
              {data.stats.weeklySolved}
              <span className="text-base text-text-secondary"> / {data.stats.weeklyTarget}</span>
            </div>
            <div className="text-sm text-text-secondary">{data.stats.streak} streak</div>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-elevated">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--signal-danger)),hsl(var(--signal-injured)))]"
              style={{ width: `${data.stats.weeklyProgress}%` }}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {dailyPuzzle ? (
          <Link href="/puzzles/daily" className="list-row sticky top-[4.5rem] z-10 border-border-strong bg-[hsl(var(--bg-surface)/0.96)] backdrop-blur ring-focus">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[hsl(var(--signal-danger)/0.12)] text-injured">
              <Calendar className="size-5" strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-base font-semibold">Daily Puzzle</div>
                <TierBadge tier="bronze" />
              </div>
              <div className="mt-1 truncate text-sm text-text-secondary">Today · {dailyPuzzle.time}</div>
            </div>
            <span className="pill-chip">Today</span>
          </Link>
        ) : null}

        {data.puzzles.length === 0 ? (
          <div className="section-shell py-10 text-center">
            <p className="text-sm text-text-secondary">No puzzles available right now</p>
            <p className="mt-1 text-xs text-text-tertiary">Check back soon — fresh boards are added regularly.</p>
          </div>
        ) : (
          data.puzzles.map((puzzle, index) => {
          const Icon = ICONS[puzzle.icon];
          const tier = inferTier(index);

          return (
            <Link key={puzzle.id} href={puzzle.href} className="list-row ring-focus hover:border-border-strong">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl surface-elevated">
                <Icon className="size-5 text-text-secondary" strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="truncate text-base font-semibold">{puzzle.title}</div>
                  <TierBadge tier={tier} />
                </div>
                <div className="mt-1 text-sm text-text-secondary">
                  {puzzle.diff} · {puzzle.time}
                </div>
              </div>
              <ChevronRight className="size-4 text-text-tertiary" />
            </Link>
          );
          })
        )}
      </section>
    </PageShell>
  );
}
