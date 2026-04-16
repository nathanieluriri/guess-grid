import type { PowerUp } from "./game";
import {
  Waves,
  Hourglass,
  SkipForward,
  CloudFog,
  FlipHorizontal,
  Eye,
  EyeOff,
  Pin,
  Lock,
  ChevronsRight,
  Undo2,
  Shield,
  MessageCircle,
  VenetianMask,
  Ghost,
  type LucideIcon,
} from "lucide-react";

export const POWER_UP_ICONS: Record<string, LucideIcon> = {
  "static-screen": Waves,
  "time-drain": Hourglass,
  "skip-turn": SkipForward,
  fog: CloudFog,
  mirror: FlipHorizontal,
  "peek-in": Eye,
  "peek-out": EyeOff,
  pin: Pin,
  "lock-in": Lock,
  "extra-turn": ChevronsRight,
  undo: Undo2,
  shield: Shield,
  taunt: MessageCircle,
  "fake-feedback": VenetianMask,
  "ghost-guess": Ghost,
};

export const POWER_UPS: PowerUp[] = [
  { id: "static-screen", name: "Static Screen", description: "Opponent's tray shuffles for their next turn.", rarity: "common", category: "offensive", count: 3 },
  { id: "time-drain", name: "Time Drain", description: "Shave 10s off opponent's current turn.", rarity: "common", category: "offensive", count: 5 },
  { id: "skip-turn", name: "Skip Turn", description: "Opponent loses their next turn.", rarity: "rare", category: "offensive", count: 1 },
  { id: "fog", name: "Fog", description: "Opponent's last 2 guesses blur for 1 turn.", rarity: "uncommon", category: "offensive", count: 2 },
  { id: "mirror", name: "Mirror", description: "See opponent's next Dead/Injured count.", rarity: "rare", category: "offensive", count: 1 },
  { id: "peek-in", name: "Peek — One In", description: "Reveals one digit in the secret.", rarity: "uncommon", category: "defensive", count: 2 },
  { id: "peek-out", name: "Peek — One Out", description: "Reveals one digit not in the secret.", rarity: "common", category: "defensive", count: 4 },
  { id: "pin", name: "Pin", description: "Reveals position of one digit (not which).", rarity: "rare", category: "defensive", count: 1 },
  { id: "lock-in", name: "Lock-In", description: "Reveals one full digit + position pair.", rarity: "epic", category: "defensive", count: 0 },
  { id: "extra-turn", name: "Extra Turn", description: "Take two guesses this turn.", rarity: "uncommon", category: "defensive", count: 2 },
  { id: "undo", name: "Undo", description: "Remove your last guess from the board.", rarity: "rare", category: "defensive", count: 1 },
  { id: "shield", name: "Shield", description: "Block the next offensive power-up.", rarity: "uncommon", category: "defensive", count: 2 },
  { id: "taunt", name: "Taunt Emote", description: "Send a cosmetic emote to opponent.", rarity: "common", category: "meta", count: 8 },
  { id: "fake-feedback", name: "Fake Feedback", description: "Bluff opponent with a fake count for 3s.", rarity: "rare", category: "meta", count: 1 },
  { id: "ghost-guess", name: "Ghost Guess", description: "Submit a guess opponent sees as ???", rarity: "uncommon", category: "meta", count: 2 },
];

export const RARITY_LABELS: Record<string, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
};
