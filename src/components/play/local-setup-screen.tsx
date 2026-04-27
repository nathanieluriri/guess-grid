"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api/client";
import type { GameSession } from "@/lib/api/mock-data";

export function LocalSetupScreen() {
  const router = useRouter();
  const [localSecrets, setLocalSecrets] = useState({ creator: "", joiner: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function startLocalMatch() {
    if (localSecrets.creator.length !== 4 || localSecrets.joiner.length !== 4) {
      toast.error("Enter both 4-digit secrets");
      return;
    }

    setIsSubmitting(true);
    const response = await apiRequest<GameSession>("/games/local", {
      method: "POST",
      body: JSON.stringify({ creator_secret: localSecrets.creator, joiner_secret: localSecrets.joiner }),
    });
    setIsSubmitting(false);

    if (response.error || !response.data) {
      toast.error("Unable to start local match", { description: response.error ?? "Request failed" });
      return;
    }

    router.push("/play/local");
    router.refresh();
  }

  return (
    <section className="section-shell space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-[11px] uppercase tracking-[0.22em] text-text-tertiary">Player one secret</span>
          <input
            value={localSecrets.creator}
            onChange={(event) => setLocalSecrets((prev) => ({ ...prev, creator: event.target.value.replace(/\D/g, "").slice(0, 4) }))}
            className="h-12 w-full rounded-2xl bg-inset px-4 text-sm ring-focus"
            placeholder="1234"
            inputMode="numeric"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-[11px] uppercase tracking-[0.22em] text-text-tertiary">Player two secret</span>
          <input
            value={localSecrets.joiner}
            onChange={(event) => setLocalSecrets((prev) => ({ ...prev, joiner: event.target.value.replace(/\D/g, "").slice(0, 4) }))}
            className="h-12 w-full rounded-2xl bg-inset px-4 text-sm ring-focus"
            placeholder="5678"
            inputMode="numeric"
          />
        </label>
      </div>

      <Button onClick={startLocalMatch} disabled={isSubmitting} className="h-12 w-full text-base sm:w-auto">
        {isSubmitting ? "Starting..." : "Start local match"}
        {!isSubmitting ? <ArrowRight className="ml-2 size-4" /> : null}
      </Button>
    </section>
  );
}
