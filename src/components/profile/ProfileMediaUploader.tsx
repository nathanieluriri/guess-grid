"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { ProfileMedia } from "@/components/profile/ProfileMedia";
import type { ProfileMediaKind } from "@/lib/api/mock-data";

const IMAGE_EXTS = ["png", "jpg", "jpeg", "gif", "webp", "avif", "bmp"] as const;
const LOTTIE_EXTS = ["json", "lottie"] as const;
const VIDEO_EXTS = ["mp4", "m4v", "mov", "webm", "mkv"] as const;

const ACCEPT_ATTR = [...IMAGE_EXTS, ...LOTTIE_EXTS, ...VIDEO_EXTS]
  .map((ext) => `.${ext}`)
  .join(",");

const IMAGE_MAX_BYTES = 12 * 1024 * 1024;
const VIDEO_MAX_BYTES = 40 * 1024 * 1024;

function classifyExtension(filename: string): { kind: ProfileMediaKind; max: number } | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  if ((IMAGE_EXTS as readonly string[]).includes(ext)) return { kind: "image", max: IMAGE_MAX_BYTES };
  if ((LOTTIE_EXTS as readonly string[]).includes(ext)) return { kind: "lottie", max: IMAGE_MAX_BYTES };
  if ((VIDEO_EXTS as readonly string[]).includes(ext)) return { kind: "video", max: VIDEO_MAX_BYTES };
  return null;
}

function formatMb(bytes: number) {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

interface ProfileMediaUploaderProps {
  initials: string;
  currentUrl?: string | null;
  currentKind?: ProfileMediaKind | null;
}

export function ProfileMediaUploader({
  initials,
  currentUrl,
  currentKind,
}: ProfileMediaUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewKind, setPreviewKind] = useState<ProfileMediaKind | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl(null);
      setPreviewKind(null);
      return;
    }
    const objectUrl = URL.createObjectURL(pendingFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [pendingFile]);

  const onSelect = (file: File | undefined) => {
    if (!file) return;
    const classification = classifyExtension(file.name);
    if (!classification) {
      toast.error("Unsupported file type", {
        description: `Allowed: ${[...IMAGE_EXTS, ...LOTTIE_EXTS, ...VIDEO_EXTS].join(", ")}`,
      });
      return;
    }
    if (file.size > classification.max) {
      toast.error("File too large", {
        description: `${classification.kind === "video" ? "Videos" : "Images / Lottie"} are limited to ${formatMb(classification.max)}.`,
      });
      return;
    }
    setPendingFile(file);
    setPreviewKind(classification.kind);
  };

  const clearSelection = () => {
    setPendingFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const submit = async () => {
    if (!pendingFile) return;
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("file", pendingFile);
      const response = await fetch("/api/users/me/profile-media", {
        method: "POST",
        body,
        credentials: "include",
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string | null }
        | null;
      if (!response.ok || !payload?.ok) {
        toast.error("Upload failed", {
          description: payload?.error ?? "Please try again.",
        });
        return;
      }
      toast.success("Profile media updated");
      clearSelection();
      router.refresh();
    } finally {
      setIsUploading(false);
    }
  };

  const displaySrc = previewUrl ?? currentUrl ?? null;
  const displayKind = previewUrl ? previewKind : currentKind ?? null;

  return (
    <div className="section-shell flex flex-col gap-5 sm:flex-row sm:items-start">
      <ProfileMedia
        src={displaySrc}
        kind={displayKind}
        initials={initials}
        size={120}
        className="shrink-0"
      />
      <div className="min-w-0 flex-1 space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Profile media</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Image (PNG, JPG, GIF, WebP, AVIF, BMP) or Lottie up to {formatMb(IMAGE_MAX_BYTES)}, video (MP4, MOV, WebM, MKV) up to {formatMb(VIDEO_MAX_BYTES)}.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          className="sr-only"
          onChange={(event) => onSelect(event.target.files?.[0])}
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex h-9 items-center gap-2 rounded-lg surface-elevated px-3 text-xs font-medium ring-focus hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload className="size-3.5" aria-hidden="true" />
            <span>{pendingFile ? "Pick a different file" : "Choose file"}</span>
          </button>

          {pendingFile ? (
            <>
              <button
                type="button"
                onClick={submit}
                disabled={isUploading}
                aria-busy={isUploading}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-foreground px-3 text-xs font-medium text-background ring-focus hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                ) : null}
                <span>{isUploading ? "Uploading…" : "Upload"}</span>
              </button>
              <button
                type="button"
                onClick={clearSelection}
                disabled={isUploading}
                className="inline-flex h-9 items-center gap-2 rounded-lg surface px-3 text-xs font-medium ring-focus hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="size-3.5" aria-hidden="true" />
                <span>Discard</span>
              </button>
            </>
          ) : null}
        </div>

        {pendingFile ? (
          <p className="text-xs text-text-tertiary">
            Selected: <span className="font-mono">{pendingFile.name}</span> · {formatMb(pendingFile.size)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
