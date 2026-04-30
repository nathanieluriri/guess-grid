"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { ResendVerificationButton } from "@/components/profile/ResendVerificationButton";

function formatGuestExpiry(expiresAt: number | null | undefined): {
  label: string;
  urgent: boolean;
} {
  if (!expiresAt) {
    return { label: "", urgent: false };
  }
  const remainingMs = expiresAt * 1000 - Date.now();
  if (remainingMs <= 0) {
    return { label: "Your guest session has expired — create an account to keep your progress.", urgent: true };
  }
  const days = Math.floor(remainingMs / 86_400_000);
  const hours = Math.floor((remainingMs % 86_400_000) / 3_600_000);
  if (days >= 2) {
    return { label: `Guest session expires in ${days} days.`, urgent: false };
  }
  if (days === 1) {
    return { label: `Guest session expires in 1 day.`, urgent: true };
  }
  if (hours > 1) {
    return { label: `Guest session expires in ${hours} hours.`, urgent: true };
  }
  return { label: "Guest session expires in under an hour.", urgent: true };
}

export function AccountStatusBanner() {
  const { user, isGuest, requireRealUser } = useAuth();

  if (!user) return null;

  if (isGuest) {
    const { label: expiryLabel, urgent } = formatGuestExpiry(user.expires_at);
    return (
      <div
        className={
          urgent
            ? "rounded-2xl surface-elevated border border-[hsl(var(--signal-danger)/0.45)] p-4"
            : "rounded-2xl surface-elevated border border-[hsl(var(--signal-injured)/0.3)] p-4"
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold">You're playing as a guest</div>
            <p className="mt-1 text-xs text-text-secondary">
              Create a real account to keep your wallet, inventory, and progress safe — and to unlock ranked play.
            </p>
            {expiryLabel ? (
              <p className={`mt-1 text-xs ${urgent ? "text-destructive" : "text-text-tertiary"}`}>{expiryLabel}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => requireRealUser("save your progress")}
            className="inline-flex h-9 items-center gap-2 rounded-lg surface px-3 text-xs font-medium ring-focus hover:border-border-strong"
          >
            Create account
          </button>
        </div>
      </div>
    );
  }

  if (!user.is_email_verified) {
    return <ResendVerificationButton />;
  }

  return null;
}
