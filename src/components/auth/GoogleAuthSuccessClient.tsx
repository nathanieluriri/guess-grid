"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type ExchangeResponse = {
  ok?: boolean;
  user?: { username?: string } | null;
  error?: string;
};

export function GoogleAuthSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const consumedRef = useRef(false);
  const [status, setStatus] = useState<"working" | "error">("working");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (consumedRef.current) {
      return;
    }
    consumedRef.current = true;

    const code = searchParams.get("code");
    let next = searchParams.get("next");
    if (!next && typeof window !== "undefined") {
      try {
        next = window.sessionStorage.getItem("googleAuthNext");
        window.sessionStorage.removeItem("googleAuthNext");
      } catch {
        next = null;
      }
    }
    const redirectTo = next && next.startsWith("/") ? next : "/play";

    if (!code) {
      setStatus("error");
      setErrorMessage("Sign-in link is missing the exchange code.");
      return;
    }

    (async () => {
      try {
        const response = await fetch("/api/auth/google/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
          cache: "no-store",
        });
        const body = (await response.json().catch(() => null)) as ExchangeResponse | null;
        if (!response.ok || !body?.ok) {
          throw new Error(body?.error ?? "Unable to complete Google sign-in.");
        }
        toast.success("Signed in", {
          description: `Session ready for ${body.user?.username ?? "your account"}.`,
        });
        router.replace(redirectTo);
        router.refresh();
      } catch (error) {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Sign-in failed.");
      }
    })();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-[2rem] surface border border-border p-8 text-center">
        <div className="text-[11px] uppercase tracking-[0.24em] text-text-tertiary">
          Google sign-in
        </div>
        {status === "working" ? (
          <>
            <Loader2 className="size-8 animate-spin text-foreground" aria-hidden="true" />
            <h1 className="text-2xl tracking-tight">Completing sign-in…</h1>
            <p className="text-sm leading-relaxed text-text-secondary">
              Hold tight while we hand off your session. You&apos;ll be redirected automatically.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl tracking-tight">We couldn&apos;t finish signing you in</h1>
            <p className="text-sm leading-relaxed text-text-secondary">
              {errorMessage ?? "Something went wrong while exchanging the sign-in code."}
            </p>
            <Link
              href="/login"
              className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-4 text-sm font-medium text-background"
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
