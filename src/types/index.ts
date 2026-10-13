export type ID = string;
/** ISO-8601 timestamp */
export type ISODate = string;

export interface Highlight {
  id: ID;
  title: string;
  cover: string;
}

export interface User {
  id: ID;
  username: string;
  fullName: string;
  avatar: string;
  bio: string;
  website: string | null;
  isVerified: boolean;
  followers: number;
  following: number;
  postsCount: number;
  highlights: Highlight[];
}

/** Lightweight user shape for lists, headers and mentions. */
export type UserSummary = Pick<User, "id" | "username" | "fullName" | "avatar" | "isVerified">;

export interface Media {
  id: ID;
  url: string;
  width: number;
  height: number;
  alt: string;
}

export interface Post {
  id: ID;
  authorId: ID;
  media: Media[];
  caption: string;
  location: string | null;
  likes: number;
  commentsCount: number;
  taggedUserIds: ID[];
  createdAt: ISODate;
}

export interface PostWithAuthor extends Post {
  author: UserSummary;
  /** Latest comments shown under the post in the feed (backend feed only). */
  previewComments?: PreviewComment[];
}

export interface PreviewComment {
  id: ID;
  text: string;
  author: Pick<UserSummary, "id" | "username">;
}

export interface Comment {
  id: ID;
  postId: ID;
  authorId: ID;
  parentId: ID | null;
  text: string;
  likes: number;
  createdAt: ISODate;
  /** Written by the viewer, so they can delete it. */
  isMine?: boolean;
}

export interface CommentWithAuthor extends Comment {
  author: UserSummary;
}

export interface StorySlide {
  id: ID;
  url: string;
  createdAt: ISODate;
  /** Defaults to "image". */
  type?: "image" | "video";
  /** How long the slide shows, in ms (videos use their own length once loaded). */
  duration?: number;
  /** The viewer has already seen this slide (backend stories only). */
  isSeen?: boolean;
}

export interface Story {
  id: ID;
  userId: ID;
  slides: StorySlide[];
}

export interface StoryWithUser extends Story {
  user: UserSummary;
}

/** One avatar in the story bar: a user with active stories. */
export interface StoryTrayItem {
  user: UserSummary;
  isMe: boolean;
  storyCount: number;
  hasUnseen: boolean;
  latestAt: ISODate;
}

/** A user's active stories, opened from the story bar. */
export interface UserStories extends StoryWithUser {
  isMe: boolean;
  /** First unseen slide, or 0 when all have been seen. */
  startIndex: number;
}

export interface Reel {
  id: ID;
  authorId: ID;
  videoUrl: string;
  poster: string;
  caption: string;
  audio: string;
  likes: number;
  commentsCount: number;
  createdAt: ISODate;
}

export interface ReelWithAuthor extends Reel {
  author: UserSummary;
}

export interface Message {
  id: ID;
  conversationId: ID;
  senderId: ID;
  text: string;
  createdAt: ISODate;
}

export interface Conversation {
  id: ID;
  participantIds: ID[];
  messages: Message[];
}

export interface ConversationPreview {
  id: ID;
  participant: UserSummary;
  lastMessage: Message | null;
  unread: boolean;
}

export interface ConversationDetail {
  id: ID;
  participant: UserSummary;
  messages: Message[];
}

export type NotificationType = "like" | "comment" | "follow" | "mention";

export interface Notification {
  id: ID;
  type: NotificationType;
  actorId: ID;
  postId: ID | null;
  text: string | null;
  read: boolean;
  createdAt: ISODate;
}

export interface NotificationWithActor extends Notification {
  actor: UserSummary;
  postThumb: string | null;
}

export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
}

export type ProfileTab = "posts" | "reels" | "saved" | "tagged";

export interface ApiError {
  error: string;
}

/** Success envelope used by the backend for every response. */
export interface ApiSuccess<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  /** Present on paginated endpoints. */
  meta?: unknown;
}

/** Error envelope used by the backend (`message` = first error, `errors` = all validation errors). */
export interface ApiFailure {
  success: false;
  statusCode: number;
  message: string;
  errors?: string[];
}

export interface CommentThread extends CommentWithAuthor {
  replies: CommentWithAuthor[];
}

export interface Session {
  user: User;
  followingIds: ID[];
  /** JWT from the real backend; mock sessions (e.g. sign-up) have none. */
  accessToken?: string;
}

/** Response body of the backend's POST /api/auth/login. */
export interface AuthResponse {
  accessToken: string;
  user: BackendUser;
}

/** User as the backend returns it (no password). */
export interface BackendUser {
  id: number;
  email: string;
  username: string;
  name: string;
  avatarUrl: string;
  bio: string;
  isVerified: boolean;
  role: string;
  createdAt: ISODate;
}

/** Response of GET/PATCH /api/auth/me: the user plus profile counts. */
export interface BackendProfile extends BackendUser {
  postCount: number;
  followerCount: number;
  followingCount: number;
}

/** Body of PATCH /api/auth/me; send only the fields that changed. "" clears bio/avatarUrl. */
export interface UpdateProfileBody {
  name?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody extends LoginBody {
  name: string;
}
