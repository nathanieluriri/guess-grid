"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ResendVerificationButton() {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);
    try {
      const response = await fetch("/api/auth/verify-email/resend", {
        method: "POST",
        credentials: "include",
      });
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        verificationEmail?: "queued" | "delayed" | null;
        error?: string | null;
      } | null;

      if (!response.ok) {
        toast.error("Couldn't resend verification email", {
          description: body?.error ?? "Try again in a few minutes.",
        });
        return;
      }

      if (body?.verificationEmail === "delayed") {
        toast.warning("Verification email not sent", {
          description: "We couldn't reach the email service. Try again in a few minutes.",
          duration: 8000,
        });
      } else {
        toast.success("Verification email sent", {
          description: "Check your inbox — the link is valid for a short window.",
        });
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="rounded-2xl surface-elevated border border-[hsl(var(--signal-injured)/0.3)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">Email not verified</div>
          <p className="mt-1 text-xs text-text-secondary">
            Verify your email to unlock matchmaking and ranked play.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          aria-busy={isPending}
          className="inline-flex h-9 items-center gap-2 rounded-lg surface px-3 text-xs font-medium ring-focus hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Mail className="size-3.5" aria-hidden="true" />
          )}
          <span>{isPending ? "Sending..." : "Resend verification"}</span>
        </button>
      </div>
    </div>
  );
}
