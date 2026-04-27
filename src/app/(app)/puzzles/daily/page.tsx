import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-shell";
import { TierBadge } from "@/components/ui/tier-badge";
import { getPuzzlesPageData } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Daily Puzzle",
  description: "Open today’s featured Dead & Injured puzzle and keep the streak alive.",
};

export default async function DailyPuzzlePage() {
  const data = await getPuzzlesPageData();
  const dailyPuzzle = data.puzzles[0] ?? null;

  return (
    <PageShell className="max-w-4xl">
      <PageHeader
        eyebrow="Today"
        title="Daily Puzzle"
        description="A single featured board for today’s streak. Clear it cleanly, then move back into the wider ladder."
      />

      <section className="hero-card space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <TierBadge tier="bronze" />
          <span className="pill-chip">~2 min</span>
        </div>
        <div>
          <h2 className="text-2xl">{dailyPuzzle?.title ?? "Fresh board ready"}</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {dailyPuzzle ? `${dailyPuzzle.diff} · ${dailyPuzzle.time}` : "Today’s board will appear here once puzzle data is available."}
          </p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((tile) => (
            <div key={tile} className="guess-slot size-12 rounded-2xl text-lg text-text-tertiary" data-filled="false">
              ?
            </div>
          ))}
        </div>
        <Link href={dailyPuzzle?.href ?? "/puzzles"} className="pill-chip w-fit">
          Open board
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </PageShell>
  );
}
