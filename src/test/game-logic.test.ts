import { describe, it, expect } from "vitest";
import {
  evaluateGuess,
  generateSecret,
  isValidSecret,
  secretValidationError,
} from "@/lib/game";

describe("evaluateGuess (dead/injured)", () => {
  // Mirrors the backend Player.guess_result evaluator.
  it.each([
    [[1, 2, 3, 4], [1, 2, 3, 4], { dead: 4, injured: 0 }], // perfect
    [[1, 2, 3, 4], [5, 6, 7, 8], { dead: 0, injured: 0 }], // nothing
    [[1, 2, 3, 4], [4, 3, 2, 1], { dead: 0, injured: 4 }], // full permutation
    [[1, 2, 3, 4], [1, 3, 5, 6], { dead: 1, injured: 1 }],
    [[1, 2, 3, 4], [3, 4, 9, 0], { dead: 0, injured: 2 }],
    [[1, 2, 3, 4], [1, 2, 3, 9], { dead: 3, injured: 0 }],
    [[1, 2, 3, 4], [1, 1, 1, 1], { dead: 1, injured: 0 }], // duplicate guess digits
  ])("evaluateGuess(%j, %j) -> %j", (secret, guess, expected) => {
    expect(evaluateGuess(secret as number[], guess as number[])).toEqual(expected);
  });
});

describe("isValidSecret", () => {
  it("accepts 4 unique digits", () => {
    expect(isValidSecret("0246")).toBe(true);
    expect(isValidSecret("9081")).toBe(true);
  });
  it("rejects wrong length, non-digits, and duplicates", () => {
    expect(isValidSecret("123")).toBe(false);
    expect(isValidSecret("12345")).toBe(false);
    expect(isValidSecret("12a4")).toBe(false);
    expect(isValidSecret("1123")).toBe(false);
  });
});

describe("secretValidationError", () => {
  it("returns null for empty and for valid", () => {
    expect(secretValidationError("")).toBeNull();
    expect(secretValidationError("0246")).toBeNull();
  });
  it("flags duplicates, shortfall, and overflow", () => {
    expect(secretValidationError("1123")).toBe("Digits must be unique");
    expect(secretValidationError("12")).toBe("2 more digits");
    expect(secretValidationError("123")).toBe("1 more digit");
  });
});

describe("generateSecret", () => {
  it("always produces a valid unique secret", () => {
    for (let i = 0; i < 200; i++) {
      expect(isValidSecret(generateSecret(4).join(""))).toBe(true);
    }
  });
});
