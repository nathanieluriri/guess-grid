import type { Metadata } from "next";
import { Suspense } from "react";
import { GoogleAuthErrorClient } from "@/components/auth/GoogleAuthErrorClient";

export const metadata: Metadata = {
  title: "Sign-in failed",
  description: "Google sign-in could not be completed.",
};

export default function GoogleAuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <GoogleAuthErrorClient />
    </Suspense>
  );
}
