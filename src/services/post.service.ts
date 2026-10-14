import { http } from "@/lib/api";
import type { ID, PostWithAuthor } from "@/types";
import { toFeedPost, type BackendFeedPost } from "./feed.service";

/** Body of POST /api/posts. Media URLs must come from POST /api/uploads. */
export interface CreatePostBody {
  caption: string;
  location?: string | null;
  media: { url: string; width?: number; height?: number }[];
}

export const postService = {
  getByIds: (ids: ID[]) => http.get<PostWithAuthor[]>("/api/posts", { params: { ids: ids.join(",") } }),
  getById: (postId: ID) => http.get<BackendFeedPost>(`/api/posts/${postId}`).then(toFeedPost),
  // The backend answers with the same shape as a feed item, so the feed mapper applies.
  create: (body: CreatePostBody) => http.post<BackendFeedPost>("/api/posts", body).then(toFeedPost),
  setLiked: (postId: ID, liked: boolean) => http.post(`/api/posts/${postId}/like`, { liked }),
  setSaved: (postId: ID, saved: boolean) => http.post(`/api/posts/${postId}/save`, { saved }),
};
