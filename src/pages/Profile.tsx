import { Edit2, Trophy } from "lucide-react";
import { POWER_UPS, RARITY_LABELS } from "@/lib/powerups";
import { PowerUpTile } from "@/components/game/PowerUpTile";

const STATS = [
  { label: "Matches", value: "342" },
  { label: "Win Rate", value: "61%" },
  { label: "Avg. Attempts", value: "5.4" },
  { label: "Puzzle Rating", value: "1,412" },
  { label: "Current Streak", value: "12d" },
  { label: "Best Streak", value: "47d" },
];

const RECENT = [
  { opp: "alex_n", mode: "Ranked", result: "win", change: "+14" },
  { opp: "Bot · Expert", mode: "vs Bot", result: "loss", change: "—" },
  { opp: "lia.42", mode: "Casual", result: "win", change: "+0" },
  { opp: "morrigan", mode: "Blitz", result: "loss", change: "−8" },
];

export default function Profile() {
  return (
    <div className="container max-w-5xl py-6 sm:py-10 space-y-8">
      {/* Header */}
      <header className="rounded-2xl surface border border-border p-5 sm:p-6 flex items-center gap-4 sm:gap-6">
        <div className="relative shrink-0">
          <div className="size-16 sm:size-20 rounded-full surface-elevated border-2 border-foreground grid place-items-center font-mono font-bold text-xl">
            MK
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 h-5 rounded-full bg-foreground text-background text-[10px] font-semibold uppercase tracking-wider grid place-items-center">
            Silver II
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl tracking-tight">mason.k</h1>
          <div className="text-text-secondary text-sm flex items-center gap-2 mt-1">
            <Trophy className="size-3.5" />
            <span className="font-mono font-semibold text-foreground">1,247</span>
            <span>·</span>
            <span>Joined Mar 2024</span>
          </div>
        </div>
        <button className="size-9 grid place-items-center rounded-lg surface-elevated border border-border ring-focus" aria-label="Edit profile">
          <Edit2 className="size-4" />
        </button>
      </header>

      {/* Stats */}
      <section>
        <h2 className="text-sm font-medium uppercase tracking-wider text-text-tertiary mb-3">Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-xl surface border border-border p-3">
              <div className="text-[10px] text-text-tertiary uppercase tracking-wider">{s.label}</div>
              <div className="font-mono font-semibold text-lg mt-1">{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent matches */}
      <section>
        <h2 className="text-sm font-medium uppercase tracking-wider text-text-tertiary mb-3">Recent matches</h2>
        <div className="rounded-2xl surface border border-border overflow-hidden">
          {RECENT.map((m, i) => (
            <div key={i} className="flex items-center gap-3 p-3.5 border-b border-border last:border-0">
              <div className="size-8 rounded-full surface-elevated border border-border grid place-items-center font-mono text-[10px] font-semibold uppercase shrink-0">
                {m.opp.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{m.opp}</div>
                <div className="text-xs text-text-tertiary">{m.mode}</div>
              </div>
              <span
                className={
                  "text-[10px] font-semibold uppercase tracking-wider px-2 h-5 rounded-full grid place-items-center " +
                  (m.result === "win"
                    ? "bg-[hsl(var(--signal-dead)/0.15)] text-[hsl(var(--signal-dead))]"
                    : "surface-elevated text-text-secondary")
                }
              >
                {m.result}
              </span>
              <span className="font-mono text-sm w-12 text-right">{m.change}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Power-ups */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-text-tertiary">Power-up Inventory</h2>
          <button className="text-xs h-8 px-3 rounded-md surface-elevated hover:bg-foreground hover:text-background transition">
            Equip Loadout
          </button>
        </div>
        <div className="rounded-2xl surface border border-border p-5">
          {(["common", "uncommon", "rare", "epic"] as const).map((rarity) => {
            const items = POWER_UPS.filter((p) => p.rarity === rarity);
            return (
              <div key={rarity} className="mb-5 last:mb-0">
                <div className="text-[11px] uppercase tracking-wider text-text-tertiary mb-2.5">{RARITY_LABELS[rarity]}</div>
                <div className="flex flex-wrap gap-3">
                  {items.map((p) => (
                    <PowerUpTile key={p.id} powerUp={p} size="md" />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
