"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const title = mode === "login" ? "Welcome back" : "Create your account";
  const subtitle =
    mode === "login"
      ? "Sign in to unlock protected routes, social play, and your profile shell."
      : "Create a Dead & Injured account and drop into the app without changing the existing visual language.";
  const nextPath = searchParams.get("next") || "/play";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password || (mode === "signup" && !username)) {
      toast.error("Missing fields", {
        description: "Fill every required field before continuing.",
      });
      return;
    }

    setIsPending(true);

    const payload = {
      username: username || email.split("@")[0],
      email,
      password,
    };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = (await response.json().catch(() => null)) as {
      error?: string;
      user?: { username: string };
      verificationEmail?: "queued" | "delayed";
    } | null;

    if (!response.ok) {
      setIsPending(false);
      toast.error("Authentication failed", {
        description: body?.error ?? "Unable to complete the request.",
      });
      return;
    }

    if (mode === "signup" && body?.verificationEmail === "delayed") {
      toast.warning("Account created — verification email not sent", {
        description:
          "We couldn't send your verification email right now. Once you can sign in, request a new link from your account.",
        duration: 8000,
      });
    } else {
      toast.success(mode === "login" ? "Signed in" : "Account created", {
        description: `Session ready for ${body?.user?.username ?? payload.username}.`,
      });
    }

    startTransition(() => {
      router.push(nextPath);
      router.refresh();
    });

    setIsPending(false);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden rounded-[2rem] surface border border-border p-8 lg:block">
          <div className="max-w-md space-y-6">
            <div className="inline-flex h-10 items-center rounded-full surface-elevated px-4 text-[11px] uppercase tracking-[0.24em] text-text-tertiary">
              Monochrome Strategy
            </div>
            <div className="space-y-3">
              <h1 className="text-5xl tracking-tight">Dead & Injured</h1>
              <p className="text-text-secondary leading-relaxed">
                The migration keeps the calm monochrome shell intact while adding a server-first Next.js foundation under it.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-text-secondary">
              <div className="rounded-2xl surface-elevated border border-border p-4">Protected social and profile routes now flow through HTTP-only session cookies.</div>
              <div className="rounded-2xl surface-elevated border border-border p-4">Server-backed auth, sessions, and protected routes now flow through the Next.js shell.</div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] surface border border-border p-6 shadow-lg sm:p-8">
          <div className="mb-8 space-y-2">
            <div className="text-[11px] uppercase tracking-[0.24em] text-text-tertiary">
              {mode === "login" ? "Access" : "Onboarding"}
            </div>
            <h2 className="text-3xl tracking-tight">{title}</h2>
            <p className="text-sm leading-relaxed text-text-secondary">{subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset disabled={isPending} className="space-y-4 disabled:opacity-70">
              {mode === "signup" && (
                <label className="block space-y-2">
                  <span className="text-xs uppercase tracking-wider text-text-tertiary">Username</span>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                    className="h-12 w-full rounded-xl bg-inset px-4 text-sm ring-focus disabled:cursor-not-allowed"
                    placeholder="mason.k"
                  />
                </label>
              )}

              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-wider text-text-tertiary">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  className="h-12 w-full rounded-xl bg-inset px-4 text-sm ring-focus disabled:cursor-not-allowed"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-wider text-text-tertiary">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="h-12 w-full rounded-xl bg-inset px-4 text-sm ring-focus disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
              </label>

              <button
                type="submit"
                disabled={isPending}
                aria-busy={isPending}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-medium text-background transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    <span>Please wait...</span>
                  </>
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </fieldset>
          </form>

          <div className="mt-6 flex items-center justify-between gap-3 text-sm text-text-secondary">
            <span>{mode === "login" ? "Need an account?" : "Already have an account?"}</span>
            <Link href={mode === "login" ? "/signup" : "/login"} className="font-medium text-foreground underline underline-offset-4">
              {mode === "login" ? "Sign up" : "Log in"}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
