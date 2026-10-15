import { client, http } from "@/lib/api";
import type { AxiosResponse } from "axios";
import type { BackendProfile, Paginated, User, UserSummary } from "@/types";
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

/** Response of POST/DELETE /api/users/:username/follow. */
interface BackendFollowState {
  userId: number;
  isFollowing: boolean;
  followerCount: number;
}

export interface FollowState {
  isFollowing: boolean;
  /** The followed user's follower count, the viewer included. */
  followerCount: number;
}

const toFollowState = ({ isFollowing, followerCount }: BackendFollowState): FollowState => ({ isFollowing, followerCount });

/** Item of GET /api/users/:username/followers and /following. */
interface BackendListUser {
  id: number;
  username: string;
  name: string;
  avatarUrl: string;
  isVerified: boolean;
  isFollowing: boolean;
  isMe: boolean;
}

/** A user in a followers/following list, with the viewer's relation to them. */
export interface FollowListUser extends UserSummary {
  isFollowing: boolean;
  isMe: boolean;
}

function toFollowListPage({ data, meta }: AxiosResponse<BackendListUser[]>): Paginated<FollowListUser> {
  const { nextCursor } = (meta ?? {}) as { nextCursor?: number | null };
  return {
    items: data.map((u) => ({
      id: String(u.id),
      username: u.username,
      fullName: u.name,
      avatar: u.avatarUrl || `https://i.pravatar.cc/150?u=${u.username}`,
      isVerified: u.isVerified,
      isFollowing: u.isFollowing,
      isMe: u.isMe,
    })),
    nextCursor: nextCursor == null ? null : String(nextCursor),
  };
}

export const userService = {
  list: (limit: number) => http.get<UserSummary[]>("/api/users", { params: { limit } }),
  search: (q: string) => http.get<UserSummary[]>("/api/search", { params: { q } }),
  setFollowing: (username: string, follow: boolean) => {
    const url = `/api/users/${encodeURIComponent(username)}/follow`;
    return (follow ? http.post<BackendFollowState>(url) : http.delete<BackendFollowState>(url)).then(toFollowState);
  },
  profile: (username: string) =>
    http
      .get<BackendPublicProfile>(`/api/users/${encodeURIComponent(username)}`)
      .then((p): Profile => ({ user: toUser(p), isMe: p.isMe, isFollowing: p.isFollowing })),
  /** People who follow `username`, most recent first. */
  followers: (username: string, params: { cursor?: string | null; limit?: number }) =>
    client.get<BackendListUser[]>(`/api/users/${encodeURIComponent(username)}/followers`, { params }).then(toFollowListPage),
  /** People `username` follows, most recent first. */
  following: (username: string, params: { cursor?: string | null; limit?: number }) =>
    client.get<BackendListUser[]>(`/api/users/${encodeURIComponent(username)}/following`, { params }).then(toFollowListPage),
  /** A user's posts, newest first. */
  posts: (username: string, params: { cursor?: string | null; limit?: number }) =>
    client.get<BackendFeedPost[]>(`/api/users/${encodeURIComponent(username)}/posts`, { params }).then(toFeedPage),
};
