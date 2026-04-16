import { Link } from "react-router-dom";
import { Bot, Globe, UserPlus, Smartphone, Flame, Trophy, Coins } from "lucide-react";

const MODES = [
  {
    to: "/play/bot",
    icon: Bot,
    title: "vs Bot",
    desc: "Pick your difficulty and dial in the rules. Pure practice or full ranked feel.",
    tag: "Recommended",
  },
  {
    to: "/play/online",
    icon: Globe,
    title: "vs Random Player",
    desc: "Casual, Ranked, Blitz, or Classic. Auto-matched in seconds.",
    tag: "Live",
  },
  {
    to: "/play/friend",
    icon: UserPlus,
    title: "vs Friend",
    desc: "Invite by username, room code, or shareable link.",
  },
  {
    to: "/play/local",
    icon: Smartphone,
    title: "Pass & Play",
    desc: "Two players, one device. Privacy-shielded input + role swap.",
  },
];

export default function Play() {
  return (
    <div className="container max-w-5xl py-6 sm:py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl tracking-tight">Play</h1>
        <p className="text-text-secondary">Choose your battlefield. Every mode rewards sharper deduction.</p>
      </header>

      {/* Daily strip */}
      <section className="grid sm:grid-cols-3 gap-3">
        {[
          { icon: Flame, label: "Daily Streak", value: "12 days", sub: "+1 free power-up" },
          { icon: Trophy, label: "Rating", value: "1,247", sub: "Silver II" },
          { icon: Coins, label: "Coins", value: "1,284", sub: "Shop opens at 1,500" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl surface border border-border p-4 flex items-center gap-3">
            <div className="size-10 rounded-lg surface-elevated grid place-items-center">
              <s.icon className="size-4 text-text-secondary" strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-xs text-text-tertiary uppercase tracking-wider">{s.label}</div>
              <div className="font-mono font-semibold text-lg leading-tight">{s.value}</div>
              <div className="text-[11px] text-text-secondary">{s.sub}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        {MODES.map(({ to, icon: Icon, title, desc, tag }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl surface border border-border p-5 sm:p-6 hover:border-border-strong hover:-translate-y-0.5 transition-all ring-focus"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="size-12 rounded-xl surface-elevated grid place-items-center group-hover:bg-foreground group-hover:text-background transition-colors">
                <Icon className="size-5" strokeWidth={1.6} />
              </div>
              {tag && (
                <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full surface-elevated text-text-secondary">
                  {tag}
                </span>
              )}
            </div>
            <h3 className="text-xl mb-1.5">{title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
