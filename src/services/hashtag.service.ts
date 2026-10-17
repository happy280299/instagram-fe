import { client, http } from "@/lib/api";
import type { Paginated } from "@/types";
import { toFeedPage, type BackendFeedPost, type FeedPost } from "./feed.service";

export interface Hashtag {
  /** Lowercased, without "#". */
  name: string;
  postCount: number;
}

export const hashtagService = {
  /** Suggestions while typing "#…" (accents and case don't matter). */
  search: (q: string) => http.get<Hashtag[]>("/api/hashtags/search", { params: { q } }),
  /** 404 when no live post uses it. */
  get: (name: string) => http.get<Hashtag>(`/api/hashtags/${encodeURIComponent(name)}`),
  /** Posts and reels with the tag, newest first. */
  posts: (name: string, params: { cursor?: string | null; limit?: number }): Promise<Paginated<FeedPost>> =>
    client.get<BackendFeedPost[]>(`/api/hashtags/${encodeURIComponent(name)}/posts`, { params }).then(toFeedPage),
};
