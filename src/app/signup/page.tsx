import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Dead & Injured account and continue into the app shell.",
};

export default async function SignupPage() {
  // Already-cookied visitors (including guests) bypass /signup. Guests should
  // upgrade their existing session via the dropdown rather than starting a
  // brand-new account here, which would orphan their guest progress.
  const cookieStore = await cookies();
  if (cookieStore.get(AUTH_COOKIE_NAME) || cookieStore.get(REFRESH_COOKIE_NAME)) {
    redirect("/");
  }

  return (
    <Suspense fallback={null}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
