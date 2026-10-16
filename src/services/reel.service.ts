import { client, http } from "@/lib/api";
import type { ID, Paginated } from "@/types";
import { toFeedPost, type BackendFeedPost, type FeedPost } from "./feed.service";

/** GET /api/reels accepts at most this many ids in `exclude`. */
const MAX_EXCLUDE = 200;

const parseIds = (cursor: string | null) => (cursor ? cursor.split(",").filter((id) => /^\d+$/.test(id)) : []);

export const reelService = {
  /**
   * A batch of recommended reels. The backend has no cursor: each batch excludes the ids already
   * shown. That list rides in `cursor`, so it plugs into the usual paginated hook.
   */
  list: async ({ cursor, limit }: { cursor: string | null; limit: number }): Promise<Paginated<FeedPost>> => {
    const shown = parseIds(cursor);
    const exclude = shown.slice(-MAX_EXCLUDE);
    const { data, meta } = await client.get<BackendFeedPost[]>("/api/reels", {
      params: { limit, ...(exclude.length ? { exclude: exclude.join(",") } : {}) },
    });
    const items = data.map(toFeedPost);
    const hasMore = typeof meta === "object" && meta !== null && "hasMore" in meta && meta.hasMore === true;
    return { items, nextCursor: hasMore ? [...shown, ...items.map((p) => p.id)].join(",") : null };
  },
  /** Counts a view (call once ~3s into playback). The author's and guests' views aren't counted. */
  recordView: (reelId: ID) => http.post<{ viewCount: number }>(`/api/reels/${reelId}/view`).then((r) => r.viewCount),
};
