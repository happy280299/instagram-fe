"use client";

import { Crop, ZoomIn } from "lucide-react";
import { type PointerEvent, useRef } from "react";
import { cn } from "@/lib/cn";
import { DraftPreview } from "./DraftPreview";
import { ASPECTS, type AspectId, clampPan, type Draft } from "./types";

export function CropStep({ draft, onChange }: { draft: Draft; onChange: (draft: Draft) => void }) {
  const drag = useRef<{ x: number; y: number; ox: number; oy: number; w: number; h: number } | null>(null);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: draft.offsetX, oy: draft.offsetY, w: rect.width, h: rect.height };
    const move = (ev: globalThis.PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      onChange(clampPan({ ...draft, offsetX: d.ox + (ev.clientX - d.x) / d.w, offsetY: d.oy + (ev.clientY - d.y) / d.h }));
    };
    const up = () => {
      drag.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <div className="relative aspect-square w-full md:h-full md:w-auto">
      <DraftPreview draft={draft} grid onPointerDown={onPointerDown} className="cursor-grab active:cursor-grabbing" />
      <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
        <fieldset className="flex gap-1 rounded-lg bg-black/70 p-1">
          <legend className="sr-only">Crop ratio</legend>
          <Crop aria-hidden className="text-on-media m-1.5 size-4" />
          {(Object.keys(ASPECTS) as AspectId[]).map((id) => (
            <label key={id} className={cn("text-on-media cursor-pointer rounded-md px-2 py-1 text-xs font-semibold has-[:focus-visible]:outline-2", draft.aspect === id ? "bg-on-media/30" : "opacity-60")}>
              <input type="radio" name="aspect" className="sr-only" checked={draft.aspect === id} onChange={() => onChange(clampPan({ ...draft, aspect: id }))} />
              {id}
            </label>
          ))}
        </fieldset>
        <label className="text-on-media flex items-center gap-2 rounded-lg bg-black/70 px-3 py-2">
          <ZoomIn aria-hidden className="size-4" />
          <span className="sr-only">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={draft.zoom}
            onChange={(e) => onChange(clampPan({ ...draft, zoom: Number(e.target.value) }))}
            className="accent-on-media w-24"
          />
        </label>
      </div>
    </div>
  );
}
