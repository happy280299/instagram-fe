import { client, http } from "@/lib/api";
import type { BackendProfile, User, UserSummary } from "@/types";
import { toUser } from "./auth.service";
import { toFeedPage, type BackendFeedPost } from "./feed.service";

/** Response of GET /api/users/:username: a public profile plus viewer-specific flags. */
export interface BackendPublicProfile extends Omit<BackendProfile, "email" | "role"> {
  isFollowing: boolean;
  isMe: boolean;
}

export interface Profile {
  user: User;
  isMe: boolean;
  isFollowing: boolean;
}

export const userService = {
  list: (limit: number) => http.get<UserSummary[]>("/api/users", { params: { limit } }),
  search: (q: string) => http.get<UserSummary[]>("/api/search", { params: { q } }),
  setFollowing: (username: string, follow: boolean) => http.post(`/api/users/${username}/follow`, { follow }),
  profile: (username: string) =>
    http
      .get<BackendPublicProfile>(`/api/users/${encodeURIComponent(username)}`)
      .then((p): Profile => ({ user: toUser(p), isMe: p.isMe, isFollowing: p.isFollowing })),
  /** A user's posts, newest first. */
  posts: (username: string, params: { cursor?: string | null; limit?: number }) =>
    client.get<BackendFeedPost[]>(`/api/users/${encodeURIComponent(username)}/posts`, { params }).then(toFeedPage),
};
