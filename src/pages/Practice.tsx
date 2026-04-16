import { Link } from "react-router-dom";
import { Infinity as InfIcon, Lightbulb, Sliders, Sparkles } from "lucide-react";

const PRESETS = [
  { icon: InfIcon, title: "Unlimited Attempts", desc: "Take as long as you need. No timer, no pressure." },
  { icon: Lightbulb, title: "Hint-Assisted", desc: "Get nudged toward the right deduction when stuck." },
  { icon: Sliders, title: "Custom Length", desc: "3 to 8 digits. Build any difficulty you like." },
  { icon: Sparkles, title: "Power-Up Test Range", desc: "Try every power-up against a practice bot." },
];

export default function Practice() {
  return (
    <div className="container max-w-4xl py-6 sm:py-10 space-y-8">
      <div className="flex items-center justify-between gap-3">
        <header className="space-y-2">
          <h1 className="text-3xl sm:text-4xl tracking-tight">Practice</h1>
          <p className="text-text-secondary">Sandbox mode. Results don't affect your rating.</p>
        </header>
        <span className="text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-full surface-elevated text-text-secondary">
          Unranked
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {PRESETS.map((p, i) => (
          <Link
            key={i}
            to="/game"
            className="rounded-2xl surface border border-border p-5 hover:border-border-strong transition ring-focus group"
          >
            <div className="size-10 rounded-lg surface-elevated grid place-items-center mb-3 group-hover:bg-foreground group-hover:text-background transition">
              <p.icon className="size-4" strokeWidth={1.8} />
            </div>
            <h3 className="font-medium mb-1">{p.title}</h3>
            <p className="text-sm text-text-secondary">{p.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
