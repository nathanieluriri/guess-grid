import type { Metadata } from "next";
import { PracticeScreen } from "@/components/practice/practice-screen";

export const metadata: Metadata = {
  title: "Practice",
  description: "Warm up in unranked Dead & Injured practice modes with no rating pressure.",
};

export default function PracticePage() {
  return <PracticeScreen />;
}
