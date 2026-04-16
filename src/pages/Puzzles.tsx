import { Link } from "react-router-dom";
import { Calendar, Target, Timer, Brain, CheckCircle2, ChevronRight } from "lucide-react";

const PUZZLES = [
  { icon: Calendar, title: "Daily Puzzle", diff: "Silver", time: "~3 min", solved: false },
  { icon: Target, title: "Find the Number #284", diff: "Gold", time: "~5 min", solved: true },
  { icon: Brain, title: "Minimum Attempts", diff: "Platinum", time: "~8 min", solved: false },
  { icon: Timer, title: "Timed Deduction", diff: "Bronze", time: "~2 min", solved: true },
  { icon: Brain, title: "Logic Cascade", diff: "Diamond", time: "~12 min", solved: false },
  { icon: Target, title: "Tutorial: Drag Mechanics", diff: "Bronze", time: "~2 min", solved: true },
];

export default function Puzzles() {
  return (
    <div className="container max-w-5xl py-6 sm:py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl tracking-tight">Puzzles</h1>
        <p className="text-text-secondary">Sharpen specific skills. No timer pressure unless you want it.</p>
      </header>

      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <div className="rounded-2xl surface border border-border p-4">
          <div className="text-xs text-text-tertiary uppercase tracking-wider">Puzzle Rating</div>
          <div className="font-mono text-2xl font-semibold mt-1">1,412</div>
        </div>
        <div className="rounded-2xl surface border border-border p-4">
          <div className="text-xs text-text-tertiary uppercase tracking-wider">Streak</div>
          <div className="font-mono text-2xl font-semibold mt-1">7d</div>
        </div>
        <div className="rounded-2xl surface border border-border p-4">
          <div className="text-xs text-text-tertiary uppercase tracking-wider">This Week</div>
          <div className="font-mono text-2xl font-semibold mt-1">12 / 21</div>
          <div className="h-1 rounded-full surface-elevated mt-2 overflow-hidden">
            <div className="h-full bg-foreground" style={{ width: "57%" }} />
          </div>
        </div>
      </div>

      <div className="grid gap-2.5">
        {PUZZLES.map((p, i) => (
          <Link
            key={i}
            to="/game"
            className="group flex items-center gap-4 rounded-xl surface border border-border p-4 hover:border-border-strong transition ring-focus"
          >
            <div className="size-10 rounded-lg surface-elevated grid place-items-center">
              <p.icon className="size-4 text-text-secondary" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{p.title}</div>
              <div className="text-xs text-text-tertiary mt-0.5 flex gap-3">
                <span>{p.diff}</span>
                <span>•</span>
                <span>{p.time}</span>
              </div>
            </div>
            {p.solved && <CheckCircle2 className="size-4 text-text-secondary" />}
            <ChevronRight className="size-4 text-text-tertiary group-hover:text-foreground transition" />
          </Link>
        ))}
      </div>
    </div>
  );
}
