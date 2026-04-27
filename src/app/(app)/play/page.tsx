import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, Globe, Smartphone, UserPlus } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-shell";

export const metadata: Metadata = {
  title: "Play",
  description: "Choose your battlefield across bot, online, friend, and local Dead & Injured modes.",
};

const MODES = [
  {
    href: "/play/bot/configure",
    title: "vs Bot",
    subtitle: "5 difficulty tiers · offline focus",
    icon: Bot,
  },
  {
    href: "/play/online/queue",
    title: "Random Online",
    subtitle: "Ranked · casual · fast rematch",
    icon: Globe,
  },
  {
    href: "/play/friend",
    title: "Friend",
    subtitle: "Invite by link or private room",
    icon: UserPlus,
  },
  {
    href: "/play/local/setup",
    title: "Pass & Play",
    subtitle: "Same device · 2 players",
    icon: Smartphone,
  },
];

export default function PlayPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Modes"
        title="Play"
        description="Pick a mode, keep the choice fast, and get into the board without extra ceremony."
      />

      <section className="grid gap-3 lg:grid-cols-2">
        {MODES.map(({ href, title, subtitle, icon: Icon }) => (
          <Link key={href} href={href} className="list-row ring-focus hover:border-border-strong">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl surface-elevated">
              <Icon className="size-5 text-text-secondary" strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold">{title}</div>
              <div className="mt-1 truncate text-sm text-text-secondary">{subtitle}</div>
            </div>
            <ArrowRight className="size-4 text-text-tertiary" />
          </Link>
        ))}
      </section>
    </PageShell>
  );
}
