import type { ID } from "@/types";

/** Query keys for backend data, shared by the hooks that read it and the mutations that update it. */
export const queryKeys = {
  feed: ["feed"] as const,
  post: (postId: ID) => ["post", postId] as const,
  comments: (postId: ID) => ["comments", postId] as const,
  profile: (username: string) => ["profile", username] as const,
  /** Prefix of every user's posts list, for updates that touch all of them. */
  allUserPosts: ["user-posts"] as const,
  userPosts: (username: string) => ["user-posts", username] as const,
  followers: (username: string) => ["followers", username] as const,
  following: (username: string) => ["following", username] as const,
  storyTray: ["story-tray"] as const,
  userStories: (userId: ID) => ["user-stories", userId] as const,
  storyViewers: (storyId: ID) => ["story-viewers", storyId] as const,
};
