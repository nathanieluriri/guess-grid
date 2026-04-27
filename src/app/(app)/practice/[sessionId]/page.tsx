import type { Metadata } from "next";
import PracticeSessionScreen from "@/components/practice/practice-session";

export const metadata: Metadata = {
  title: "Practice Session",
  description: "Play through a backend-backed practice sandbox without touching your competitive record.",
};

export default async function PracticeSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return <PracticeSessionScreen sessionId={sessionId} />;
}
