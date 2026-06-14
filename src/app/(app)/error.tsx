"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RotateCcw, Loader2 } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[(app) error boundary]", error);
    }
  }, [error]);

  // A plain reset() only re-renders the same (still-failing) server component.
  // Refresh the server data first, then clear the boundary, so a transient
  // failure actually recovers instead of bouncing straight back.
  const handleRetry = () => {
    setRetrying(true);
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  const busy = isPending || retrying;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl surface border border-border p-8 text-center shadow-lg animate-scale-in">
        <h2 className="mb-2 text-2xl font-semibold tracking-tight">Something broke</h2>
        <p className="mb-6 text-sm text-text-secondary">
          The board failed to load. We&apos;ll retry the latest data — or head back and pick a mode.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            disabled={busy}
            aria-busy={busy}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background ring-focus transition active:scale-[0.97] hover:opacity-90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
            {busy ? "Retrying…" : "Try again"}
          </button>
          <Link
            href="/play"
            className="inline-flex h-10 items-center rounded-full border border-border px-4 text-sm font-medium ring-focus transition active:scale-[0.97] hover:border-border-strong"
          >
            Back to Play
          </Link>
        </div>
        {error.digest ? (
          <p className="mt-6 font-mono text-[11px] text-text-tertiary">ref · {error.digest}</p>
        ) : null}
      </div>
    </div>
  );
}
