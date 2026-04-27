import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Dead & Injured account and continue into the app shell.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
