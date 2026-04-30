import type { Metadata } from "next";
import { Suspense } from "react";
import { GoogleAuthSuccessClient } from "@/components/auth/GoogleAuthSuccessClient";

export const metadata: Metadata = {
  title: "Signing you in",
  description: "Completing Google sign-in.",
};

export default function GoogleAuthSuccessPage() {
  return (
    <Suspense fallback={null}>
      <GoogleAuthSuccessClient />
    </Suspense>
  );
}
