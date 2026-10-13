"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { useDoubleTap } from "@/hooks/useDoubleTap";
import { cn } from "@/lib/cn";
import type { Media } from "@/types";
import { HeartBurst } from "./HeartBurst";

interface PostMediaProps {
  media: Media[];
  onDoubleTap?: () => void;
  priority?: boolean;
  sizes?: string;
  className?: string;
  /** Fill the parent instead of using the media's intrinsic aspect ratio. */
  fill?: boolean;
}

/** Display aspect ratio of a post (clamped to 4:5 like Instagram). */
export function mediaRatio(media: Media[]): number {
  const first = media[0];
  return Math.max(first.width / first.height, 4 / 5);
}

export function PostMedia({ media, onDoubleTap, priority, sizes = "(max-width: 767px) 100vw, 470px", className, fill }: PostMediaProps) {
  const [index, setIndex] = useState(0);
  const [burst, setBurst] = useState(0);
  const touchX = useRef<number | null>(null);
  const ratio = mediaRatio(media);
  const go = (next: number) => setIndex(Math.min(Math.max(next, 0), media.length - 1));
  const handleTap = useDoubleTap(() => {
    setBurst((n) => n + 1);
    onDoubleTap?.();
  });

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={`Post media, ${index + 1} of ${media.length}`}
      className={cn("relative overflow-hidden bg-black select-none", fill && "h-full w-full", className)}
      style={fill ? undefined : { aspectRatio: ratio }}
      onClick={handleTap}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div className="flex h-full transition-transform duration-300 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
        {media.map((m, i) => (
          <div key={m.id} className="relative h-full w-full shrink-0" aria-hidden={i !== index}>
            <SafeImage src={m.url} alt={m.alt} fill sizes={sizes} priority={priority && i === 0} className="object-cover" draggable={false} />
          </div>
        ))}
      </div>
      {index > 0 && (
        <CarouselArrow side="left" onClick={() => go(index - 1)} />
      )}
      {index < media.length - 1 && (
        <CarouselArrow side="right" onClick={() => go(index + 1)} />
      )}
      {media.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1" aria-hidden>
          {media.map((m, i) => (
            <span key={m.id} className={cn("bg-on-media size-1.5 rounded-full transition-opacity", i === index ? "opacity-100" : "opacity-40")} />
          ))}
        </div>
      )}
      {burst > 0 && <HeartBurst key={burst} />}
    </div>
  );
}

function CarouselArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "bg-on-media/80 absolute top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full shadow transition-opacity hover:opacity-100",
        side === "left" ? "left-2" : "right-2",
      )}
    >
      <Icon aria-hidden className="size-4 text-black" />
    </button>
  );
}
