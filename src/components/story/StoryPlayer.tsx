"use client";

import { Pause, Play } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { TimeAgo } from "@/components/ui/TimeAgo";
import type { StorySlide, StoryWithUser } from "@/types";
import { STORY_FRAME_CLASS } from "./StoryOverlay";
import { StoryMedia } from "./StoryMedia";
import { StoryNavButtons } from "./StoryNavButtons";
import { StoryProgress } from "./StoryProgress";

const DEFAULT_DURATION = 5000;

interface StoryPlayerProps {
  story: StoryWithUser;
  startSlide?: number;
  onNextStory: () => void;
  onPrevStory: () => void;
  /** Called once per slide as it comes on screen. Pass a stable callback. */
  onSlideShown?: (slide: StorySlide) => void;
  /** Bottom bar for the current slide. `hold(true)` pauses playback and shortcuts while a dialog is open. */
  renderFooter?: (slide: StorySlide, hold: (held: boolean) => void) => ReactNode;
}

/** Plays one user's slides. Re-mount (via `key`) per story so it starts from `startSlide`. */
export function StoryPlayer({ story, startSlide = 0, onNextStory, onPrevStory, onSlideShown, renderFooter }: StoryPlayerProps) {
  const [currentIdx, setSlideIdx] = useState(startSlide);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [videoLength, setVideoLength] = useState<{ slideId: string; ms: number } | null>(null);
  const pressStart = useRef(0);

  // Slides can be removed from under us (deleting your own story); stay in range.
  const slideIdx = Math.min(currentIdx, story.slides.length - 1);
  const slide = story.slides[slideIdx];
  const isPaused = paused || held;
  const duration = videoLength?.slideId === slide.id ? videoLength.ms : (slide.duration ?? DEFAULT_DURATION);

  useEffect(() => {
    onSlideShown?.(slide);
  }, [slide, onSlideShown]);

  const next = useCallback(() => {
    if (slideIdx < story.slides.length - 1) setSlideIdx(slideIdx + 1);
    else onNextStory();
  }, [slideIdx, story.slides.length, onNextStory]);

  const prev = useCallback(() => {
    if (slideIdx > 0) setSlideIdx(slideIdx - 1);
    else onPrevStory();
  }, [slideIdx, onPrevStory]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (held) return;
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, held]);

  return (
    <>
      <div className={STORY_FRAME_CLASS}>
        <StoryMedia
          key={slide.id}
          slide={slide}
          alt={`Story from ${story.user.username}`}
          paused={isPaused}
          onDuration={(ms) => setVideoLength({ slideId: slide.id, ms })}
        />
        <div className="absolute inset-x-0 top-0 z-10 flex flex-col gap-3 bg-linear-to-b from-black/60 to-transparent p-3">
          <StoryProgress key={slide.id} count={story.slides.length} active={slideIdx} paused={isPaused} duration={duration} onComplete={next} />
          <div className="text-on-media flex items-center gap-2">
            <Avatar src={story.user.avatar} username={story.user.username} size="sm" />
            <span className="text-sm font-semibold">{story.user.username}</span>
            <TimeAgo date={slide.createdAt} className="text-sm opacity-70" />
            <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play story" : "Pause story"} className="ml-auto p-1">
              {paused ? <Play aria-hidden className="size-5" /> : <Pause aria-hidden className="size-5" />}
            </button>
          </div>
        </div>
        {/* Tap zones: left third = previous, rest = next; press and hold = pause. */}
        <div
          aria-hidden
          className="absolute inset-0"
          onPointerDown={() => {
            pressStart.current = Date.now();
            setPaused(true);
          }}
          onPointerUp={(e) => {
            setPaused(false);
            if (Date.now() - pressStart.current > 250) return;
            const rect = e.currentTarget.getBoundingClientRect();
            if (e.clientX - rect.left < rect.width / 3) prev();
            else next();
          }}
          onPointerLeave={() => setPaused(false)}
          onContextMenu={(e) => e.preventDefault()}
        />
        {renderFooter && (
          <div className="absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/60 to-transparent p-3">{renderFooter(slide, setHeld)}</div>
        )}
      </div>
      <StoryNavButtons onPrev={prev} onNext={next} />
    </>
  );
}
