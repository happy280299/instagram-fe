"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { conversationService } from "@/services/conversation.service";
import { useAuthStore } from "@/store/auth";

/** Conversations with unread messages, for the Messages badge; kept current by the socket. 0 for guests. */
export function useChatUnread() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isLoggedIn = useAuthStore((s) => s.accessToken !== null);
  const { data } = useQuery({ queryKey: queryKeys.chatUnread, queryFn: conversationService.unreadCount, enabled: hydrated && isLoggedIn });
  return isLoggedIn ? (data ?? 0) : 0;
}
