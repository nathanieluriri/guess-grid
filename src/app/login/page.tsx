import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to access protected Dead & Injured routes and social play.",
};

export default async function LoginPage() {
  // Already-cookied visitors (including guests) bypass /login. Real users
  // belong in the app; guests should upgrade via the dropdown rather than
  // creating a separate account here (which would orphan their guest progress).
  const cookieStore = await cookies();
  if (cookieStore.get(AUTH_COOKIE_NAME) || cookieStore.get(REFRESH_COOKIE_NAME)) {
    redirect("/");
  }

  return (
    <Suspense fallback={null}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
