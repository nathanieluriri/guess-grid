"use client";

import { Settings2 } from "lucide-react";
import { toast } from "sonner";

interface ProfileActionsProps {
  variant?: "edit" | "loadout";
}

export function ProfileActions({ variant = "edit" }: ProfileActionsProps) {
  if (variant === "loadout") {
    return (
      <button
        onClick={() =>
          toast("Loadout save next", {
            description: "Inventory is backend-backed. A full loadout editor UI is the remaining step here.",
          })
        }
        className="text-xs h-8 px-3 rounded-md surface-elevated hover:bg-foreground hover:text-background transition"
      >
        Equip Loadout
      </button>
    );
  }

  return (
    <button
      onClick={() =>
        toast("Settings next", {
          description: "Profile settings now have a dedicated top-right slot. The form and preferences panel still need implementation.",
        })
      }
      className="size-9 grid place-items-center rounded-lg surface-elevated border border-border ring-focus"
      aria-label="Open profile settings"
    >
      <Settings2 className="size-4" />
    </button>
  );
}
