import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLessonDetail } from "@/lib/api/server";
import LessonDetail from "@/components/learn/lesson-detail";

export const metadata: Metadata = {
  title: "Lesson",
  description: "Read a specific curriculum lesson and mark it complete when finished.",
};

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ chapterId: string; lessonId: string }>;
}) {
  const { chapterId, lessonId } = await params;
  const lesson = await getLessonDetail(chapterId, lessonId);
  if (!lesson) {
    notFound();
  }
  return <LessonDetail lesson={lesson} />;
}
