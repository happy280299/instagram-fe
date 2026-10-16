"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { notificationService } from "@/services/notification.service";
import { useAuthStore } from "@/store/auth";

/** Unread activity count for the dot on the heart icon; kept current by the realtime socket. 0 for guests. */
export function useUnreadNotifications() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isLoggedIn = useAuthStore((s) => s.accessToken !== null);
  const { data } = useQuery({
    queryKey: queryKeys.unreadNotifications,
    queryFn: notificationService.unreadCount,
    enabled: hydrated && isLoggedIn,
  });
  return isLoggedIn ? (data ?? 0) : 0;
}
