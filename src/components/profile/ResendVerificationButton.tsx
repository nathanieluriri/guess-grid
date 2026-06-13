"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function ResendVerificationButton() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleClick = async () => {
    setStatus("sending");
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

      // 409 means the account is already verified (commonly: verified in another
      // tab). Reconcile the UI instead of surfacing a scary error — refreshing
      // re-reads the session and drops this banner.
      if (response.status === 409) {
        toast.success("Your email is already verified");
        router.refresh();
        return;
      }

      if (!response.ok) {
        toast.error("Couldn't resend verification email", {
          description: body?.error ?? "Try again in a few minutes.",
        });
        setStatus("idle");
        return;
      }

      if (body?.verificationEmail === "delayed") {
        toast.warning("Verification email not sent", {
          description: "We couldn't reach the email service. Try again in a few minutes.",
          duration: 8000,
        });
        setStatus("idle");
        return;
      }

      toast.success("Verification email sent", {
        description: "Check your inbox — the link is valid for a short window.",
      });
      setStatus("sent");
    } catch {
      toast.error("Couldn't resend verification email", {
        description: "Check your connection and try again.",
      });
      setStatus("idle");
    }
  };

  const isPending = status === "sending";
  const sent = status === "sent";

  return (
    <div className="rounded-2xl surface-elevated border border-[hsl(var(--signal-injured)/0.3)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">{sent ? "Verification email sent" : "Email not verified"}</div>
          <p className="mt-1 text-xs text-text-secondary">
            {sent
              ? "Check your inbox and spam folder, then refresh once you've confirmed."
              : "Verify your email to unlock matchmaking and ranked play."}
          </p>
        </div>
        {sent ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 items-center gap-1.5 px-2 text-xs font-medium text-[hsl(var(--signal-dead))]">
              <CheckCircle2 className="size-3.5" aria-hidden="true" /> Sent
            </span>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="inline-flex h-9 items-center rounded-lg surface px-3 text-xs font-medium ring-focus hover:border-border-strong"
            >
              I&apos;ve verified
            </button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
