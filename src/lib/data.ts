import type {
  CommentThread,
  CommentWithAuthor,
  ConversationDetail,
  ConversationPreview,
  ID,
  Media,
  Message,
  NotificationWithActor,
  Paginated,
  Post,
  PostWithAuthor,
  ReelWithAuthor,
  Session,
  StoryWithUser,
  User,
  UserSummary,
} from "@/types";
import { MOCK_EMAIL_DOMAIN } from "./constants";
import { byNewest, db, findUser, newId, paginate, registerUser, summaryOf, toSummary } from "./db";

/**
 * Mock data layer. Server Components import these directly; Route Handlers in
 * /app/api wrap them with latency + JSON for client-side pagination/mutations.
 */

const withAuthor = (post: Post): PostWithAuthor => ({ ...post, author: summaryOf(post.authorId) });

// ---------- Users ----------
export function getUserByUsername(username: string): User | null {
  const name = decodeURIComponent(username).toLowerCase();
  return db.users.find((u) => u.username === name) ?? null;
}

export function getCurrentUser(): User {
  const user = findUser(db.currentUserId);
  if (!user) throw new Error("Missing current user fixture");
  return user;
}

export function createSession(email: string): Session | null {
  const [name, domain] = email.trim().toLowerCase().split("@");
  if (!name || domain !== MOCK_EMAIL_DOMAIN) return null;
  const user = getUserByUsername(name);
  if (!user) return null;
  return { user, followingIds: db.follows[user.id] ?? [] };
}

export const USERNAME_RE = /^[a-z0-9._]{3,30}$/;

/** Mock sign-up: adds a user to the in-memory db and returns a session. */
export function createUser(username: string, fullName: string): Session | { error: string } {
  const name = username.trim().toLowerCase();
  if (!USERNAME_RE.test(name)) return { error: "Usernames can only use letters, numbers, underscores and periods (3–30)." };
  if (getUserByUsername(name)) return { error: "A user with that username already exists." };
  const user: User = {
    id: newId("u"),
    username: name,
    fullName: fullName.trim().slice(0, 60) || name,
    avatar: `https://i.pravatar.cc/300?u=${encodeURIComponent(name)}`,
    bio: "",
    website: null,
    isVerified: false,
    followers: 0,
    following: 0,
    postsCount: 0,
    highlights: [],
  };
  db.users.push(user);
  registerUser(user);
  db.follows[user.id] = [];
  return { user, followingIds: [] };
}

export function getSuggestions(viewerId: ID, limit = 5): UserSummary[] {
  const following = new Set(db.follows[viewerId] ?? []);
  return db.users
    .filter((u) => u.id !== viewerId && !following.has(u.id))
    .slice(0, limit)
    .map(toSummary);
}

export function listUsers(viewerId: ID, limit = 20): UserSummary[] {
  const following = new Set(db.follows[viewerId] ?? []);
  return db.users
    .filter((u) => u.id !== viewerId)
    .sort((a, b) => Number(following.has(b.id)) - Number(following.has(a.id)))
    .slice(0, limit)
    .map(toSummary);
}

export function searchUsers(query: string, limit = 20): UserSummary[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return db.users
    .filter((u) => u.username.includes(q) || u.fullName.toLowerCase().includes(q))
    .slice(0, limit)
    .map(toSummary);
}

// ---------- Posts ----------
export function getFeed(cursor: string | null, limit = 6): Paginated<PostWithAuthor> {
  const page = paginate([...db.posts].sort(byNewest), cursor, limit);
  return { ...page, items: page.items.map(withAuthor) };
}

export function getPost(postId: ID): PostWithAuthor | null {
  const post = db.posts.find((p) => p.id === postId);
  return post ? withAuthor(post) : null;
}

export function getPostsByIds(ids: ID[]): PostWithAuthor[] {
  return ids.flatMap((id) => {
    const post = getPost(id);
    return post ? [post] : [];
  });
}

export function getUserPosts(userId: ID, cursor: string | null, limit = 12): Paginated<PostWithAuthor> {
  const posts = db.posts.filter((p) => p.authorId === userId).sort(byNewest);
  const page = paginate(posts, cursor, limit);
  return { ...page, items: page.items.map(withAuthor) };
}

export function getTaggedPosts(userId: ID, cursor: string | null, limit = 12): Paginated<PostWithAuthor> {
  const posts = db.posts.filter((p) => p.taggedUserIds.includes(userId)).sort(byNewest);
  const page = paginate(posts, cursor, limit);
  return { ...page, items: page.items.map(withAuthor) };
}

export function getExplore(cursor: string | null, limit = 15, tag?: string | null): Paginated<PostWithAuthor> {
  const needle = tag ? `#${tag.toLowerCase()}` : null;
  const ranked = db.posts
    .filter((p) => !needle || p.caption.toLowerCase().split(/\s+/).includes(needle))
    .sort((a, b) => b.likes - a.likes);
  const page = paginate(ranked, cursor, limit);
  return { ...page, items: page.items.map(withAuthor) };
}

