import type { CropSource } from "@/lib/image-crop";
import { loadImage } from "@/lib/render-image";

/** Same limits as POST /api/uploads. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const MAX_POST_VIDEO_SECONDS = 90;
export const MAX_STORY_VIDEO_SECONDS = 60;
/** Video containers the backend accepts (it converts them all to mp4). */
export const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"] as const;

/** Why a picked file can't be used as a photo, or null when it can. Photos are re-encoded on a canvas before upload. */
export function imageFileError(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Only image files are supported.";
  if (file.size > MAX_IMAGE_BYTES) return "This file is too large (max 10 MB).";
  return null;
}

export const isVideoFile = (file: File) => file.type.startsWith("video/");

/**
 * Opens a picked photo for cropping: validates it and reads its size. The returned `src` is an
 * object URL the caller must revoke. Rejects with a message to show the user.
 */
export async function openImageFile(file: File): Promise<CropSource> {
  const error = imageFileError(file);
  if (error) throw new Error(error);
  const src = URL.createObjectURL(file);
  try {
    const img = await loadImage(src);
    return { src, width: img.naturalWidth, height: img.naturalHeight, zoom: 1, offsetX: 0, offsetY: 0 };
  } catch {
    URL.revokeObjectURL(src);
    throw new Error("That image couldn't be opened.");
  }
}

/** A picked video ready to preview and upload as-is. `src` is an object URL the caller must revoke. */
export interface VideoFile {
  file: File;
  src: string;
  width: number;
  height: number;
  /** Seconds. */
  duration: number;
}

/**
 * Validates a picked video (type, size, length) by reading its metadata in the browser.
 * Rejects with a message to show the user.
 */
export async function openVideoFile(file: File, maxSeconds: number): Promise<VideoFile> {
  if (!VIDEO_TYPES.some((t) => t === file.type)) throw new Error("Only MP4, MOV or WebM videos are supported.");
  if (file.size > MAX_VIDEO_BYTES) throw new Error("This video is too large (max 50 MB).");
  const src = URL.createObjectURL(file);
  try {
    const { width, height, duration } = await readVideoMetadata(src);
    if (duration > maxSeconds) throw new Error(`Videos can be up to ${maxSeconds} seconds.`);
    return { file, src, width, height, duration };
  } catch (err) {
    URL.revokeObjectURL(src);
    throw err instanceof Error && err.message.startsWith("Videos can be") ? err : new Error("That video couldn't be opened.");
  }
}

function readVideoMetadata(src: string): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => resolve({ width: video.videoWidth, height: video.videoHeight, duration: video.duration });
    video.onerror = () => reject(new Error("Could not read video"));
    video.src = src;
  });
}
