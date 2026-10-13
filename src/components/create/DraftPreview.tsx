import type { PointerEventHandler } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/cn";
import { ASPECTS, type Draft } from "./types";

interface DraftPreviewProps {
  draft: Draft;
  className?: string;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  grid?: boolean;
}

/** Live preview of the crop (aspect/zoom/pan) and filter, mirroring the canvas render. */
export function DraftPreview({ draft, className, onPointerDown, grid }: DraftPreviewProps) {
  return (
    <div className={cn("flex h-full w-full items-center justify-center bg-black", className)}>
      <div
        className="relative max-h-full w-full overflow-hidden touch-none"
        style={{ aspectRatio: ASPECTS[draft.aspect], maxWidth: `calc(100% * ${Math.min(ASPECTS[draft.aspect], 1)})` }}
        onPointerDown={onPointerDown}
      >
        <SafeImage
          src={draft.src}
          alt={`Preview of ${draft.name}`}
          fill
          sizes="(max-width: 767px) 100vw, 560px"
          draggable={false}
          className="object-cover select-none"
          style={{
            transform: `translate(${draft.offsetX * 100}%, ${draft.offsetY * 100}%) scale(${draft.zoom})`,
            filter: draft.filter.css,
          }}
        />
        {grid && (
          <div aria-hidden className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className="border-on-media/30 border" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
