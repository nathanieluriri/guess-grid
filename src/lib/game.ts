export type DigitState = "available" | "in-play" | "eliminated" | "present" | "locked";

export interface DigitInfo {
  digit: number;
  state: DigitState;
  eliminatedOnAttempt?: number;
  lockedSlot?: number;
}

export interface GuessResult {
  attempt: number;
  digits: number[];
  dead: number;
  injured: number;
  powerUpUsed?: PowerUpId;
}

export type PowerUpId =
  | "static-screen"
  | "time-drain"
  | "skip-turn"
  | "fog"
  | "mirror"
  | "peek-in"
  | "peek-out"
  | "pin"
  | "lock-in"
  | "extra-turn"
  | "undo"
  | "shield"
  | "taunt"
  | "fake-feedback"
  | "ghost-guess";

export type Rarity = "common" | "uncommon" | "rare" | "epic";
export type Category = "offensive" | "defensive" | "meta";

export interface PowerUp {
  id: PowerUpId;
  name: string;
  description: string;
  rarity: Rarity;
  category: Category;
  count: number;
}

export function evaluateGuess(secret: number[], guess: number[]): { dead: number; injured: number } {
  let dead = 0;
  let injured = 0;
  const secretCounts: Record<number, number> = {};
  const guessCounts: Record<number, number> = {};

  for (let i = 0; i < secret.length; i++) {
    if (secret[i] === guess[i]) {
      dead++;
    } else {
      secretCounts[secret[i]] = (secretCounts[secret[i]] || 0) + 1;
      guessCounts[guess[i]] = (guessCounts[guess[i]] || 0) + 1;
    }
  }

  for (const digit in guessCounts) {
    if (secretCounts[digit]) {
      injured += Math.min(secretCounts[digit], guessCounts[digit]);
    }
  }

  return { dead, injured };
}

export function generateSecret(length: number, allowDuplicates = false): number[] {
  const result: number[] = [];
  const used = new Set<number>();
  while (result.length < length) {
    const d = Math.floor(Math.random() * 10);
    if (!allowDuplicates && used.has(d)) continue;
    used.add(d);
    result.push(d);
  }
  return result;
}
