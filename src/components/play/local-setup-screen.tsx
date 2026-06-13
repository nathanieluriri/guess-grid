"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api/client";
import { isValidSecret } from "@/lib/game";
import { SecretInput } from "@/components/play/secret-input";
import type { GameSession } from "@/lib/api/mock-data";

export function LocalSetupScreen() {
  const router = useRouter();
  const [localSecrets, setLocalSecrets] = useState({ creator: "", joiner: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const creatorValid = isValidSecret(localSecrets.creator);
  const joinerValid = isValidSecret(localSecrets.joiner);
  const bothValid = creatorValid && joinerValid;

  async function startLocalMatch() {
    if (!bothValid || isSubmitting) {
      setError("Both players need a 4 unique-digit secret");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const response = await apiRequest<GameSession>("/games/local", {
      method: "POST",
      body: JSON.stringify({ creator_secret: localSecrets.creator, joiner_secret: localSecrets.joiner }),
    });
    setIsSubmitting(false);

    if (response.error || !response.data) {
      const message = response.error ?? "Request failed";
      setError(message);
      toast.error("Unable to start local match", { description: message });
      return;
    }

    router.push("/play/local");
    router.refresh();
  }

  return (
    <section className="section-shell space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <SecretInput
          value={localSecrets.creator}
          onChange={(next) => {
            setLocalSecrets((prev) => ({ ...prev, creator: next }));
            if (error) setError(null);
          }}
          label="Player one secret"
          placeholder="1234"
          disabled={isSubmitting}
        />
        <SecretInput
          value={localSecrets.joiner}
          onChange={(next) => {
            setLocalSecrets((prev) => ({ ...prev, joiner: next }));
            if (error) setError(null);
          }}
          label="Player two secret"
          placeholder="5678"
          disabled={isSubmitting}
        />
      </div>

      <p className="text-xs text-text-tertiary">
        Hand the device back and forth — each player only enters and guesses on their own turn.
      </p>

      {error ? (
        <p className="text-sm text-[hsl(var(--signal-danger))]" role="alert">
          {error}
        </p>
      ) : null}

      <Button onClick={startLocalMatch} disabled={isSubmitting || !bothValid} className="h-12 w-full text-base sm:w-auto">
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" /> Starting…
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            Start local match <ArrowRight className="size-4" />
          </span>
        )}
      </Button>
    </section>
  );
}
