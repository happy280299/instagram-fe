"use client";

import type { PointerEvent } from "react";
import { useRef } from "react";
import { clampPan, type CropState } from "@/lib/image-crop";

/** Pointer handler that pans `crop` by dragging the frame, kept within the frame's bounds. */
export function useCropDrag<T extends CropState>(crop: T, aspect: number, onChange: (crop: T) => void) {
  const drag = useRef<{ x: number; y: number; ox: number; oy: number; w: number; h: number } | null>(null);

  return function onPointerDown(e: PointerEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: crop.offsetX, oy: crop.offsetY, w: rect.width, h: rect.height };
    const move = (ev: globalThis.PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      onChange(clampPan({ ...crop, offsetX: d.ox + (ev.clientX - d.x) / d.w, offsetY: d.oy + (ev.clientY - d.y) / d.h }, aspect));
    };
    const up = () => {
      drag.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
}
