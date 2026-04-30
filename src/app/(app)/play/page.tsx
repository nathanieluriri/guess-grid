import type { Metadata } from "next";
import { Bot, Globe, Smartphone, UserPlus } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-shell";
import { ModeTile } from "@/components/play/mode-tile";

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
    gate: "verified" as const,
    gateLabel: "queue for ranked play",
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
        {MODES.map(({ href, title, subtitle, icon, gate, gateLabel }) => (
          <ModeTile
            key={href}
            href={href}
            title={title}
            subtitle={subtitle}
            icon={icon}
            gate={gate}
            gateLabel={gateLabel}
          />
        ))}
      </section>
    </PageShell>
  );
}
