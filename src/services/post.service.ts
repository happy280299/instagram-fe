import { client, http } from "@/lib/api";
import type { ID, PostWithAuthor } from "@/types";
import { fetchExcludePage, toFeedPage, toFeedPost, type BackendFeedPost } from "./feed.service";

/** Body of POST /api/posts. Media URLs must come from POST /api/uploads. */
export interface CreatePostBody {
  caption: string;
  location?: string | null;
  media: { url: string; width?: number; height?: number }[];
  /** Reels (one video) only: false keeps it out of the feed and the main profile grid. Defaults to true. */
  shareToFeed?: boolean;
}

/** Response of POST/DELETE /api/posts/:id/like. */
interface BackendLikeState {
  postId: number;
  isLiked: boolean;
  likeCount: number;
}

export interface LikeState {
  isLiked: boolean;
  /** Total likes, the viewer's included. */
  likeCount: number;
}

const toLikeState = ({ isLiked, likeCount }: BackendLikeState): LikeState => ({ isLiked, likeCount });

/** Body of PATCH /api/posts/:id: send only what changed. Media can't be changed, like Instagram. */
export interface UpdatePostBody {
  caption?: string;
  /** "" removes it. */
  location?: string;
  /** Reels only. */
  shareToFeed?: boolean;
}

export const postService = {
  getByIds: (ids: ID[]) => http.get<PostWithAuthor[]>("/api/posts", { params: { ids: ids.join(",") } }),
  getById: (postId: ID) => http.get<BackendFeedPost>(`/api/posts/${postId}`).then(toFeedPost),
  // The backend answers with the same shape as a feed item, so the feed mapper applies.
  create: (body: CreatePostBody) => http.post<BackendFeedPost>("/api/posts", body).then(toFeedPost),
  /** Author only. Returns the post as a feed item. */
  update: (postId: ID, body: UpdatePostBody) => http.patch<BackendFeedPost>(`/api/posts/${postId}`, body).then(toFeedPost),
  /** Author or admin. Gone at once from feeds, profiles, saved posts and notifications. */
  remove: (postId: ID) => http.delete(`/api/posts/${postId}`),
  setLiked: (postId: ID, liked: boolean) =>
    (liked ? http.post<BackendLikeState>(`/api/posts/${postId}/like`) : http.delete<BackendLikeState>(`/api/posts/${postId}/like`)).then(
      toLikeState,
    ),
  setSaved: (postId: ID, saved: boolean) =>
    (saved ? http.post<{ isSaved: boolean }>(`/api/posts/${postId}/save`) : http.delete<{ isSaved: boolean }>(`/api/posts/${postId}/save`)).then(
      (r) => r.isSaved,
    ),
  /** Explore grid: posts and reels from people you don't follow, hottest first. Pages by `exclude`. */
  explore: (params: { cursor: string | null; limit: number }) => fetchExcludePage("/api/explore", params),
  /** The viewer's saved posts, most recently saved first. Private to the viewer. */
  saved: (params: { cursor?: string | null; limit?: number }) =>
    client.get<BackendFeedPost[]>("/api/posts/saved", { params }).then(toFeedPage),
};
