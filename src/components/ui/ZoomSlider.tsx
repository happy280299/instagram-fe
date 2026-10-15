import { ZoomIn } from "lucide-react";
import { cn } from "@/lib/cn";

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;

/** Labelled zoom range input for crop frames. */
export function ZoomSlider({ value, onChange, className }: { value: number; onChange: (zoom: number) => void; className?: string }) {
  return (
    <label className={cn("flex items-center gap-2 text-sm", className)}>
      <ZoomIn aria-hidden className="size-4" />
      <span className="sr-only">Zoom</span>
      <input
        type="range"
        min={MIN_ZOOM}
        max={MAX_ZOOM}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-40"
      />
    </label>
  );
}
