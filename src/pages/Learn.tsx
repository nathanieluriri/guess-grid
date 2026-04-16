import { CheckCircle2, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const CHAPTERS = [
  { title: "How Dead & Injured works", lessons: 4, status: "done" },
  { title: "Using the digit tray", lessons: 5, status: "done" },
  { title: "Beginner strategies", lessons: 6, status: "current" },
  { title: "Deduction techniques", lessons: 8, status: "locked" },
  { title: "Probability thinking", lessons: 7, status: "locked" },
  { title: "Power-up tactics", lessons: 9, status: "locked" },
  { title: "Mind games & bluffing", lessons: 6, status: "locked" },
  { title: "Endgame patterns", lessons: 5, status: "locked" },
];

export default function Learn() {
  return (
    <div className="container max-w-3xl py-6 sm:py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl tracking-tight">Learn</h1>
        <p className="text-text-secondary">A linear path from first guess to grandmaster intuition.</p>
      </header>

      <div className="space-y-3">
        {CHAPTERS.map((c, i) => {
          const Icon = c.status === "done" ? CheckCircle2 : c.status === "locked" ? Lock : Circle;
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-4 rounded-xl surface border border-border p-4 transition",
                c.status === "current" && "border-border-strong",
                c.status === "locked" && "opacity-50"
              )}
            >
              <div className="size-10 rounded-lg surface-elevated grid place-items-center font-mono text-sm font-semibold">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-text-tertiary mt-0.5">{c.lessons} lessons</div>
              </div>
              <Icon className="size-5 text-text-secondary" strokeWidth={1.8} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
