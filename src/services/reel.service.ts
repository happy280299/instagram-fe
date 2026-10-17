import { http } from "@/lib/api";
import type { ID } from "@/types";
import { fetchExcludePage } from "./feed.service";

export const reelService = {
  /** A batch of recommended reels; pages by excluding what's been shown (see `fetchExcludePage`). */
  list: (params: { cursor: string | null; limit: number }) => fetchExcludePage("/api/reels", params),
  /** Counts a view (call once ~3s into playback). The author's and guests' views aren't counted. */
  recordView: (reelId: ID) => http.post<{ viewCount: number }>(`/api/reels/${reelId}/view`).then((r) => r.viewCount),
};
