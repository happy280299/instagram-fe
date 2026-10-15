"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { useInView } from "@/hooks/useInView";
import { useUIStore } from "@/store/ui";
import type { Media } from "@/types";

interface PostVideoProps {
  media: Media;
  /** The carousel slide currently shown; other slides stay paused. */
  active: boolean;
  /** Paused by the viewer (tap on the media or the play/pause button). */
  paused: boolean;
  onTogglePaused: () => void;
  sizes: string;
}

const control = "text-on-media rounded-full bg-black/60 p-2";

/** Runs a control's action without the click reaching the media's tap/double-tap handler. */
const own = (action: () => void) => (e: MouseEvent) => {
  e.stopPropagation();
  action();
};

/** A post video: plays muted while mostly on screen, like Instagram. Shares the reels mute setting. */
export function PostVideo({ media, active, paused, onTogglePaused, sizes }: PostVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.6 });
  const muted = useUIStore((s) => s.reelsMuted);
  const setMuted = useUIStore((s) => s.setReelsMuted);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView && active && !paused) video.play().catch(() => undefined);
    else video.pause();
  }, [inView, active, paused]);

  return (
    <div ref={ref} className="relative h-full w-full">
      {media.poster && <SafeImage src={media.poster} alt="" fill sizes={sizes} className="object-cover" draggable={false} />}
      <video
        ref={videoRef}
        src={media.url}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        aria-label={media.alt}
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {failed && (
        <p role="status" className="text-on-media absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm font-semibold drop-shadow">
          Video unavailable
        </p>
      )}
      {paused && !failed && (
        <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-black/50 p-4">
            <Play className="fill-on-media text-on-media size-10" />
          </span>
        </span>
      )}
      <div className="absolute right-3 bottom-3 flex gap-2">
        <button type="button" onClick={own(onTogglePaused)} aria-label={paused ? "Play video" : "Pause video"} className={control}>
          {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
        </button>
        <button type="button" onClick={own(() => setMuted(!muted))} aria-label={muted ? "Unmute" : "Mute"} aria-pressed={!muted} className={control}>
          {muted ? <VolumeX aria-hidden className="size-4" /> : <Volume2 aria-hidden className="size-4" />}
        </button>
      </div>
    </div>
  );
}
