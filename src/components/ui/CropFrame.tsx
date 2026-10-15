"use client";

import type { ReactNode } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCropDrag } from "@/hooks/useCropDrag";
import { cn } from "@/lib/cn";
import { type CropSource, cropTransform } from "@/lib/image-crop";

interface CropFrameProps<T extends CropSource> {
  crop: T;
  /** Frame width / height. */
  aspect: number;
  onChange: (crop: T) => void;
  alt: string;
  className?: string;
  /** Drawn over the image, e.g. a guide. Not interactive. */
  overlay?: ReactNode;
}

/** Drag-to-reposition frame showing exactly what `renderImage` will output for the same crop. */
export function CropFrame<T extends CropSource>({ crop, aspect, onChange, alt, className, overlay }: CropFrameProps<T>) {
  const onPointerDown = useCropDrag(crop, aspect, onChange);
  return (
    <div
      onPointerDown={onPointerDown}
      style={{ aspectRatio: aspect }}
      className={cn("relative max-w-full cursor-grab touch-none overflow-hidden bg-black active:cursor-grabbing", className)}
    >
      <SafeImage
        src={crop.src}
        alt={alt}
        fill
        sizes="360px"
        draggable={false}
        className="object-cover select-none"
        style={{ transform: cropTransform(crop) }}
      />
      {overlay && (
        <span aria-hidden className="pointer-events-none absolute inset-0">
          {overlay}
        </span>
      )}
    </div>
  );
}
