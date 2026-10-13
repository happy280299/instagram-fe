import { http } from "@/lib/api";
import type { ID, Media, PostWithAuthor } from "@/types";

export interface CreatePostBody {
  caption: string;
  media: Omit<Media, "id">[];
}

export const postService = {
  getByIds: (ids: ID[]) => http.get<PostWithAuthor[]>("/api/posts", { params: { ids: ids.join(",") } }),
  create: (body: CreatePostBody) => http.post<PostWithAuthor>("/api/posts", body),
  setLiked: (postId: ID, liked: boolean) => http.post(`/api/posts/${postId}/like`, { liked }),
  setSaved: (postId: ID, saved: boolean) => http.post(`/api/posts/${postId}/save`, { saved }),
};
