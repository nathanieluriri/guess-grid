import { redirect } from "next/navigation";

export default function LegacyGamePage() {
  redirect("/play/local");
}
