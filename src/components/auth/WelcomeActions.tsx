"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { startTransition, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function WelcomeActions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);

  const next = searchParams.get("next") || "/";
  const loginHref = `/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`;
  const signupHref = `/signup${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`;

  const handleGuest = async () => {
    setIsPending(true);
    const response = await fetch("/api/auth/guest", { method: "POST" });
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      setIsPending(false);
      toast.error("Could not start a guest session", {
        description: body?.error ?? "Please try again or sign up instead.",
      });
      return;
    }
    toast.success("Guest session started", {
      description: "Upgrade to a real account anytime to keep your progress safe.",
    });
    startTransition(() => {
      router.replace(next);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <Link
        href={loginHref}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-foreground text-sm font-medium text-background transition hover:opacity-90 ring-focus"
      >
        Sign in
      </Link>
      <Link
        href={signupHref}
        className="flex h-12 w-full items-center justify-center rounded-xl border border-border bg-background text-sm font-medium text-foreground transition hover:bg-inset ring-focus"
      >
        Create account
      </Link>

      <div
        role="separator"
        aria-orientation="horizontal"
        className="flex items-center gap-3 py-1 text-[11px] uppercase tracking-[0.24em] text-text-tertiary"
      >
        <span className="h-px flex-1 bg-border" />
        <span>or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={handleGuest}
        disabled={isPending}
        aria-busy={isPending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-inset text-sm font-medium text-text-secondary transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60 ring-focus"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <span>Starting guest session…</span>
          </>
        ) : (
          "Continue as guest"
        )}
      </button>
      <p className="text-center text-xs text-text-tertiary">
        Guests can play, earn coins, and use power-ups. Some features require a full account.
      </p>
    </div>
  );
}
