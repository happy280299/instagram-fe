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

function toListUser(u: BackendListUser): FollowListUser {
  return {
    id: String(u.id),
    username: u.username,
    fullName: u.name,
    avatar: u.avatarUrl || `https://i.pravatar.cc/150?u=${u.username}`,
    isVerified: u.isVerified,
    isFollowing: u.isFollowing,
    isMe: u.isMe,
  };
}

function toFollowListPage({ data, meta }: AxiosResponse<BackendListUser[]>): Paginated<FollowListUser> {
  const { nextCursor } = (meta ?? {}) as { nextCursor?: number | null };
  return { items: data.map(toListUser), nextCursor: nextCursor == null ? null : String(nextCursor) };
}

/** Item of GET /api/users/search. */
interface BackendSearchUser extends BackendListUser {
  followerCount: number;
}

/** A search result, with what the search panel shows under the name. */
export interface SearchUser extends FollowListUser {
  followerCount: number;
}

/** Longest query GET /api/users/search accepts. */
export const SEARCH_MAX_LENGTH = 30;
const SEARCH_LIMIT = 20;

/** Item of GET /api/users/suggestions: someone you don't follow, and why they're suggested. */
interface BackendSuggestion {
  id: number;
  username: string;
  name: string;
  avatarUrl: string;
  isVerified: boolean;
  followerCount: number;
  followsYou: boolean;
  mutualCount: number;
  /** Up to 2 usernames of people you follow who follow them. */
  mutuals: string[];
}

export interface SuggestedUser extends UserSummary {
  followsYou: boolean;
  mutualCount: number;
  mutuals: string[];
}

export const userService = {
  list: (limit: number) => http.get<UserSummary[]>("/api/users", { params: { limit } }),
  /** Top matches by username or name (accents ignored), people you follow first. No pagination. */
  search: (q: string) =>
    http
      .get<BackendSearchUser[]>("/api/users/search", { params: { q, limit: SEARCH_LIMIT } })
      .then((users) => users.map((u): SearchUser => ({ ...toListUser(u), followerCount: u.followerCount }))),
  setFollowing: (username: string, follow: boolean) => {
    const url = `/api/users/${encodeURIComponent(username)}/follow`;
    return (follow ? http.post<BackendFollowState>(url) : http.delete<BackendFollowState>(url)).then(toFollowState);
  },
  profile: (username: string) =>
    http
      .get<BackendPublicProfile>(`/api/users/${encodeURIComponent(username)}`)
      .then((p): Profile => ({ user: toUser(p), isMe: p.isMe, isFollowing: p.isFollowing })),
  /** People to follow: ones who follow you and ones with many mutuals first. */
  suggestions: (limit: number) =>
    http.get<BackendSuggestion[]>("/api/users/suggestions", { params: { limit } }).then((list) =>
      list.map(
        (u): SuggestedUser => ({
          id: String(u.id),
          username: u.username,
          fullName: u.name,
          avatar: u.avatarUrl || `https://i.pravatar.cc/150?u=${u.username}`,
          isVerified: u.isVerified,
          followsYou: u.followsYou,
          mutualCount: u.mutualCount,
          mutuals: u.mutuals,
        }),
      ),
    ),
  /** People who follow `username`, most recent first. */
  followers: (username: string, params: { cursor?: string | null; limit?: number }) =>
    client.get<BackendListUser[]>(`/api/users/${encodeURIComponent(username)}/followers`, { params }).then(toFollowListPage),
  /** People `username` follows, most recent first. */
  following: (username: string, params: { cursor?: string | null; limit?: number }) =>
    client.get<BackendListUser[]>(`/api/users/${encodeURIComponent(username)}/following`, { params }).then(toFollowListPage),
  /** A user's reels, including ones not shared to the feed. */
  reels: (username: string, params: { cursor?: string | null; limit?: number }) =>
    client.get<BackendFeedPost[]>(`/api/users/${encodeURIComponent(username)}/reels`, { params }).then(toFeedPage),
  /** A user's posts, newest first. */
  posts: (username: string, params: { cursor?: string | null; limit?: number }) =>
    client.get<BackendFeedPost[]>(`/api/users/${encodeURIComponent(username)}/posts`, { params }).then(toFeedPage),
};
