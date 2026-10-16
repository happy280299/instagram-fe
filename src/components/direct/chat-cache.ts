import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { ChatConversation, ChatMessage, ID, Paginated } from "@/types";

type Pages<T> = InfiniteData<Paginated<T>, string | null>;

const mapItems = <T>(old: Pages<T> | undefined, fn: (items: T[], pageIndex: number) => T[]) =>
  old && { ...old, pages: old.pages.map((page, i) => ({ ...page, items: fn(page.items, i) })) };

/** An optimistic copy the server's message stands for: same text, both with or both without media. */
const isPendingCopy = (m: ChatMessage, of: ChatMessage) => m.status === "sending" && m.text === of.text && Boolean(m.media) === Boolean(of.media);

/**
 * Puts a message at the newest end of its conversation. `replaceId` drops that optimistic copy; with
 * `replacePending`, the oldest still-sending copy matching it goes instead (our own message can
 * arrive over the socket before the REST reply that knows the temp id).
 */
export function addMessage(client: QueryClient, message: ChatMessage, { replaceId, replacePending = false }: { replaceId?: ID; replacePending?: boolean } = {}) {
  client.setQueryData<Pages<ChatMessage>>(queryKeys.messages(message.conversationId), (old) => {
    if (!old) return old;
    let dropId = replaceId;
    if (replacePending && !dropId) dropId = old.pages.flatMap((p) => p.items).findLast((m) => isPendingCopy(m, message))?.id;
    return mapItems(old, (items, i) => {
      // Already there: the socket and the REST reply both deliver our own messages.
      const rest = items.filter((m) => m.id !== message.id && m.id !== dropId);
      return i === 0 ? [message, ...rest] : rest;
    });
  });
}

export function updateMessage(client: QueryClient, conversationId: ID, messageId: ID, patch: Partial<ChatMessage>) {
  client.setQueryData<Pages<ChatMessage>>(queryKeys.messages(conversationId), (old) =>
    mapItems(old, (items) => items.map((m) => (m.id === messageId ? { ...m, ...patch } : m))),
  );
}

/** Removes a message; returns the previous pages for rollback. */
export function removeMessage(client: QueryClient, conversationId: ID, messageId: ID) {
  const key = queryKeys.messages(conversationId);
  const previous = client.getQueryData<Pages<ChatMessage>>(key);
  client.setQueryData<Pages<ChatMessage>>(key, (old) => mapItems(old, (items) => items.filter((m) => m.id !== messageId)));
  return previous;
}

/**
 * Moves a conversation to the top of the inbox with its new last message. A conversation the
 * inbox doesn't have yet (its first message) needs a refetch to get the participant.
 */
export function bumpConversation(client: QueryClient, message: ChatMessage, unreadDelta: number) {
  const inbox = client.getQueryData<Pages<ChatConversation>>(queryKeys.conversations);
  const current = inbox?.pages.flatMap((p) => p.items).find((c) => c.id === message.conversationId);
  if (!current) return void client.invalidateQueries({ queryKey: queryKeys.conversations });
  const bumped = { ...current, lastMessage: message, lastMessageAt: message.createdAt, unreadCount: current.unreadCount + unreadDelta };
  client.setQueryData<Pages<ChatConversation>>(queryKeys.conversations, (old) =>
    mapItems(old, (items, i) => {
      const rest = items.filter((c) => c.id !== bumped.id);
      return i === 0 ? [bumped, ...rest] : rest;
    }),
  );
  client.setQueryData<ChatConversation>(queryKeys.conversation(bumped.id), (old) => old && { ...old, lastMessage: message, lastMessageAt: message.createdAt });
}

/** Applies a change to one conversation in the inbox and its own cache entry. */
export function updateConversation(client: QueryClient, id: ID, patch: Partial<ChatConversation>) {
  client.setQueryData<Pages<ChatConversation>>(queryKeys.conversations, (old) =>
    mapItems(old, (items) => items.map((c) => (c.id === id ? { ...c, ...patch } : c))),
  );
  client.setQueryData<ChatConversation>(queryKeys.conversation(id), (old) => old && { ...old, ...patch });
}

/** Applies someone's new presence to every cached conversation with them (inbox rows and open chats). */
export function updatePeerPresence(client: QueryClient, userId: ID, presence: ChatConversation["peerPresence"]) {
  client.setQueryData<Pages<ChatConversation>>(queryKeys.conversations, (old) =>
    mapItems(old, (items) => items.map((c) => (c.participant.id === userId ? { ...c, peerPresence: presence } : c))),
  );
  client.setQueriesData<ChatConversation>({ queryKey: queryKeys.allConversations }, (old) =>
    old && old.participant.id === userId ? { ...old, peerPresence: presence } : old,
  );
}
