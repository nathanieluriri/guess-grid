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
  /** True when the guess belongs to the viewing player (vs. the opponent). */
  byViewer?: boolean;
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

// These helpers remain as the offline fallback. Server-backed play modes
// should obtain secrets and guess results from the backend session APIs.
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

// Mirrors the backend `validate_code` rule (digits only, exact length, all
// unique) so the UI can validate inline before hitting the API.
export function isValidSecret(code: string, length = 4): boolean {
  return code.length === length && /^[0-9]+$/.test(code) && new Set(code).size === length;
}

export function secretValidationError(code: string, length = 4): string | null {
  if (code.length === 0) return null;
  if (!/^[0-9]*$/.test(code)) return "Digits only";
  if (new Set(code).size !== code.length) return "Digits must be unique";
  if (code.length < length) return `${length - code.length} more digit${length - code.length === 1 ? "" : "s"}`;
  if (code.length > length) return `Use exactly ${length} digits`;
  return null;
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
