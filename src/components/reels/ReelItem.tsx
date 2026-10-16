"use client";

import { Music2, Play, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { RichText } from "@/components/ui/RichText";
import { SafeImage } from "@/components/ui/SafeImage";
import { FollowButton } from "@/components/user/FollowButton";
import { useInView } from "@/hooks/useInView";
import { reelService } from "@/services/reel.service";
import type { FeedPost } from "@/services/feed.service";
import { useUIStore } from "@/store/ui";
import { ReelActions } from "./ReelActions";

/** Seconds of playback that count as a view, as the backend expects. */
const VIEW_AFTER_S = 3;
/** Reels already counted this session: one view per reel. */
const counted = new Set<string>();

interface ReelItemProps {
  reel: FeedPost;
  /** Load the video ahead (the one on screen and the next); others wait, to spare bandwidth. */
  preload: boolean;
  onVisible: () => void;
}

export function ReelItem({ reel, preload, onVisible }: ReelItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.6 });
  const [userPaused, setUserPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const muted = useUIStore((s) => s.reelsMuted);
  const setMuted = useUIStore((s) => s.setReelsMuted);
  const media = reel.media[0];

  useEffect(() => {
    if (inView) onVisible();
  }, [inView, onVisible]);

  // Autoplay while ≥60% visible; pause (and rewind) when scrolled away.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView && !userPaused) {
      video.play().catch(() => undefined);
    } else {
      video.pause();
      if (!inView) video.currentTime = 0;
    }
  }, [inView, userPaused]);

  function countView(currentTime: number) {
    if (currentTime < VIEW_AFTER_S || counted.has(reel.id)) return;
    counted.add(reel.id);
    // Best effort, like Instagram: a missed view isn't worth bothering the viewer.
    reelService.recordView(reel.id).catch(() => counted.delete(reel.id));
  }

  if (!media) return null;
  return (
    <div ref={ref} className="flex h-full items-center justify-center gap-4 md:py-4">
      <div className="relative h-full w-full overflow-hidden bg-black md:aspect-[9/16] md:w-auto md:rounded-lg">
        {media.poster && <SafeImage src={media.poster} alt="" fill sizes="(max-width: 767px) 100vw, 400px" className="object-cover" />}
        <video
          ref={videoRef}
          src={media.url}
          muted={muted}
          loop
          playsInline
          preload={preload ? "auto" : "none"}
          aria-label={`Reel by ${reel.author.username}`}
          onClick={() => setUserPaused((p) => !p)}
          onTimeUpdate={(e) => countView(e.currentTarget.currentTime)}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full cursor-pointer object-cover"
        />
        {failed && (
          <p role="status" className="text-on-media absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm font-semibold drop-shadow">
            Video unavailable
          </p>
        )}
        {userPaused && !failed && (
          <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-black/50 p-4">
              <Play className="fill-on-media text-on-media size-10" />
            </span>
          </span>
        )}
        <button
          type="button"
          onClick={() => setMuted(!muted)}
          aria-label={muted ? "Unmute" : "Mute"}
          aria-pressed={!muted}
          className="text-on-media absolute top-3 right-3 rounded-full bg-black/50 p-2"
        >
          {muted ? <VolumeX aria-hidden className="size-4" /> : <Volume2 aria-hidden className="size-4" />}
        </button>
        <div className="text-on-media pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-linear-to-t from-black/70 to-transparent p-4 pr-16 md:pr-4">
          <div className="pointer-events-auto flex items-center gap-2">
            <Link href={`/${reel.author.username}`} className="flex items-center gap-2 text-sm font-semibold">
              <Avatar src={reel.author.avatar} username={reel.author.username} size="sm" />
              {reel.author.username}
            </Link>
            <FollowButton user={reel.author} variant="text" className="text-on-media! rounded-md border px-2 py-1" />
          </div>
          {reel.caption && (
            <p className="pointer-events-auto line-clamp-2 text-sm [&_a]:text-on-media [&_a]:font-semibold">
              <RichText text={reel.caption} />
            </p>
          )}
          <p className="flex items-center gap-1.5 text-xs">
            <Music2 aria-hidden className="size-3" /> {reel.author.username} · Original audio
          </p>
        </div>
        <div className="text-on-media absolute right-3 bottom-6 md:hidden">
          <ReelActions reel={reel} />
        </div>
      </div>
      <div className="hidden self-end pb-4 md:block">
        <ReelActions reel={reel} />
      </div>
    </div>
  );
}
