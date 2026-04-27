"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { PuzzleEntry } from "@/lib/api/mock-data";
import { apiRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

interface PuzzleDetailProps {
  puzzle: PuzzleEntry;
}

export default function PuzzleDetail({ puzzle }: PuzzleDetailProps) {
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState<Array<{ dead: number; injured: number; solved: boolean }>>([]);
  const [isPending, setIsPending] = useState(false);

  async function submitAttempt() {
    if (guess.length !== 4) {
      toast.error("Enter a 4-digit guess");
      return;
    }
    setIsPending(true);
    const response = await apiRequest<{ dead: number; injured: number; solved: boolean }>(`/puzzles/${puzzle.id}/attempt`, {
      method: "POST",
      body: JSON.stringify({ guess }),
    });
    setIsPending(false);
    if (response.error || !response.data) {
      toast.error("Unable to submit puzzle attempt", { description: response.error ?? "Request failed" });
      return;
    }
    setAttempts((prev) => [...prev, response.data!]);
    if (response.data.solved) {
      toast.success("Puzzle solved");
    }
    setGuess("");
  }

  return (
    <div className="container max-w-3xl py-6 sm:py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl tracking-tight">{puzzle.title}</h1>
        <p className="text-text-secondary">{puzzle.diff} · {puzzle.time}</p>
      </header>
      <div className="rounded-2xl surface border border-border p-5 space-y-4">
        <div className="flex gap-2">
          <input
            value={guess}
            onChange={(event) => setGuess(event.target.value.replace(/\D/g, "").slice(0, 4))}
            className="h-12 flex-1 rounded-xl bg-inset px-4 text-sm ring-focus"
            placeholder="Enter your guess"
          />
          <Button onClick={submitAttempt} disabled={isPending} className="h-12 px-6">
            {isPending ? "Submitting..." : "Try"}
          </Button>
        </div>
        <div className="space-y-2">
          {attempts.map((attempt, index) => (
            <div key={index} className="rounded-xl surface-elevated border border-border p-3 text-sm font-mono">
              {attempt.dead} Dead / {attempt.injured} Injured {attempt.solved ? "· solved" : ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
