import type { AxiosResponse } from "axios";
import { client, http } from "@/lib/api";
import type { ChatConversation, ChatMessage, ID, ISODate, Paginated, Presence } from "@/types";

/** Message as REST and the `message:new` event return it. */
interface BackendMessage {
  id: number;
  conversationId: number;
  sender: { id: number; username: string; avatarUrl: string };
  content: string | null;
  media: { url: string; type: "IMAGE" | "VIDEO"; width: number | null; height: number | null; thumbnailUrl: string | null } | null;
  createdAt: ISODate;
}

interface BackendConversation {
  id: number;
  /** The other people in it; exactly one for a 1-1 chat. */
  members: {
    id: number;
    username: string;
    name: string;
    avatarUrl: string;
    isVerified: boolean;
    /** null when hidden: either side turned activity status off. */
    isOnline: boolean | null;
    lastActiveAt: ISODate | null;
  }[];
  readStates: { userId: number; lastReadMessageId: number | null }[];
  lastMessage: BackendMessage | null;
  lastMessageAt: ISODate | null;
  unreadCount: number;
}

const avatarOf = (url: string, username: string) => url || `https://i.pravatar.cc/150?u=${username}`;

function toMessage(m: BackendMessage): ChatMessage {
  return {
    id: String(m.id),
    conversationId: String(m.conversationId),
    sender: { id: String(m.sender.id), username: m.sender.username, avatar: avatarOf(m.sender.avatarUrl, m.sender.username) },
    // A media-only message comes back with content "", not null.
    text: m.content || null,
    media: m.media && {
      url: m.media.url,
      type: m.media.type === "VIDEO" ? "video" : "image",
      width: m.media.width,
      height: m.media.height,
      poster: m.media.thumbnailUrl ?? undefined,
    },
    createdAt: m.createdAt,
  };
}

function toConversation(c: BackendConversation): ChatConversation {
  const peer = c.members[0];
  const read = c.readStates[0]?.lastReadMessageId;
  return {
    id: String(c.id),
    participant: peer
      ? { id: String(peer.id), username: peer.username, fullName: peer.name, avatar: avatarOf(peer.avatarUrl, peer.username), isVerified: peer.isVerified }
      : { id: "", username: "", fullName: "Instaclone user", avatar: avatarOf("", "deleted"), isVerified: false },
    lastMessage: c.lastMessage && toMessage(c.lastMessage),
    lastMessageAt: c.lastMessageAt,
    unreadCount: c.unreadCount,
    peerLastReadId: read == null ? null : String(read),
    peerPresence: { isOnline: peer?.isOnline ?? null, lastActiveAt: peer?.lastActiveAt ?? null },
  };
}

function toPage<B, T>(map: (b: B) => T) {
  return ({ data, meta }: AxiosResponse<B[]>): Paginated<T> => {
    const { nextCursor } = (meta ?? {}) as { nextCursor?: number | null };
    return { items: data.map(map), nextCursor: nextCursor == null ? null : String(nextCursor) };
  };
}

/** Whether a message id is at or before `lastReadId` (ids grow over time). */
export const isReadUpTo = (messageId: ID, lastReadId: ID | null) => lastReadId !== null && Number(messageId) <= Number(lastReadId);

// Socket payloads aren't typed by axios generics; check what the mappers rely on.
const isObject = (raw: unknown): raw is Record<string, unknown> => typeof raw === "object" && raw !== null;
const isBackendMessage = (raw: unknown): raw is BackendMessage =>
  isObject(raw) && typeof raw.id === "number" && typeof raw.conversationId === "number" && isObject(raw.sender) && typeof raw.createdAt === "string";
const idOf = (v: unknown) => (typeof v === "number" ? String(v) : null);

export const conversationService = {
  /** Opens (or creates) the 1-1 conversation with `username`, for the profile's Message button. */
  open: (username: string) => http.post<BackendConversation>("/api/conversations", { username }).then(toConversation),
  /** Inbox: conversations with at least one message, most recent first. */
  list: (params: { cursor?: string | null; limit?: number }) =>
    client.get<BackendConversation[]>("/api/conversations", { params }).then(toPage(toConversation)),
  /** Conversations with unread messages, for the badge on the Messages icon. */
  unreadCount: () => http.get<{ count: number }>("/api/conversations/unread-count").then((r) => r.count),
  get: (id: ID) => http.get<BackendConversation>(`/api/conversations/${id}`).then(toConversation),
  /** Newest first; the cursor loads older ones. */
  messages: (id: ID, params: { cursor?: string | null; limit?: number }) =>
    client.get<BackendMessage[]>(`/api/conversations/${id}/messages`, { params }).then(toPage(toMessage)),
  /** `mediaUrl` must come from POST /api/uploads. */
  send: (id: ID, body: { content?: string; mediaUrl?: string }) => http.post<BackendMessage>(`/api/conversations/${id}/messages`, body).then(toMessage),
  markRead: (id: ID) => http.post(`/api/conversations/${id}/read`),
  /** Unsends one of the viewer's messages. */
  remove: (messageId: ID) => http.delete(`/api/messages/${messageId}`),

  // Socket payloads
  messageFromEvent: (raw: unknown): ChatMessage | null => (isBackendMessage(raw) ? toMessage(raw) : null),
  deletedFromEvent: (raw: unknown) => {
    const conversationId = isObject(raw) ? idOf(raw.conversationId) : null;
    const messageId = isObject(raw) ? idOf(raw.messageId) : null;
    return conversationId && messageId ? { conversationId, messageId } : null;
  },
  readFromEvent: (raw: unknown) => {
    if (!isObject(raw)) return null;
    const conversationId = idOf(raw.conversationId);
    const userId = idOf(raw.userId);
    if (!conversationId || !userId) return null;
    return { conversationId, userId, lastReadMessageId: idOf(raw.lastReadMessageId) };
  },
  typingFromEvent: (raw: unknown) => {
    if (!isObject(raw) || typeof raw.isTyping !== "boolean") return null;
    const conversationId = idOf(raw.conversationId);
    const userId = idOf(raw.userId);
    return conversationId && userId ? { conversationId, userId, isTyping: raw.isTyping } : null;
  },
  countFromEvent: (raw: unknown) => (isObject(raw) && typeof raw.count === "number" ? raw.count : null),
  /** `presence:update`: someone you chat with came online, left, or hid their status. */
  presenceFromEvent: (raw: unknown): { userId: ID; presence: Presence } | null => {
    if (!isObject(raw)) return null;
    const userId = idOf(raw.userId);
    const isOnline = typeof raw.isOnline === "boolean" ? raw.isOnline : null;
    const lastActiveAt = typeof raw.lastActiveAt === "string" ? raw.lastActiveAt : null;
    return userId ? { userId, presence: { isOnline, lastActiveAt } } : null;
  },
};
