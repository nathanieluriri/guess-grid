"use client";

import { Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateSecret, isValidSecret, secretValidationError } from "@/lib/game";

interface SecretInputProps {
  value: string;
  onChange: (next: string) => void;
  label: string;
  length?: number;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  /** Optional id so a wrapping <label> can target the input. */
  id?: string;
}

/**
 * A controlled secret-code entry: numeric input + a live digit-tile preview +
 * inline validation (digits only, exact length, all unique — mirrors the
 * backend). Keeps the visual language consistent with the game board tiles.
 */
export function SecretInput({
  value,
  onChange,
  label,
  length = 4,
  placeholder = "1234",
  autoFocus,
  disabled,
  id,
}: SecretInputProps) {
  const error = secretValidationError(value, length);
  const valid = isValidSecret(value, length);
  const tiles = Array.from({ length }, (_, i) => value[i]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.22em] text-text-tertiary">{label}</span>
        <button
          type="button"
          onClick={() => onChange(generateSecret(length, false).join(""))}
          disabled={disabled}
          className="inline-flex items-center gap-1 text-[11px] text-text-tertiary hover:text-foreground ring-focus rounded disabled:opacity-50"
        >
          <Shuffle className="size-3" /> Randomize
        </button>
      </div>

      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, length))}
        className={cn(
          "h-12 w-full rounded-2xl bg-inset px-4 font-mono text-base tracking-[0.3em] ring-focus transition-colors",
          error ? "border border-[hsl(var(--signal-danger)/0.5)]" : "border border-transparent",
        )}
        placeholder={placeholder}
        inputMode="numeric"
        autoComplete="off"
        autoFocus={autoFocus}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-label={label}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5" aria-hidden="true">
          {tiles.map((digit, i) => (
            <div
              key={i}
              className={cn(
                "size-9 rounded-md grid place-items-center font-mono font-semibold text-base transition-colors",
                digit !== undefined
                  ? "surface-elevated border border-border-strong text-foreground"
                  : "surface-inset border border-dashed border-border text-text-tertiary",
              )}
            >
              {digit ?? "·"}
            </div>
          ))}
        </div>
        <span
          className={cn(
            "text-[11px] min-h-4 text-right",
            error ? "text-[hsl(var(--signal-danger))]" : valid ? "text-[hsl(var(--signal-dead))]" : "text-text-tertiary",
          )}
        >
          {error ?? (valid ? "Ready" : `${length} unique digits`)}
        </span>
      </div>
    </div>
  );
}
