import type { ID } from "@/types";

/** Query keys for backend data, shared by the hooks that read it and the mutations that update it. */
export const queryKeys = {
  feed: ["feed"] as const,
  post: (postId: ID) => ["post", postId] as const,
  comments: (postId: ID) => ["comments", postId] as const,
  profile: (username: string) => ["profile", username] as const,
  userPosts: (username: string) => ["user-posts", username] as const,
  storyTray: ["story-tray"] as const,
  userStories: (userId: ID) => ["user-stories", userId] as const,
};
