"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import type { ProfileMediaKind } from "@/lib/api/mock-data";

const LottiePlayer = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
  { ssr: false, loading: () => <div className="size-full animate-pulse bg-elevated" /> },
);

interface ProfileMediaProps {
  src?: string | null;
  kind?: ProfileMediaKind | null;
  initials: string;
  size?: number;
  className?: string;
  alt?: string;
}

export function ProfileMedia({
  src,
  kind,
  initials,
  size = 88,
  className,
  alt,
}: ProfileMediaProps) {
  const dimensionStyle = { width: size, height: size };

  if (!src) {
    return (
      <div
        className={cn(
          "grid place-items-center rounded-full border border-border bg-elevated font-mono text-base font-semibold shadow-sm",
          className,
        )}
        style={dimensionStyle}
        aria-label={alt ?? `${initials} avatar`}
      >
        {initials}
      </div>
    );
  }

  const wrapperClass = cn(
    "overflow-hidden rounded-full border border-border bg-elevated shadow-sm",
    className,
  );

  if (kind === "video") {
    return (
      <div className={wrapperClass} style={dimensionStyle}>
        <video
          className="size-full object-cover"
          src={src}
          autoPlay
          loop
          muted
          playsInline
          aria-label={alt ?? `${initials} avatar`}
        />
      </div>
    );
  }

  if (kind === "lottie") {
    return (
      <div className={wrapperClass} style={dimensionStyle} aria-label={alt ?? `${initials} avatar`}>
        <LottiePlayer src={src} autoplay loop className="size-full" />
      </div>
    );
  }

  // image (incl. gif), or unknown — fall through to <img>.
  return (
    <div className={wrapperClass} style={dimensionStyle}>
      <img
        src={src}
        alt={alt ?? `${initials} avatar`}
        className="size-full object-cover"
        draggable={false}
      />
    </div>
  );
}
