import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gift, Play, Puzzle, GraduationCap, User } from "lucide-react";
import { PageHeader, PageShell, SectionHeader, StatCard } from "@/components/app/page-shell";
import { CoinPill } from "@/components/ui/coin-pill";
import { TierBadge } from "@/components/ui/tier-badge";
import { getHomePageData } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Home",
  description: "Resume unfinished matches, claim daily drops, and keep your streak alive.",
  openGraph: {
    title: "Dead & Injured — Home",
    description: "Resume unfinished matches, claim daily drops, and keep your streak alive.",
    type: "website",
  },
};

const QUICK_LINKS = [
  { href: "/play", label: "Play", icon: Play },
  { href: "/puzzles", label: "Puzzles", icon: Puzzle },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/profile", label: "Me", icon: User },
];

function getGreeting(name: string) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  // Synthetic guest usernames look like `guest-abcdef12` — show "Player" until they upgrade.
  const isSyntheticGuest = !name || name === "guest" || /^guest-[a-z0-9]+$/i.test(name);
  const safeName = isSyntheticGuest ? "Player" : name;
  return `${greeting}, ${safeName}`;
}

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <PageShell>
      <PageHeader
        eyebrow="Daily board"
        title={getGreeting(data.user.username)}
        description="Return to the board, protect your streak, and finish the matches you left hanging."
        action={<CoinPill amount={data.wallet.balance} className="hidden sm:inline-flex" />}
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Current streak" value={data.streak} hint="Keep your daily run alive" />
        <StatCard label="Puzzle rating" value={data.rating} hint="Sharper reads, fewer wasted guesses" />
        <StatCard label="Wallet" value={String(data.wallet.balance)} hint={data.wallet.currency} />
      </section>

      <section className="hero-card grain">
        <div className="absolute right-4 top-4">
          <TierBadge tier="gold" />
        </div>
        <div className="relative z-10 space-y-5">
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.28em] text-text-tertiary">Today&apos;s puzzle</div>
            <h2 className="max-w-sm text-2xl leading-tight sm:text-3xl">{data.todayPuzzle.title}</h2>
            <p className="text-sm text-text-secondary">{data.todayPuzzle.detail}</p>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((tile) => (
              <div
                key={tile}
                className="guess-slot size-12 rounded-2xl text-lg text-text-tertiary sm:size-14"
                data-filled="false"
              >
                ?
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={data.todayPuzzle.href}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90 ring-focus"
            >
              Play daily
              <ArrowRight className="size-4" />
            </Link>
            <CoinPill amount={data.wallet.balance} className="sm:hidden" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader title="Continue" subtitle="Pick up where you left off." />
        {data.continueMatches.length > 0 ? (
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {data.continueMatches.map((match) => (
              <Link
                key={match.matchId}
                href="/play"
                className="min-w-[17rem] snap-start rounded-3xl border border-border surface p-4 shadow-sm transition hover:border-border-strong"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{match.mode}</div>
                    <div className="mt-1 text-xs text-text-tertiary">Opponent</div>
                    <div className="text-sm text-text-secondary">{match.opp}</div>
                  </div>
                  <span className="pill-chip">{match.result.toUpperCase()}</span>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs text-text-secondary">
                  <span>Result</span>
                  <span className="font-mono text-sm text-foreground">{match.change}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="section-shell text-sm text-text-secondary">No unfinished matches yet. Start a new board from Play.</div>
        )}
      </section>

      <section className="section-shell flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid size-10 place-items-center rounded-2xl bg-[hsl(var(--signal-injured)/0.14)] text-injured">
            <Gift className="size-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Daily power-up drop</div>
            <p className="mt-1 text-sm text-text-secondary">
              {data.dailyDrop ? `${data.dailyDrop.name} is ready to claim into your loadout.` : "Check back after your next completed puzzle."}
            </p>
          </div>
        </div>
        <Link href="/inventory" className="pill-chip shrink-0">
          View inventory
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="section-shell flex min-h-24 flex-col justify-between transition hover:border-border-strong">
            <Icon className="size-5 text-text-secondary" strokeWidth={1.8} />
            <div className="text-base font-semibold">{label}</div>
          </Link>
        ))}
      </section>
    </PageShell>
  );
}
