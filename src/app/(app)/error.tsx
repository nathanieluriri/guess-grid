"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[(app) error boundary]", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl surface border border-border p-8 text-center shadow-lg">
        <h2 className="mb-2 text-2xl font-semibold tracking-tight">Something broke</h2>
        <p className="mb-6 text-sm text-text-secondary">
          The board failed to load. Try again, or head back to a different mode.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background ring-focus hover:opacity-90"
          >
            <RotateCcw className="size-4" />
            Try again
          </button>
          <Link
            href="/play"
            className="inline-flex h-10 items-center rounded-full border border-border px-4 text-sm font-medium ring-focus hover:border-border-strong"
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
