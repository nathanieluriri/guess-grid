import { useState } from "react";
import { cn } from "@/lib/utils";

const FRIENDS = [
  { name: "alex_n", status: "In match · vs Bot", online: true },
  { name: "lia.42", status: "Online", online: true },
  { name: "spectre", status: "Last seen 12m ago", online: false },
  { name: "morrigan", status: "In ranked queue", online: true },
];

const LEADERS = [
  { rank: 1, name: "deductio", rating: 2412 },
  { rank: 2, name: "minds.eye", rating: 2387 },
  { rank: 3, name: "kael", rating: 2341 },
  { rank: 4, name: "tessera", rating: 2298 },
  { rank: 5, name: "vox", rating: 2256 },
];

export default function Social() {
  const [tab, setTab] = useState<"friends" | "leaderboard">("friends");
  return (
    <div className="container max-w-4xl py-6 sm:py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl tracking-tight">Social</h1>
        <p className="text-text-secondary">Friends, clubs, and leaderboards.</p>
      </header>

      <div className="inline-flex p-1 rounded-lg surface border border-border">
        {(["friends", "leaderboard"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 h-8 rounded-md text-sm capitalize transition",
              tab === t ? "bg-foreground text-background" : "text-text-secondary"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "friends" ? (
        <div className="space-y-2">
          {FRIENDS.map((f, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl surface border border-border p-3">
              <div className="relative">
                <div className="size-10 rounded-full surface-elevated border-2 border-border-strong grid place-items-center font-mono text-xs font-semibold uppercase">
                  {f.name.slice(0, 2)}
                </div>
                <span
                  className={cn(
                    "absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[hsl(var(--bg-base))]",
                    f.online ? "bg-[hsl(var(--signal-dead))]" : "bg-text-tertiary"
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{f.name}</div>
                <div className="text-xs text-text-tertiary">{f.status}</div>
              </div>
              <button className="text-xs h-8 px-3 rounded-md surface-elevated hover:bg-foreground hover:text-background transition">
                Challenge
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl surface border border-border overflow-hidden">
          {LEADERS.map((l) => (
            <div key={l.rank} className="flex items-center gap-4 p-3.5 border-b border-border last:border-0">
              <span className="font-mono text-sm w-6 text-text-tertiary">#{l.rank}</span>
              <div className="size-8 rounded-full surface-elevated border border-border grid place-items-center font-mono text-[10px] font-semibold uppercase">
                {l.name.slice(0, 2)}
              </div>
              <span className="flex-1 font-medium">{l.name}</span>
              <span className="font-mono font-semibold">{l.rating}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
