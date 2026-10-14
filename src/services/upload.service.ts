import { http } from "@/lib/api";

/** Response of POST /api/uploads. */
export interface UploadedImage {
  url: string;
  width: number;
  height: number;
  type: "IMAGE";
}

export const uploadService = {
  image: (file: Blob, filename: string) => {
    const form = new FormData();
    form.append("file", file, filename);
    // The client defaults to JSON, which makes axios serialize FormData as JSON. A multipart
    // type keeps it as FormData; axios then drops the header so the browser adds the boundary.
    return http.post<UploadedImage>("/api/uploads", form, { headers: { "Content-Type": "multipart/form-data" } });
  },
};
