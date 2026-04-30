"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UpgradeAccountDialogProps {
  open: boolean;
  feature?: string | null;
  guestUsername?: string;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeAccountDialog({ open, feature, guestUsername, onOpenChange }: UpgradeAccountDialogProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setPassword("");
      setUsername("");
      setIsPending(false);
    }
  }, [open]);

  const headline = feature ? `Create an account to ${feature}` : "Create an account";
  const description = guestUsername
    ? `You're playing as ${guestUsername}. Upgrade to keep your progress, change your handle, and unlock everything.`
    : "Upgrade to a full account to unlock features that need a real identity.";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      toast.error("Missing fields", {
        description: "Email and password are required.",
      });
      return;
    }

    setIsPending(true);
    const response = await fetch("/api/auth/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        username: username.trim() || undefined,
      }),
    });
    const body = (await response.json().catch(() => null)) as
      | { error?: string; verificationEmail?: "queued" | "delayed" }
      | null;

    if (!response.ok) {
      setIsPending(false);
      toast.error("Could not upgrade account", {
        description: body?.error ?? "Please try again.",
      });
      return;
    }

    if (body?.verificationEmail === "delayed") {
      toast.warning("Account upgraded — verification email delayed", {
        description: "We couldn't send your verification email right now. Request a new link from your account.",
        duration: 8000,
      });
    } else {
      toast.success("Account upgraded", {
        description: "Verification email is on the way.",
      });
    }

    startTransition(() => {
      onOpenChange(false);
      router.refresh();
    });
    setIsPending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="surface border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{headline}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset disabled={isPending} className="space-y-4 disabled:opacity-70">
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-wider text-text-tertiary">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="h-11 w-full rounded-xl bg-inset px-4 text-sm ring-focus disabled:cursor-not-allowed"
                placeholder="you@example.com"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-wider text-text-tertiary">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
                className="h-11 w-full rounded-xl bg-inset px-4 text-sm ring-focus disabled:cursor-not-allowed"
                placeholder="At least 8 chars, letter + digit"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-wider text-text-tertiary">
                Username <span className="normal-case text-text-tertiary">(optional)</span>
              </span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                className="h-11 w-full rounded-xl bg-inset px-4 text-sm ring-focus disabled:cursor-not-allowed"
                placeholder={guestUsername ?? "leave blank to keep your guest handle"}
              />
            </label>
          </fieldset>

          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-11 rounded-xl border border-border px-4 text-sm font-medium text-text-secondary transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              Not now
            </button>
            <button
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-medium text-background transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  <span>Upgrading…</span>
                </>
              ) : (
                "Create account"
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
