/** Zoom and pan of an image shown object-cover in a frame (the same model `renderImage` draws). */
export interface CropState {
  /** Natural size of the image. */
  width: number;
  height: number;
  zoom: number;
  /** Pan offset as a fraction of the frame size. */
  offsetX: number;
  offsetY: number;
}

/** A picked image (object URL) and how it's framed. */
export interface CropSource extends CropState {
  src: string;
}

/** Max pan (as a fraction of frame size) so the image always covers a frame of `aspect` (width / height). */
export function panLimits(crop: CropState, aspect: number): { x: number; y: number } {
  const image = crop.width / crop.height;
  // Size of the object-cover'd image relative to the frame, before zoom.
  const relW = image > aspect ? image / aspect : 1;
  const relH = image > aspect ? 1 : aspect / image;
  return {
    x: Math.max((relW * crop.zoom - 1) / 2, 0),
    y: Math.max((relH * crop.zoom - 1) / 2, 0),
  };
}

export function clampPan<T extends CropState>(crop: T, aspect: number): T {
  const { x, y } = panLimits(crop, aspect);
  return {
    ...crop,
    offsetX: Math.min(Math.max(crop.offsetX, -x), x),
    offsetY: Math.min(Math.max(crop.offsetY, -y), y),
  };
}

/** CSS transform for the preview <img>, matching what `renderImage` draws. */
export function cropTransform(crop: CropState): string {
  return `translate(${crop.offsetX * 100}%, ${crop.offsetY * 100}%) scale(${crop.zoom})`;
}
