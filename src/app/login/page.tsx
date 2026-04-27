import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to access protected Dead & Injured routes and social play.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
