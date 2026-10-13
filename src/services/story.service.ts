import { http } from "@/lib/api";
import type { ID, ISODate, StoryTrayItem, UserStories, UserSummary } from "@/types";

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

function toUserStories({ user, stories, startIndex }: BackendUserStories): UserStories {
  const userId = String(user.id);
  return {
    // The backend groups stories per user, so the user is the group's identity.
    id: userId,
    userId,
    user: toUserSummary(user),
    isMe: user.isMe,
    startIndex: Math.min(Math.max(startIndex, 0), Math.max(stories.length - 1, 0)),
    slides: stories.map((s) => ({
      id: String(s.id),
      url: s.mediaUrl,
      createdAt: s.createdAt,
      type: s.type === "VIDEO" ? "video" : "image",
      duration: s.duration,
      isSeen: s.isSeen,
    })),
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
  markSeen: (storyId: ID) => http.post(`/api/stories/${storyId}/view`),
};
