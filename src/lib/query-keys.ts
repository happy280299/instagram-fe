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
  /** The viewer's saved posts; reset with the session like every key. */
  savedPosts: ["saved-posts"] as const,
  /** The Reels tab, optionally starting at one reel (?r=). */
  reels: (startId: ID | null) => ["reels", startId] as const,
  userReels: (username: string) => ["user-reels", username] as const,
  followers: (username: string) => ["followers", username] as const,
  following: (username: string) => ["following", username] as const,
  userSearch: (q: string) => ["user-search", q] as const,
  notifications: ["notifications"] as const,
  unreadNotifications: ["notifications-unread"] as const,
  conversations: ["conversations"] as const,
  /** Prefix of every single-conversation entry, for updates that touch all of them. */
  allConversations: ["conversation"] as const,
  conversation: (id: ID) => ["conversation", id] as const,
  messages: (conversationId: ID) => ["messages", conversationId] as const,
  chatUnread: ["chat-unread"] as const,
  storyTray: ["story-tray"] as const,
  userStories: (userId: ID) => ["user-stories", userId] as const,
  storyViewers: (storyId: ID) => ["story-viewers", storyId] as const,
};