export function getMorePostsFrom(authorId: ID, excludeId: ID, limit = 6): PostWithAuthor[] {
  return db.posts
    .filter((p) => p.authorId === authorId && p.id !== excludeId)
    .sort(byNewest)
    .slice(0, limit)
    .map(withAuthor);
}

export function createPost(authorId: ID, media: Omit<Media, "id">[], caption: string): PostWithAuthor {
  const id = newId("p");
  const post: Post = {
    id,
    authorId,
    media: media.map((m, i) => ({ ...m, id: `${id}m${i}` })),
    caption,
    location: null,
    likes: 0,
    commentsCount: 0,
    taggedUserIds: [],
    createdAt: new Date().toISOString(),
  };
  db.posts.unshift(post);
  const author = findUser(authorId);
  if (author) author.postsCount += 1;
  return withAuthor(post);
}

// ---------- Comments ----------
const withCommentAuthor = (c: (typeof db.comments)[number]): CommentWithAuthor => ({
  ...c,
  author: summaryOf(c.authorId),
});

export function getComments(postId: ID, cursor: string | null, limit = 15): Paginated<CommentThread> {
  const all = db.comments.filter((c) => c.postId === postId);
  const roots = all.filter((c) => !c.parentId).sort(byNewest);
  const page = paginate(roots, cursor, limit);
  const items = page.items.map((root) => ({
    ...withCommentAuthor(root),
    replies: all
      .filter((c) => c.parentId === root.id)
      .sort((a, b) => -byNewest(a, b))
      .map(withCommentAuthor),
  }));
  return { items, nextCursor: page.nextCursor };
}

export function addComment(postId: ID, authorId: ID, text: string, parentId: ID | null): CommentWithAuthor {
  const comment = { id: newId("c"), postId, authorId, parentId, text, likes: 0, createdAt: new Date().toISOString() };
  db.comments.push(comment);
  const target = db.posts.find((p) => p.id === postId) ?? db.reels.find((r) => r.id === postId);
  if (target) target.commentsCount += 1;
  return withCommentAuthor(comment);
}

// ---------- Stories & Reels ----------
export function getStories(): StoryWithUser[] {
  return db.stories.map((s) => ({ ...s, user: summaryOf(s.userId) }));
}

export function getReels(cursor: string | null, limit = 4): Paginated<ReelWithAuthor> {
  const page = paginate(db.reels, cursor, limit);
  return { ...page, items: page.items.map((r) => ({ ...r, author: summaryOf(r.authorId) })) };
}

/** Reels share the like/comment endpoints with posts. */
export function contentExists(id: ID): boolean {
  return db.posts.some((p) => p.id === id) || db.reels.some((r) => r.id === id);
}

/** Cursor that makes the reels feed start at `reelId` (for /reels?r=…). */
export function reelCursorBefore(reelId: ID): string | null {
  const index = db.reels.findIndex((r) => r.id === reelId);
  return index > 0 ? db.reels[index - 1].id : null;
}

export function getUserReels(userId: ID): ReelWithAuthor[] {
  return db.reels.filter((r) => r.authorId === userId).map((r) => ({ ...r, author: summaryOf(r.authorId) }));
}

// ---------- Direct ----------
const otherParticipant = (ids: ID[], viewerId: ID) => summaryOf(ids.find((id) => id !== viewerId) ?? ids[0]);

export function getConversations(viewerId: ID): ConversationPreview[] {
  return db.conversations
    .filter((c) => c.participantIds.includes(viewerId))
    .map((c) => {
      const lastMessage = c.messages.at(-1) ?? null;
      return {
        id: c.id,
        participant: otherParticipant(c.participantIds, viewerId),
        lastMessage,
        unread: lastMessage !== null && lastMessage.senderId !== viewerId,
      };
    })
    .sort((a, b) => Date.parse(b.lastMessage?.createdAt ?? "0") - Date.parse(a.lastMessage?.createdAt ?? "0"));
}

export function getConversation(id: ID, viewerId: ID): ConversationDetail | null {
  const convo = db.conversations.find((c) => c.id === id && c.participantIds.includes(viewerId));
  if (!convo) return null;
  return { id: convo.id, participant: otherParticipant(convo.participantIds, viewerId), messages: convo.messages };
}

export function sendMessage(conversationId: ID, senderId: ID, text: string): Message | null {
  const convo = db.conversations.find((c) => c.id === conversationId);
  if (!convo) return null;
  const message = { id: newId("m"), conversationId, senderId, text, createdAt: new Date().toISOString() };
  convo.messages.push(message);
  return message;
}

// ---------- Notifications ----------
export function getNotifications(cursor: string | null, limit = 15): Paginated<NotificationWithActor> {
  const page = paginate([...db.notifications].sort(byNewest), cursor, limit);
  const items = page.items.map((n) => ({
    ...n,
    actor: summaryOf(n.actorId),
    postThumb: db.posts.find((p) => p.id === n.postId)?.media[0]?.url ?? null,
  }));
  return { items, nextCursor: page.nextCursor };
}
