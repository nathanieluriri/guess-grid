"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import type { CurrentUser } from "@/lib/api/types";
import { UpgradeAccountDialog } from "@/components/auth/UpgradeAccountDialog";

interface AuthContextValue {
  user: CurrentUser | null;
  isGuest: boolean;
  isAuthenticated: boolean;
  /**
   * Gate a real-user-only action. Returns true if the user is a real user
   * (verified or not). Otherwise opens the upgrade dialog and returns false.
   */
  requireRealUser: (feature?: string) => boolean;
  /**
   * Gate a verified-real-user-only action (matchmaking, multiplayer rounds).
   * - Guest → opens the upgrade dialog and returns false.
   * - Real but unverified → fires a "verify your email" toast and returns false.
   * - Real + verified → returns true.
   */
  requireVerifiedUser: (feature?: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  user,
  children,
}: {
  user: CurrentUser | null;
  children: React.ReactNode;
}) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [gatedFeature, setGatedFeature] = useState<string | null>(null);

  const requireRealUser = useCallback(
    (feature?: string) => {
      if (user && !user.is_guest) {
        return true;
      }
      setGatedFeature(feature ?? null);
      setUpgradeOpen(true);
      return false;
    },
    [user],
  );

  const requireVerifiedUser = useCallback(
    (feature?: string) => {
      if (!user || user.is_guest) {
        setGatedFeature(feature ?? null);
        setUpgradeOpen(true);
        return false;
      }
      if (!user.is_email_verified) {
        toast.warning("Verify your email first", {
          description: feature
            ? `You'll be able to ${feature} once your email is verified. Check your profile for a resend link.`
            : "This action needs a verified email. Check your profile to resend the verification link.",
        });
        return false;
      }
      return true;
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isGuest: !!user?.is_guest,
      isAuthenticated: !!user && !user.is_guest,
      requireRealUser,
      requireVerifiedUser,
    }),
    [user, requireRealUser, requireVerifiedUser],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <UpgradeAccountDialog
        open={upgradeOpen}
        feature={gatedFeature}
        guestUsername={user?.is_guest ? user.username : undefined}
        onOpenChange={(next) => {
          setUpgradeOpen(next);
          if (!next) setGatedFeature(null);
        }}
      />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
