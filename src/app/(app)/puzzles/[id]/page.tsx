import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPuzzleDetail } from "@/lib/api/server";
import PuzzleDetail from "@/components/puzzles/puzzle-detail";

export const metadata: Metadata = {
  title: "Puzzle",
  description: "Attempt a specific Dead & Injured puzzle with backend-scored feedback.",
};

export default async function PuzzleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const puzzle = await getPuzzleDetail(id);
  if (!puzzle) {
    notFound();
  }
  return <PuzzleDetail puzzle={puzzle} />;
}
