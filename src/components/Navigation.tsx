"use client";

import { useDeferredValue, useEffect, useState } from "react";
import {
  Swords,
  Puzzle,
  GraduationCap,
  Dumbbell,
  Users,
  User,
  Search,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { apiRequest } from "@/lib/api/client";
import { CoinPill } from "@/components/ui/coin-pill";

const NAV_ITEMS = [
  { to: "/play", label: "Play", icon: Swords },
  { to: "/puzzles", label: "Puzzles", icon: Puzzle },
  { to: "/learn", label: "Learn", icon: GraduationCap },
  { to: "/practice", label: "Practice", icon: Dumbbell },
  { to: "/social", label: "Social", icon: Users },
  { to: "/profile", label: "Me", icon: User },
];

const MOBILE_NAV = NAV_ITEMS.filter((i) => i.to !== "/social");

interface SearchHit {
  id: string;
  kind: "player" | "puzzle";
  label: string;
  subtitle: string;
  href: string;
}

export function TopBar() {
  const [wallet, setWallet] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [results, setResults] = useState<SearchHit[]>([]);

  useEffect(() => {
    void apiRequest<{ balance: number }>("/wallet/me").then((response) => {
      if (response.data?.balance !== undefined) {
        setWallet(response.data.balance);
      }
    });
    void apiRequest<{ unreadCount: number }>("/notifications").then((response) => {
      if (response.data?.unreadCount !== undefined) {
        setNotificationCount(response.data.unreadCount);
      }
    });
  }, []);

  useEffect(() => {
    if (!deferredQuery.trim()) {
      setResults([]);
      return;
    }
    void apiRequest<{ query: string; results: SearchHit[] }>(`/search?q=${encodeURIComponent(deferredQuery)}`).then((response) => {
      setResults(response.data?.results ?? []);
    });
  }, [deferredQuery]);

  return (
    <header className="sticky top-0 z-40 h-14 surface border-b border-border flex items-center px-4 gap-3 sm:gap-4">
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-lg bg-foreground text-background grid place-items-center font-mono font-bold text-sm">
          D&I
        </div>
        <span className="hidden sm:inline font-semibold tracking-tight">Dead & Injured</span>
      </div>

      <div className="hidden md:flex flex-1 max-w-md mx-auto">
        <div className="w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search players and puzzles"
            placeholder="Search players, puzzles..."
            className="w-full h-9 pl-9 pr-3 rounded-md bg-inset border border-border text-sm placeholder:text-text-tertiary ring-focus"
          />
          {results.length > 0 ? (
            <div className="absolute left-0 right-0 top-11 rounded-xl surface border border-border shadow-lg overflow-hidden">
              {results.map((result) => (
                <a key={`${result.kind}-${result.id}`} href={result.href} className="block px-3 py-2 hover:surface-elevated transition">
                  <div className="text-sm">{result.label}</div>
                  <div className="text-xs text-text-tertiary">{result.subtitle}</div>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 shrink-0">
        <CoinPill amount={wallet} className="hidden sm:inline-flex" />
        <button className="relative size-9 grid place-items-center rounded-md hover:surface-elevated transition ring-focus" aria-label="Notifications">
          <Bell className="size-4" />
          {notificationCount > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-foreground text-background text-[10px] grid place-items-center">
              {notificationCount}
            </span>
          ) : null}
        </button>
        <div className="size-9 rounded-full bg-elevated border-2 border-border-strong grid place-items-center font-mono text-xs font-semibold">
          MK
        </div>
      </div>
    </header>
  );
}

export function MobileTabs() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 surface border-t border-border h-16 grid grid-cols-5 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--bg-surface)/0.92)]">
      {MOBILE_NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
              isActive ? "text-foreground" : "text-text-tertiary"
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn("size-5 transition-transform", isActive && "scale-110")} strokeWidth={isActive ? 2.4 : 1.8} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export function DesktopRail() {
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 surface border-r border-border h-[calc(100vh-3.5rem)] sticky top-14 px-3 py-4 gap-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-elevated text-foreground"
                : "text-text-secondary hover:bg-elevated/60 hover:text-foreground"
            )
          }
        >
          <Icon className="size-4" strokeWidth={1.8} />
          <span>{label}</span>
        </NavLink>
      ))}

      <div className="mt-auto rounded-xl border border-border p-3 text-xs space-y-2">
        <div className="flex justify-between text-text-secondary">
          <span>Wins</span>
          <span className="font-mono text-foreground font-semibold">Live</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>Streak</span>
          <span className="font-mono text-foreground font-semibold">Live</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>Coins</span>
          <span className="font-mono text-foreground font-semibold">Live</span>
        </div>
      </div>
    </aside>
  );
}
