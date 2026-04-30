import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-shell";

export const metadata: Metadata = {
  title: "Bot Setup",
  description: "Configure a bot match before entering the active board.",
};

export default function BotConfigurePage() {
  return (
    <PageShell className="max-w-4xl">
      <PageHeader
        eyebrow="vs Bot"
        title="Configure your match"
        description="Start a bot match with the standard four-digit rules."
      />
      <section className="section-shell space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="stat-card">
            <div className="text-[11px] uppercase tracking-[0.22em] text-text-tertiary">Difficulty</div>
            <div className="mt-2 text-lg font-semibold">Classic bot</div>
          </div>
          <div className="stat-card">
            <div className="text-[11px] uppercase tracking-[0.22em] text-text-tertiary">Code length</div>
            <div className="mt-2 text-lg font-semibold">4 digits</div>
          </div>
        </div>
        <Link href="/play/bot" className="pill-chip w-fit">
          Enter match shell
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </PageShell>
  );
}
