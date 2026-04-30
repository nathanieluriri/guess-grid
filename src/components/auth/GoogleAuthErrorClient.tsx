"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";

const REASON_MESSAGES: Record<string, string> = {
  missing_state: "The sign-in link is missing required state. Please start again.",
  missing_code: "Google didn't return an authorization code. Please try again.",
  exchange_failed: "We couldn't verify the response from Google. Please try again.",
  provisioning_failed: "We couldn't set up your account from your Google profile. Try again or contact support.",
  access_denied: "You declined to share your Google account. Sign in another way to continue.",
};

export function GoogleAuthErrorClient() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") ?? "";
  const message = REASON_MESSAGES[reason] ?? "Google sign-in could not be completed.";

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-[2rem] surface border border-border p-8 text-center">
        <div className="text-[11px] uppercase tracking-[0.24em] text-text-tertiary">
          Google sign-in
        </div>
        <AlertTriangle className="size-8 text-foreground" aria-hidden="true" />
        <h1 className="text-2xl tracking-tight">Sign-in failed</h1>
        <p className="text-sm leading-relaxed text-text-secondary">{message}</p>
        {reason ? (
          <p className="text-[11px] uppercase tracking-[0.24em] text-text-tertiary">
            Reason: {reason}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-4 text-sm font-medium text-background"
          >
            Back to sign in
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-text-secondary"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
