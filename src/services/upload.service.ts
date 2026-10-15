import { http } from "@/lib/api";

/** Response of POST /api/uploads. */
interface BackendUpload {
  url: string;
  type: "IMAGE" | "VIDEO";
  width: number;
  height: number;
  /** Seconds; videos only. */
  duration?: number;
  /** Cover image; videos only. */
  thumbnailUrl?: string | null;
}

export interface UploadedMedia {
  url: string;
  type: "image" | "video";
  width: number;
  height: number;
}

export const uploadService = {
  /** Uploads a photo or video. Videos come back as mp4 (max 720p). */
  media: (file: Blob, filename: string) => {
    const form = new FormData();
    form.append("file", file, filename);
    // The client defaults to JSON, which makes axios serialize FormData as JSON. A multipart
    // type keeps it as FormData; axios then drops the header so the browser adds the boundary.
    return http
      .post<BackendUpload>("/api/uploads", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((u): UploadedMedia => ({ url: u.url, type: u.type === "VIDEO" ? "video" : "image", width: u.width, height: u.height }));
  },
};
