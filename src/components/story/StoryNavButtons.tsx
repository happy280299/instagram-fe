import { ChevronLeft, ChevronRight } from "lucide-react";

const navBtn = "text-on-media bg-on-media/20 hover:bg-on-media/40 absolute top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full md:flex";

/** Desktop previous/next arrows beside the story frame. */
export function StoryNavButtons({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <>
      <button type="button" aria-label="Previous story" onClick={onPrev} className={`${navBtn} left-4`}>
        <ChevronLeft aria-hidden className="size-5" />
      </button>
      <button type="button" aria-label="Next story" onClick={onNext} className={`${navBtn} right-4`}>
        <ChevronRight aria-hidden className="size-5" />
      </button>
    </>
  );
}
