"use client";

import { ImageOff } from "lucide-react";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { IMAGE_REMOTE_PATTERNS } from "@/lib/image-hosts";

type SafeImageProps = Omit<ImageProps, "src"> & { src: string };

type SrcKind = "invalid" | "optimizable" | "raw";

/**
 * next/image throws (crashing the page) on a src that isn't a URL or whose host isn't in
 * remotePatterns. User-entered URLs (avatars) can be either, so classify before rendering.
 */
function srcKind(src: string): SrcKind {
  if (src.startsWith("data:") || src.startsWith("blob:")) return "raw";
  if (src.startsWith("/") && !src.startsWith("//")) return "optimizable";
  try {
    const url = new URL(src);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "invalid";
    const allowed = IMAGE_REMOTE_PATTERNS.some((p) => `${p.protocol}:` === url.protocol && p.hostname === url.hostname);
    return allowed ? "optimizable" : "raw";
  } catch {
    return "invalid";
  }
}

/** next/image with a graceful fallback when the remote URL fails to load. */
export function SafeImage({ src, alt, className, unoptimized, ...props }: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const kind = srcKind(src);
  if (failedSrc === src || kind === "invalid") {
    return (
      <span
        role="img"
        aria-label={alt || "Image unavailable"}
        className={cn("bg-skeleton text-muted flex items-center justify-center", props.fill && "absolute inset-0", className)}
        style={props.fill ? undefined : { width: Number(props.width), height: Number(props.height) }}
      >
        <ImageOff aria-hidden className="size-1/4 max-h-8 max-w-8" />
      </span>
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      className={className}
      unoptimized={unoptimized ?? kind === "raw"}
      onError={() => setFailedSrc(src)}
    />
  );
}
