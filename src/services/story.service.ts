import type { AxiosResponse } from "axios";
import { client, http } from "@/lib/api";
import type { ID, ISODate, Paginated, StorySlide, StoryTrayItem, UserStories, UserSummary } from "@/types";

interface BackendStoryUser {
  id: number;
  username: string;
  name: string;
  avatarUrl: string;
  isVerified: boolean;
  isMe: boolean;
}

/** Item of GET /api/stories. */
export interface BackendStoryTrayItem {
  user: BackendStoryUser;
  storyCount: number;
  hasUnseen: boolean;
  latestAt: ISODate;
}

/** Story inside GET /api/stories/users/:userId. */
export interface BackendStory {
  id: number;
  mediaUrl: string;
  type: "IMAGE" | "VIDEO";
  duration: number;
  createdAt: ISODate;
  expiresAt: ISODate;
  isSeen: boolean;
  /** Only sent to the story's author. */
  viewCount?: number;
  /** Cover image of a video story; null for photos. */
  thumbnailUrl: string | null;
}

export interface BackendUserStories {
  user: BackendStoryUser;
  stories: BackendStory[];
  startIndex: number;
}

function toUserSummary(u: BackendStoryUser): UserSummary {
  return {
    id: String(u.id),
    username: u.username,
    fullName: u.name,
    avatar: u.avatarUrl || `https://i.pravatar.cc/150?u=${u.username}`,
    isVerified: u.isVerified,
  };
}

function toSlide(s: BackendStory): StorySlide {
  return {
    id: String(s.id),
    url: s.mediaUrl,
    createdAt: s.createdAt,
    type: s.type === "VIDEO" ? "video" : "image",
    duration: s.duration,
    isSeen: s.isSeen,
    viewCount: s.viewCount,
    poster: s.thumbnailUrl ?? undefined,
  };
}

/** Item of GET /api/stories/:id/viewers. */
interface BackendStoryViewer {
  id: number;
  username: string;
  name: string;
  avatarUrl: string;
  isVerified: boolean;
  /** Whether the story's author follows this viewer. */
  isFollowing: boolean;
  viewedAt: ISODate;
}

/** Someone who saw the viewer's story, most recent first. */
export interface StoryViewer extends UserSummary {
  isFollowing: boolean;
  viewedAt: ISODate;
}

function toViewersPage({ data, meta }: AxiosResponse<BackendStoryViewer[]>): Paginated<StoryViewer> {
  const { nextCursor } = (meta ?? {}) as { nextCursor?: number | null };
  return {
    items: data.map((v) => ({
      id: String(v.id),
      username: v.username,
      fullName: v.name,
      avatar: v.avatarUrl || `https://i.pravatar.cc/150?u=${v.username}`,
      isVerified: v.isVerified,
      isFollowing: v.isFollowing,
      viewedAt: v.viewedAt,
    })),
    nextCursor: nextCursor == null ? null : String(nextCursor),
  };
}

function toUserStories({ user, stories, startIndex }: BackendUserStories): UserStories {
  const userId = String(user.id);
  return {
    // The backend groups stories per user, so the user is the group's identity.
    id: userId,
    userId,
    user: toUserSummary(user),
    isMe: user.isMe,
    startIndex: Math.min(Math.max(startIndex, 0), Math.max(stories.length - 1, 0)),
    slides: stories.map(toSlide),
  };
}

export const storyService = {
  tray: () =>
    http.get<BackendStoryTrayItem[]>("/api/stories").then((items) =>
      items.map(
        (i): StoryTrayItem => ({
          user: toUserSummary(i.user),
          isMe: i.user.isMe,
          storyCount: i.storyCount,
          hasUnseen: i.hasUnseen,
          latestAt: i.latestAt,
        }),
      ),
    ),
  byUser: (userId: ID) => http.get<BackendUserStories>(`/api/stories/users/${userId}`).then(toUserStories),
  /** Posts a story from a URL returned by POST /api/uploads. */
  create: (mediaUrl: string) => http.post<BackendStory>("/api/stories", { mediaUrl }).then(toSlide),
  /** Deletes one of the viewer's stories. */
  remove: (storyId: ID) => http.delete(`/api/stories/${storyId}`),
  /** Who saw one of the viewer's stories (owner only). */
  viewers: (storyId: ID, params: { cursor?: string | null; limit?: number }) =>
    client.get<BackendStoryViewer[]>(`/api/stories/${storyId}/viewers`, { params }).then(toViewersPage),
  markSeen: (storyId: ID) => http.post(`/api/stories/${storyId}/view`),
};
