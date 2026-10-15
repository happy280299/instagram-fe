export type AspectId = "1:1" | "4:5" | "16:9";

export const ASPECTS: Record<AspectId, number> = { "1:1": 1, "4:5": 4 / 5, "16:9": 16 / 9 };

export interface Filter {
  id: string;
  name: string;
  /** CSS / canvas filter string. */
  css: string;
}

export const FILTERS: Filter[] = [
  { id: "normal", name: "Original", css: "none" },
  { id: "clarendon", name: "Clarendon", css: "contrast(1.2) saturate(1.35)" },
  { id: "gingham", name: "Gingham", css: "brightness(1.05) hue-rotate(-10deg)" },
  { id: "moon", name: "Moon", css: "grayscale(1) contrast(1.1) brightness(1.1)" },
  { id: "lark", name: "Lark", css: "contrast(0.9) brightness(1.1) saturate(1.1)" },
  { id: "reyes", name: "Reyes", css: "sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)" },
  { id: "juno", name: "Juno", css: "saturate(1.4) contrast(1.1) sepia(0.15)" },
  { id: "aden", name: "Aden", css: "hue-rotate(-20deg) contrast(0.9) saturate(0.85) brightness(1.2)" },
];

export interface Draft {
  src: string;
  name: string;
  width: number;
  height: number;
  aspect: AspectId;
  zoom: number;
  /** Pan offset as a fraction of the frame size. */
  offsetX: number;
  offsetY: number;
  filter: Filter;
  /** Set for a video: uploaded as-is, so crop and filters don't apply. */
  video?: File;
}

/** Frame closest to a video's shape, matching how the feed will show it (no taller than 4:5). */
export function nearestAspect(width: number, height: number): AspectId {
  const ratio = width / height;
  if (ratio < 0.9) return "4:5";
  if (ratio > 1.3) return "16:9";
  return "1:1";
}
