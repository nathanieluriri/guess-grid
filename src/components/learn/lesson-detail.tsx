"use client";

import { toast } from "sonner";
import { apiRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

interface LessonDetailProps {
  lesson: {
    chapter_id: string;
    lesson_id: string;
    title: string;
    body: string;
  };
}

export default function LessonDetail({ lesson }: LessonDetailProps) {
  async function completeLesson() {
    const response = await apiRequest<{ status: string }>(
      `/curriculum/${lesson.chapter_id}/lessons/${lesson.lesson_id}/complete`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );
    if (response.error) {
      toast.error("Unable to mark lesson complete", { description: response.error });
      return;
    }
    toast.success("Lesson completed");
  }

  return (
    <div className="container max-w-3xl py-6 sm:py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl tracking-tight">{lesson.title}</h1>
        <p className="text-text-secondary">
          {lesson.chapter_id} · {lesson.lesson_id}
        </p>
      </header>
      <article className="rounded-2xl surface border border-border p-6 prose prose-invert max-w-none">
        <p>{lesson.body}</p>
      </article>
      <Button onClick={completeLesson}>Mark Complete</Button>
    </div>
  );
}
