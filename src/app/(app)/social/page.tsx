import type { Metadata } from "next";
import { SocialScreen } from "@/components/social/social-screen";
import { getSocialPageData } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Social",
  description: "Track friends and leaderboard standings across the Dead & Injured community.",
};

export default async function SocialPage() {
  const data = await getSocialPageData();
  return <SocialScreen friends={data.friends} leaders={data.leaders} />;
}
