import { cookies } from "next/headers";
import { buildApiUrl } from "@/lib/api/client";
import type {
  GameSession,
  LearnChapter,
  PlayMode,
  ProfilePageData,
  PuzzlesPageData,
  SocialFriend,
  LeaderboardEntry,
} from "@/lib/api/mock-data";
import type { PowerUp } from "@/lib/game";

type FetchCachePolicy = { cache: "no-store" } | { next: { revalidate: number } };

async function cookieHeader() {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

async function fetchFromBackend<T>(
  path: string,
  init?: RequestInit,
  cachePolicy: FetchCachePolicy = { cache: "no-store" },
): Promise<T | null> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      cookie: await cookieHeader(),
      "Content-Type": "application/json",
    },
    ...cachePolicy,
  }).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  const payload = (await response.json().catch(() => null)) as { data?: T } | null;
  return payload?.data ?? null;
}

function getStatValue(stats: ProfilePageData["stats"], label: string, fallback: string) {
  return stats.find((item) => item.label === label)?.value ?? fallback;
}

export async function getWalletData(): Promise<{ balance: number; currency: string }> {
  const wallet = await fetchFromBackend<{ balance: number; currency: string }>("/wallet/me");
  return {
    balance: wallet?.balance ?? 0,
    currency: wallet?.currency ?? "coins",
  };
}

export async function getLearnPageData(): Promise<LearnChapter[]> {
  const curriculum = await fetchFromBackend<{ chapters: LearnChapter[] }>(
    "/curriculum",
    undefined,
    { next: { revalidate: 3600 } },
  );
  return curriculum?.chapters ?? [];
}

export async function getPuzzlesPageData(): Promise<PuzzlesPageData> {
  const puzzles = await fetchFromBackend<PuzzlesPageData>("/puzzles", undefined, {
    next: { revalidate: 300 },
  });
  return (
    puzzles ?? {
      stats: { wins: 0, streak: "0d", weeklySolved: 0, weeklyTarget: 21, weeklyProgress: 0 },
      puzzles: [],
    }
  );
}

export async function getSocialPageData(): Promise<{ friends: SocialFriend[]; leaders: LeaderboardEntry[] }> {
  const social = await fetchFromBackend<{ friends: SocialFriend[]; leaders: LeaderboardEntry[] }>("/friends");
  return social ?? { friends: [], leaders: [] };
}

export async function getProfilePageData(): Promise<ProfilePageData> {
  const profile = await fetchFromBackend<ProfilePageData>("/users/me/profile");
  if (profile) {
    return profile;
  }

  return {
    user: {
      id: "guest",
      username: "guest",
      email: "guest@example.com",
      initials: "GS",
      wins: 0,
      rankLabel: "Guest",
      joinedLabel: "Joined recently",
    },
    stats: [],
    recentMatches: [],
    inventory: [],
  };
}

export async function getHomePageData() {
  const [profile, puzzles, wallet] = await Promise.all([
    getProfilePageData(),
    getPuzzlesPageData(),
    getWalletData(),
  ]);

  const inventoryWithCount = profile.inventory.filter((powerUp) => powerUp.count > 0);
  const dailyPuzzle = puzzles.puzzles[0] ?? null;

  return {
    user: profile.user,
    wallet,
    streak: getStatValue(profile.stats, "Current Streak", "0d"),
    rating: getStatValue(profile.stats, "Rating", "0"),
    todayPuzzle: dailyPuzzle
      ? {
          title: dailyPuzzle.title,
          href: dailyPuzzle.href === "/puzzles/daily" ? dailyPuzzle.href : "/puzzles/daily",
          detail: `${dailyPuzzle.diff} · ${dailyPuzzle.time}`,
        }
      : {
          title: "Daily Puzzle",
          href: "/puzzles/daily",
          detail: "Fresh board · ~2 min",
        },
    continueMatches: profile.recentMatches.slice(0, 3),
    dailyDrop: inventoryWithCount[0] ?? null,
  };
}

export async function getInventoryPageData(): Promise<{ inventory: PowerUp[]; loadout: PowerUp[] }> {
  const profile = await getProfilePageData();
  const owned = profile.inventory;
  const loadout = owned.filter((powerUp) => powerUp.count > 0).slice(0, 3);
  return { inventory: owned, loadout };
}

export async function getGameSession(mode: PlayMode): Promise<GameSession> {
  if (mode === "bot") {
    const session = await fetchFromBackend<GameSession>("/games/single", { method: "POST", body: JSON.stringify({}) });
    if (session) {
      return session;
    }
    return {
      id: "bot-unavailable",
      mode,
      status: "idle",
      canGuess: false,
      opponent: { initials: "BT", name: "Bot", subtitle: "Unable to start a server match right now" },
      history: [],
      loadout: [],
    };
  }

  if (mode === "online") {
    const status = await fetchFromBackend<{ status: "queued" | "matched" | "idle"; match_id?: string | null }>("/games/matchmaking/status");
    const queued =
      status?.status === "matched"
        ? status
        : await fetchFromBackend<{ status: "queued" | "matched" | "idle"; match_id?: string | null }>("/games/matchmaking/queue", {
            method: "POST",
            body: JSON.stringify({}),
          });
    if (queued?.match_id) {
      const session = await fetchFromBackend<GameSession>(`/matches/${queued.match_id}/session`);
      if (session) {
        return session;
      }
    }
    return {
      id: "queue",
      mode,
      status: queued?.status ?? "queued",
      canGuess: false,
      opponent: { initials: "RP", name: "Matchmaking", subtitle: "Looking for an opponent" },
      history: [],
      loadout: [],
    };
  }

  if (mode === "friend") {
    const session = await fetchFromBackend<GameSession>("/games/me/friend");
    if (session) {
      return session;
    }
    return {
      id: "friend-idle",
      mode,
      status: "idle",
      canGuess: false,
      opponent: { initials: "FR", name: "Friend Challenge", subtitle: "Create or accept a challenge from Social" },
      history: [],
      loadout: [],
    };
  }

  return {
    id: "local-setup",
    mode,
    status: "setup",
    canGuess: false,
    opponent: { initials: "LP", name: "Pass & Play", subtitle: "Enter both secrets to begin" },
    history: [],
    loadout: [],
  };
}

export async function getPuzzleDetail(id: string) {
  const page = await getPuzzlesPageData();
  return page.puzzles.find((puzzle) => puzzle.id === id) ?? null;
}

export async function getLessonDetail(chapterId: string, lessonId: string) {
  return fetchFromBackend<{ chapter_id: string; lesson_id: string; title: string; body: string }>(
    `/curriculum/${chapterId}/lessons/${lessonId}`,
    undefined,
    { next: { revalidate: 3600 } },
  );
}
