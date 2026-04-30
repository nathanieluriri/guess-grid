"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Swords,
  Puzzle,
  GraduationCap,
  Dumbbell,
  Users,
  User,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { apiRequest } from "@/lib/api/client";
import { CoinPill } from "@/components/ui/coin-pill";
import { ProfileMedia } from "@/components/profile/ProfileMedia";
import type { ProfileMediaKind } from "@/lib/api/mock-data";
import { useAuth } from "@/components/auth/AuthProvider";

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

interface NotificationItem {
  id: string;
  kind: string;
  title: string;
  body: string;
  unread: boolean;
  createdAt: number;
}

interface TopBarProfile {
  username: string;
  email: string;
  initials: string;
  wins: number;
  rankLabel: string;
  joinedLabel: string;
  avatar_url?: string | null;
  profile_media_url?: string | null;
  profile_media_kind?: ProfileMediaKind | null;
}

function relativeNotificationTime(timestamp: number) {
  const seconds = Math.max(0, Math.floor(Date.now() / 1000) - timestamp);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function TopBar() {
  const router = useRouter();
  const { user, isGuest, requireRealUser } = useAuth();
  const guestExpiryLabel = useMemo(() => {
    if (!isGuest || !user?.expires_at) return null;
    const remainingMs = user.expires_at * 1000 - Date.now();
    if (remainingMs <= 0) return "expired";
    const days = Math.floor(remainingMs / 86_400_000);
    if (days >= 2) return `expires in ${days}d`;
    if (days === 1) return "expires in 1d";
    const hours = Math.max(1, Math.floor(remainingMs / 3_600_000));
    return `expires in ${hours}h`;
  }, [isGuest, user?.expires_at]);
  const guestExpiryUrgent = useMemo(() => {
    if (!isGuest || !user?.expires_at) return false;
    const remainingMs = user.expires_at * 1000 - Date.now();
    return remainingMs <= 2 * 86_400_000;
  }, [isGuest, user?.expires_at]);
  const [wallet, setWallet] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [profile, setProfile] = useState<TopBarProfile | null>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    void apiRequest<{ balance: number }>("/wallet/me").then((response) => {
      if (response.data?.balance !== undefined) {
        setWallet(response.data.balance);
      }
    });
    void apiRequest<{ unreadCount: number; items: NotificationItem[] }>("/notifications").then((response) => {
      if (response.data) {
        setNotificationCount(response.data.unreadCount ?? 0);
        setNotifications(response.data.items ?? []);
      }
    });
    void apiRequest<{ user: TopBarProfile }>("/users/me/profile").then((response) => {
      if (response.data?.user) {
        setProfile(response.data.user);
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

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => item.unread),
    [notifications],
  );

  async function markNotificationRead(notificationId: string) {
    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, unread: false } : item)),
    );
    setNotificationCount((current) => Math.max(0, current - 1));

    const response = await apiRequest<{ status: string }>(`/notifications/${notificationId}/read`, {
      method: "POST",
      body: JSON.stringify({}),
    });

    if (response.error) {
      setNotifications((current) =>
        current.map((item) => (item.id === notificationId ? { ...item, unread: true } : item)),
      );
      setNotificationCount((current) => current + 1);
    }
  }

  async function logout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

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
        {isGuest ? (
          <button
            type="button"
            onClick={() => requireRealUser("save your progress")}
            className="hidden h-9 items-center rounded-full bg-foreground px-4 text-xs font-semibold uppercase tracking-[0.18em] text-background transition hover:opacity-90 ring-focus sm:inline-flex"
          >
            Sign up
          </button>
        ) : null}
        <CoinPill amount={wallet} className="hidden sm:inline-flex" />
        <div
          className="relative"
          onMouseEnter={() => setNotificationsOpen(true)}
          onMouseLeave={() => setNotificationsOpen(false)}
        >
          <button
            type="button"
            className="relative size-9 grid place-items-center rounded-md hover:surface-elevated transition ring-focus"
            aria-label="Notifications"
            onClick={() => setNotificationsOpen((current) => !current)}
          >
            <Bell className="size-4" />
            {notificationCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-foreground text-background text-[10px] grid place-items-center">
                {notificationCount}
              </span>
            ) : null}
          </button>

          {notificationsOpen ? (
            <div className="absolute right-0 top-11 z-50 w-[22rem] rounded-2xl border border-border surface shadow-lg">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <div className="text-sm font-semibold">Notifications</div>
                  <div className="text-xs text-text-tertiary">
                    {unreadNotifications.length > 0 ? `${unreadNotifications.length} unread` : "All caught up"}
                  </div>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.unread) {
                          void markNotificationRead(item.id);
                        }
                      }}
                      className={cn(
                        "w-full rounded-xl px-3 py-3 text-left transition hover:surface-elevated",
                        item.unread && "bg-elevated/70",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">{item.title}</div>
                          <div className="mt-1 text-xs text-text-secondary">{item.body}</div>
                        </div>
                        <div className="shrink-0 text-[11px] text-text-tertiary">
                          {relativeNotificationTime(item.createdAt)}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-6 text-sm text-text-secondary">No notifications yet.</div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div
          className="relative"
          onMouseEnter={() => setProfileOpen(true)}
          onMouseLeave={() => setProfileOpen(false)}
        >
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-full border border-border bg-elevated pl-1 pr-2 ring-focus transition hover:border-border-strong"
            aria-label="Profile menu"
            onClick={() => setProfileOpen((current) => !current)}
          >
            <ProfileMedia
              src={profile?.profile_media_url ?? profile?.avatar_url ?? null}
              kind={profile?.profile_media_kind ?? null}
              initials={profile?.initials ?? "ME"}
              size={28}
            />
            <ChevronDown className="size-4 text-text-tertiary" />
          </button>

          {profileOpen && profile ? (
            <div className="absolute right-0 top-11 z-50 w-72 rounded-2xl border border-border surface p-2 shadow-lg">
              <div className="rounded-xl px-3 py-3">
                <div className="flex items-center gap-3">
                  <ProfileMedia
                    src={profile.profile_media_url ?? profile.avatar_url ?? null}
                    kind={profile.profile_media_kind ?? null}
                    initials={profile.initials}
                    size={44}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{profile.username}</div>
                    <div className="truncate text-xs text-text-secondary">
                      {isGuest
                        ? guestExpiryLabel
                          ? `Guest · ${guestExpiryLabel}`
                          : "Guest session"
                        : profile.email}
                    </div>
                    {isGuest && guestExpiryUrgent && guestExpiryLabel ? (
                      <div className="mt-0.5 truncate text-[11px] text-destructive">
                        Create an account to keep your progress.
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-border p-2">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-text-tertiary">Wins</div>
                    <div className="mt-1 font-mono text-sm font-semibold">{profile.wins}</div>
                  </div>
                  <div className="rounded-xl border border-border p-2">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-text-tertiary">Rank</div>
                    <div className="mt-1 truncate text-sm font-semibold">{profile.rankLabel}</div>
                  </div>
                  <div className="rounded-xl border border-border p-2">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-text-tertiary">Joined</div>
                    <div className="mt-1 truncate text-sm font-semibold">{profile.joinedLabel.replace("Joined ", "")}</div>
                  </div>
                </div>
              </div>

              <div className="my-1 h-px bg-border" />

              <Link
                href="/profile"
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:surface-elevated"
              >
                <span>View profile</span>
                <User className="size-4 text-text-tertiary" />
              </Link>
              <Link
                href="/profile/settings"
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:surface-elevated"
              >
                <span>Settings</span>
                <Settings2 className="size-4 text-text-tertiary" />
              </Link>
              {isGuest ? (
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    requireRealUser("save your progress");
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition hover:surface-elevated"
                >
                  <span>Create account</span>
                  <User className="size-4 text-text-tertiary" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={logout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:surface-elevated disabled:opacity-60"
                >
                  <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
                  <LogOut className="size-4 text-text-tertiary" />
                </button>
              )}
            </div>
          ) : null}
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
  const [wallet, setWallet] = useState(0);
  const [profile, setProfile] = useState<TopBarProfile | null>(null);

  useEffect(() => {
    void apiRequest<{ balance: number }>("/wallet/me").then((response) => {
      if (response.data?.balance !== undefined) {
        setWallet(response.data.balance);
      }
    });
    void apiRequest<{ user: TopBarProfile; stats: Array<{ label: string; value: string }> }>("/users/me/profile").then((response) => {
      if (response.data?.user) {
        setProfile(response.data.user);
      }
    });
  }, []);

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
          <span className="font-mono text-foreground font-semibold">{profile?.wins ?? 0}</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>Rank</span>
          <span className="font-mono text-foreground font-semibold">{profile?.rankLabel ?? "Unranked"}</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>Coins</span>
          <span className="font-mono text-foreground font-semibold">{wallet}</span>
        </div>
      </div>
    </aside>
  );
}
