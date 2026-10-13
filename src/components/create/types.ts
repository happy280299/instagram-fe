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
}

/** Max pan (as a fraction of frame size) so the image always covers the frame. */
export function panLimits(draft: Draft): { x: number; y: number } {
  const frame = ASPECTS[draft.aspect];
  const image = draft.width / draft.height;
  // Size of the object-cover'd image relative to the frame, before zoom.
  const relW = image > frame ? image / frame : 1;
  const relH = image > frame ? 1 : frame / image;
  return {
    x: Math.max((relW * draft.zoom - 1) / 2, 0),
    y: Math.max((relH * draft.zoom - 1) / 2, 0),
  };
}

export function clampPan(draft: Draft): Draft {
  const { x, y } = panLimits(draft);
  return {
    ...draft,
    offsetX: Math.min(Math.max(draft.offsetX, -x), x),
    offsetY: Math.min(Math.max(draft.offsetY, -y), y),
  };
}
