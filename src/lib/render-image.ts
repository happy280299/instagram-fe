interface RenderOptions {
  src: string;
  aspect: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
  filter: string;
  outputWidth?: number;
}

/** Crops, zooms, pans and filters an image on a canvas; returns a JPEG data URL. */
export async function renderImage({ src, aspect, zoom, offsetX, offsetY, filter, outputWidth = 1080 }: RenderOptions) {
  const img = await loadImage(src);
  const width = outputWidth;
  const height = Math.round(outputWidth / aspect);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight) * zoom;
  const drawW = img.naturalWidth * scale;
  const drawH = img.naturalHeight * scale;
  ctx.filter = filter === "none" ? "none" : filter;
  ctx.drawImage(img, (width - drawW) / 2 + offsetX * width, (height - drawH) / 2 + offsetY * height, drawW, drawH);
  return { url: canvas.toDataURL("image/jpeg", 0.85), width, height };
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}
