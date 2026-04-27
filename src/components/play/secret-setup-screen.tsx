"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api/client";
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

  async function submitSecret() {
    if (secretInput.length !== 4) {
      toast.error("Enter a unique 4-digit secret");
      return;
    }

    setIsSubmitting(true);
    const response = await apiRequest<GameSession>(`/games/join/${sessionId}`, {
      method: "POST",
      body: JSON.stringify({ secret: secretInput }),
    });
    setIsSubmitting(false);

    if (response.error || !response.data) {
      toast.error("Unable to submit secret", { description: response.error ?? "Request failed" });
      return;
    }

    setSecretInput("");
    router.push(`/play/${mode}`);
    router.refresh();
  }

  return (
    <section className="section-shell max-w-xl space-y-4">
      <input
        value={secretInput}
        onChange={(event) => setSecretInput(event.target.value.replace(/\D/g, "").slice(0, 4))}
        className="h-12 w-full rounded-2xl bg-inset px-4 text-sm ring-focus"
        placeholder="1234"
        inputMode="numeric"
      />
      <Button onClick={submitSecret} disabled={isSubmitting} className="h-12 w-full">
        {isSubmitting ? "Submitting..." : "Submit secret"}
      </Button>
    </section>
  );
}
