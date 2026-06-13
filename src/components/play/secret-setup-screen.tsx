"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api/client";
import { isValidSecret } from "@/lib/game";
import { SecretInput } from "@/components/play/secret-input";
import type { GameSession, PlayMode } from "@/lib/api/mock-data";

export function SecretSetupScreen({
  mode,
  sessionId,
}: {
  mode: PlayMode;
  sessionId: string;
}) {
  const router = useRouter();
  const [secretInput, setSecretInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = isValidSecret(secretInput);

  async function submitSecret() {
    if (!valid || isSubmitting) {
      setError("Enter 4 unique digits");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const response = await apiRequest<GameSession>(`/games/join/${sessionId}`, {
      method: "POST",
      body: JSON.stringify({ secret: secretInput }),
    });
    setIsSubmitting(false);

    if (response.error || !response.data) {
      const message = response.error ?? "Request failed";
      setError(message);
      toast.error("Unable to submit secret", { description: message });
      return;
    }

    setSecretInput("");
    router.push(`/play/${mode}`);
    router.refresh();
  }

  return (
    <section className="section-shell max-w-xl space-y-5">
      <SecretInput
        value={secretInput}
        onChange={(next) => {
          setSecretInput(next);
          if (error) setError(null);
        }}
        label="Your secret code"
        autoFocus
        disabled={isSubmitting}
      />

      <div className="flex items-start gap-2 rounded-xl surface-elevated border border-border p-3 text-xs text-text-secondary">
        <ShieldCheck className="size-4 shrink-0 mt-0.5 text-text-tertiary" />
        <span>Your opponent never sees this code — they have to crack it. Pick 4 different digits.</span>
      </div>

      {error ? (
        <p className="text-sm text-[hsl(var(--signal-danger))]" role="alert">
          {error}
        </p>
      ) : null}

      <Button onClick={submitSecret} disabled={isSubmitting || !valid} className="h-12 w-full">
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" /> Submitting…
          </span>
        ) : (
          "Submit secret"
        )}
      </Button>
    </section>
  );
}
