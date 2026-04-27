import type { PowerUp } from "@/lib/game";

export type PlayMode = "bot" | "online" | "friend" | "local";

export interface PlayStatsCard {
  label: "Daily Streak" | "Wins" | "Coins";
  value: string;
  sub: string;
}

export interface LearnChapter {
  id: string;
  title: string;
  lessons: number;
  status: "done" | "current" | "locked";
  href: string;
}

export interface PuzzleEntry {
  id: string;
  icon: "calendar" | "target" | "timer" | "brain";
  title: string;
  diff: string;
  time: string;
  solved: boolean;
  href: string;
}

export interface PuzzlesPageData {
  stats: {
    wins: number;
    streak: string;
    weeklySolved: number;
    weeklyTarget: number;
    weeklyProgress: number;
  };
  puzzles: PuzzleEntry[];
}

export interface SocialFriend {
  id: string;
  name: string;
  status: string;
  online: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  wins: number;
}

export interface ProfileSummary {
  id: string;
  username: string;
  email: string;
  initials: string;
  wins: number;
  rankLabel: string;
  joinedLabel: string;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface ProfilePageData {
  user: ProfileSummary;
  stats: Array<{ label: string; value: string }>;
  recentMatches: Array<{ matchId: string; opp: string; mode: string; result: "win" | "loss"; change: string }>;
  inventory: PowerUp[];
}

export interface GameSessionGuess {
  attempt: number;
  digits: number[];
  dead: number;
  injured: number;
  byViewer: boolean;
}

export interface GameSession {
  id: string;
  mode: PlayMode;
  status: string;
  canGuess: boolean;
  viewerPlayerId?: string | null;
  opponent: {
    initials: string;
    name: string;
    subtitle: string;
  };
  history: GameSessionGuess[];
  loadout: PowerUp[];
  streamUrl?: string | null;
  guessUrl?: string | null;
  powerupUrl?: string | null;
  practiceSessionId?: string | null;
}

export function isPlayMode(value: string): value is PlayMode {
  return ["bot", "online", "friend", "local"].includes(value);
}
