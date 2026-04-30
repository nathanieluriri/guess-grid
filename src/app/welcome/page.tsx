import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/auth";
import { WelcomeActions } from "@/components/auth/WelcomeActions";

export const metadata: Metadata = {
  title: "Welcome",
  description: "Sign in, create an account, or jump straight in as a guest.",
};

export default async function WelcomePage() {
  const cookieStore = await cookies();
  if (cookieStore.get(AUTH_COOKIE_NAME) || cookieStore.get(REFRESH_COOKIE_NAME)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden rounded-[2rem] surface border border-border p-10 lg:block">
          <div className="max-w-md space-y-7">
            <div className="inline-flex h-10 items-center rounded-full surface-elevated px-4 text-[11px] uppercase tracking-[0.24em] text-text-tertiary">
              Monochrome Strategy
            </div>
            <div className="space-y-3">
              <h1 className="text-5xl tracking-tight">Dead &amp; Injured</h1>
              <p className="leading-relaxed text-text-secondary">
                A focused, monochrome strategy game of pure deduction. Drag, guess, and read the board.
              </p>
            </div>
            <ul className="grid gap-3 text-sm text-text-secondary">
              <li className="rounded-2xl surface-elevated border border-border p-4">
                Continue as a guest in one tap — your wallet, inventory, and progress carry over if you upgrade.
              </li>
              <li className="rounded-2xl surface-elevated border border-border p-4">
                Sign up to lock in your handle, play with friends, and climb the leaderboard.
              </li>
            </ul>
          </div>
        </section>

        <section className="rounded-[2rem] surface border border-border p-6 shadow-lg sm:p-10">
          <div className="mb-8 space-y-2">
            <div className="text-[11px] uppercase tracking-[0.24em] text-text-tertiary">Get started</div>
            <h2 className="text-3xl tracking-tight">Pick how to enter</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              You can come back and create a real account anytime — your guest progress upgrades with you.
            </p>
          </div>
          <WelcomeActions />
        </section>
      </div>
    </div>
  );
}
