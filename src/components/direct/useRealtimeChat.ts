"use client";

import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryKeys } from "@/lib/query-keys";
import { connectRealtime, onRealtime, REALTIME_EVENTS } from "@/lib/realtime";
import { conversationService } from "@/services/conversation.service";
import { useAuthStore } from "@/store/auth";
import { useDirectStore } from "@/store/direct";
import type { ID } from "@/types";
import { addMessage, bumpConversation, removeMessage, updateConversation, updatePeerPresence } from "./chat-cache";

/** Tells the server the viewer has read a conversation (so the peer sees "Seen") and clears its unread count. */
export function markConversationRead(client: QueryClient, id: ID) {
  updateConversation(client, id, { unreadCount: 0 });
  // The badge total comes back over the socket (chat:unread-count); failures just leave it unread.
  conversationService.markRead(id).catch(() => undefined);
}

/**
 * Feeds chat socket events into the cache: new and unsent messages, "Seen", typing, the other
 * person's activity status and the Messages badge. Mount once (AppProviders).
 */
export function useRealtimeChat() {
  const token = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;
    // Same socket as notifications; a no-op when it's already connected with this token.
    connectRealtime(token);
    const myId = () => useAuthStore.getState().user?.id;
    const unsubscribe = [
      onRealtime("connect", () => void queryClient.invalidateQueries({ queryKey: queryKeys.chatUnread })),
      onRealtime(REALTIME_EVENTS.messageNew, (payload) => {
        const message = conversationService.messageFromEvent(payload);
        if (!message) return;
        const mine = message.sender.id === myId();
        const isOpen = useDirectStore.getState().openConversationId === message.conversationId;
        addMessage(queryClient, message, { replacePending: mine });
        bumpConversation(queryClient, message, mine || isOpen ? 0 : 1);
        if (!mine) useDirectStore.getState().setTyping(message.conversationId, false);
        if (!mine && isOpen) markConversationRead(queryClient, message.conversationId);
      }),
      onRealtime(REALTIME_EVENTS.messageDeleted, (payload) => {
        const deleted = conversationService.deletedFromEvent(payload);
        if (!deleted) return;
        removeMessage(queryClient, deleted.conversationId, deleted.messageId);
        // The inbox preview may fall back to the previous message.
        void queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      }),
      onRealtime(REALTIME_EVENTS.conversationRead, (payload) => {
        const read = conversationService.readFromEvent(payload);
        if (read && read.userId !== myId()) updateConversation(queryClient, read.conversationId, { peerLastReadId: read.lastReadMessageId });
      }),
      onRealtime(REALTIME_EVENTS.conversationTyping, (payload) => {
        const typing = conversationService.typingFromEvent(payload);
        if (typing && typing.userId !== myId()) useDirectStore.getState().setTyping(typing.conversationId, typing.isTyping);
      }),
      onRealtime(REALTIME_EVENTS.presenceUpdate, (payload) => {
        const update = conversationService.presenceFromEvent(payload);
        if (update) updatePeerPresence(queryClient, update.userId, update.presence);
      }),
      onRealtime(REALTIME_EVENTS.chatUnreadCount, (payload) => {
        const count = conversationService.countFromEvent(payload);
        if (count !== null) queryClient.setQueryData(queryKeys.chatUnread, count);
      }),
    ];
    return () => unsubscribe.forEach((off) => off());
  }, [token, queryClient]);
}
