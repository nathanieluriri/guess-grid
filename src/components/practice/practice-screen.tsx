"use client";

import { useRouter } from "next/navigation";
import { Infinity as InfIcon, Lightbulb, Sliders, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, PageShell } from "@/components/app/page-shell";
import { apiRequest } from "@/lib/api/client";

const PRESETS = [
  {
    icon: InfIcon,
    title: "Unlimited Attempts",
    desc: "Take as long as you need. No timer, no pressure.",
    payload: { length: 4, allow_duplicates: false, unlimited_attempts: true, hints_enabled: false, powerup_test: false },
  },
  {
    icon: Lightbulb,
    title: "Hint-Assisted",
    desc: "Get nudged toward the right deduction when stuck.",
    payload: { length: 4, allow_duplicates: false, unlimited_attempts: true, hints_enabled: true, powerup_test: false },
  },
  {
    icon: Sliders,
    title: "Custom Length",
    desc: "Six digits for a deeper deduction tree.",
    payload: { length: 6, allow_duplicates: false, unlimited_attempts: true, hints_enabled: false, powerup_test: false },
  },
  {
    icon: Sparkles,
    title: "Power-Up Test Range",
    desc: "Try every power-up against a practice bot.",
    payload: { length: 4, allow_duplicates: false, unlimited_attempts: true, hints_enabled: true, powerup_test: true },
  },
];

export function PracticeScreen() {
  const router = useRouter();

  async function startSession(payload: (typeof PRESETS)[number]["payload"]) {
    const response = await apiRequest<{ session_id: string }>("/practice/session", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (response.error || !response.data?.session_id) {
      toast.error("Unable to start practice", { description: response.error ?? "Request failed" });
      return;
    }
    router.push(`/practice/${response.data.session_id}`);
  }

  return (
    <PageShell className="max-w-5xl">
      <PageHeader
        eyebrow="Sandbox"
        title="Practice"
        description="Warm up in unranked presets. No leaderboard pressure, no rating cost, just repetition and reads."
        action={<span className="pill-chip hidden sm:inline-flex">Unranked</span>}
      />

      <section className="grid gap-3 sm:grid-cols-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.title}
            type="button"
            onClick={() => startSession(preset.payload)}
            className="section-shell text-left transition hover:border-border-strong ring-focus"
          >
            <div className="grid size-10 place-items-center rounded-2xl surface-elevated">
              <preset.icon className="size-4 text-text-secondary" strokeWidth={1.8} />
            </div>
            <h3 className="mt-4 text-base font-semibold">{preset.title}</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{preset.desc}</p>
          </button>
        ))}
      </section>
    </PageShell>
  );
}
