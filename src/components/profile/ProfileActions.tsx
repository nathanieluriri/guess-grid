import Link from "next/link";
import { Settings2 } from "lucide-react";
export function ProfileActions() {
  return (
    <Link
      href="/profile/settings"
      className="size-9 grid place-items-center rounded-lg surface-elevated border border-border ring-focus"
      aria-label="Open profile settings"
    >
      <Settings2 className="size-4" />
    </Link>
  );
}
