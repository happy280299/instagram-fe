"use client";

import { useEffect, useRef, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import type { StorySlide } from "@/types";

interface StoryMediaProps {
  slide: StorySlide;
  alt: string;
  paused: boolean;
  /** Reports a video's real length in ms so the progress bar matches it. */
  onDuration: (ms: number) => void;
}

/** One slide's image or video. Re-mount (via `key`) per slide. */
export function StoryMedia({ slide, alt, paused, onDuration }: StoryMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) video.pause();
    else video.play().catch(() => undefined);
  }, [paused]);

  if (slide.type !== "video") {
    return <SafeImage src={slide.url} alt={alt} fill priority sizes="(max-width: 767px) 100vw, 540px" className="object-cover" />;
  }

  return (
    <>
      {slide.poster && <SafeImage src={slide.poster} alt="" fill sizes="(max-width: 767px) 100vw, 540px" className="object-cover" />}
      <video
        ref={videoRef}
        src={slide.url}
        muted
        playsInline
        autoPlay
        aria-label={alt}
        onLoadedMetadata={(e) => {
          const seconds = e.currentTarget.duration;
          if (Number.isFinite(seconds) && seconds > 0) onDuration(seconds * 1000);
        }}
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {failed && (
        <p role="status" className="text-on-media absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm font-semibold">
          Video unavailable
        </p>
      )}
    </>
  );
}
