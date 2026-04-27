"use client";

import { useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

interface PracticeSessionScreenProps {
  sessionId: string;
}

interface PracticeGuessResponse {
  dead: number;
  injured: number;
  solved: boolean;
  hint?: string | null;
}

export default function PracticeSessionScreen({ sessionId }: PracticeSessionScreenProps) {
  const [guess, setGuess] = useState("");
  const [history, setHistory] = useState<PracticeGuessResponse[]>([]);
  const [isPending, setIsPending] = useState(false);

  async function submitGuess() {
    if (guess.length < 3) {
      toast.error("Enter a valid guess");
      return;
    }
    setIsPending(true);
    const response = await apiRequest<PracticeGuessResponse>(`/practice/session/${sessionId}/guess`, {
      method: "POST",
      body: JSON.stringify({ guess }),
    });
    setIsPending(false);
    if (response.error || !response.data) {
      toast.error("Unable to submit practice guess", { description: response.error ?? "Request failed" });
      return;
    }
    setHistory((prev) => [...prev, response.data!]);
    setGuess("");
  }

  return (
    <div className="container max-w-3xl py-6 sm:py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl tracking-tight">Practice Session</h1>
        <p className="text-text-secondary">Backend-scored sandbox play with optional hints.</p>
      </header>

      <div className="rounded-2xl surface border border-border p-5 space-y-4">
        <div className="flex gap-2">
          <input
            value={guess}
            onChange={(event) => setGuess(event.target.value.replace(/\D/g, "").slice(0, 8))}
            className="h-12 flex-1 rounded-xl bg-inset px-4 text-sm ring-focus"
            placeholder="Enter your guess"
          />
          <Button onClick={submitGuess} disabled={isPending} className="h-12 px-6">
            {isPending ? "Submitting..." : "Guess"}
          </Button>
        </div>
        <div className="space-y-2">
          {history.length === 0 ? (
            <div className="text-sm text-text-secondary">No guesses yet.</div>
          ) : (
            history.map((result, index) => (
              <div key={index} className="rounded-xl surface-elevated border border-border p-3 text-sm">
                <div className="font-mono">{result.dead} Dead / {result.injured} Injured</div>
                {result.hint ? <div className="text-text-secondary mt-1">{result.hint}</div> : null}
                {result.solved ? <div className="mt-1 text-[hsl(var(--signal-dead))]">Solved</div> : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
