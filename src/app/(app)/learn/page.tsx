import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronRight, Lock } from "lucide-react";
import { PageHeader, PageShell } from "@/components/app/page-shell";
import { getLearnPageData } from "@/lib/api/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Learn",
  description: "Study the deduction patterns, mechanics, and strategy behind Dead & Injured.",
};

export default async function LearnPage() {
  const chapters = await getLearnPageData();
  const currentIndex = chapters.findIndex((chapter) => chapter.status === "current");
  const currentChapter = currentIndex >= 0 ? chapters[currentIndex] : chapters[0] ?? null;

  return (
    <PageShell className="max-w-4xl">
      <PageHeader
        eyebrow="Curriculum"
        title="Learn"
        description={`Chapter ${Math.max(currentIndex + 1, 1)} of ${Math.max(chapters.length, 1)} · Build deduction speed one pattern at a time.`}
      />

      {currentChapter ? (
        <section className="hero-card">
          <div className="space-y-4">
            <div className="text-[11px] uppercase tracking-[0.28em] text-text-tertiary">Continue</div>
            <div>
              <h2 className="text-2xl">{currentChapter.title}</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Lesson path in progress · {Math.max(currentIndex + 1, 1)} of {chapters.length}
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-elevated">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--signal-danger)),hsl(var(--signal-injured)))]"
                style={{ width: `${((Math.max(currentIndex, 0) + 1) / Math.max(chapters.length, 1)) * 100}%` }}
              />
            </div>
            <Link href={currentChapter.href} className="pill-chip w-fit">
              Continue lesson
            </Link>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        {chapters.length === 0 ? (
          <div className="section-shell py-10 text-center">
            <p className="text-sm text-text-secondary">Lessons are on the way</p>
            <p className="mt-1 text-xs text-text-tertiary">The curriculum isn&apos;t available right now — check back soon.</p>
          </div>
        ) : (
          chapters.map((chapter, index) => {
          const isDone = chapter.status === "done";
          const isCurrent = chapter.status === "current";
          const isLocked = chapter.status === "locked";

          return (
            <Link
              key={chapter.id}
              href={chapter.href}
              className={cn(
                "list-row ring-focus",
                isCurrent && "border-border-strong",
                isLocked && "pointer-events-none opacity-50",
              )}
            >
              <div
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-full border text-sm font-semibold",
                  isDone && "border-[hsl(var(--signal-dead)/0.45)] bg-[hsl(var(--signal-dead)/0.14)] text-dead",
                  isCurrent && "border-border-strong bg-transparent text-foreground",
                  isLocked && "border-border bg-elevated text-text-tertiary",
                )}
              >
                {isDone ? <Check className="size-4" /> : isLocked ? <Lock className="size-4" /> : index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold">{chapter.title}</div>
                <div className="mt-1 text-sm text-text-secondary">
                  {isDone ? "Complete" : isCurrent ? `In progress · ${chapter.lessons} lessons` : "Locked"}
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
