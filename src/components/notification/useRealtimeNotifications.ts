"use client";

import { type InfiniteData, type QueryClient, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryKeys } from "@/lib/query-keys";
import { connectRealtime, disconnectRealtime, onRealtime, REALTIME_EVENTS } from "@/lib/realtime";
import { notificationService } from "@/services/notification.service";
import { useAuthStore } from "@/store/auth";
import type { Activity, Paginated } from "@/types";

type ActivityPages = InfiniteData<Paginated<Activity>, string | null>;

const sameDay = (a: string, b: string) => new Date(a).toDateString() === new Date(b).toDateString();

/**
 * Puts a pushed activity at the top of the cached list. A grouped LIKE comes back with a new id
 * as more people like the post, so it replaces that post's earlier LIKE row from the same day.
 */
function prependActivity(client: QueryClient, activity: Activity) {
  const isReplaced = (n: Activity) =>
    n.id === activity.id ||
    (activity.type === "like" && n.type === "like" && n.post?.id === activity.post?.id && sameDay(n.createdAt, activity.createdAt));
  client.setQueryData<ActivityPages>(queryKeys.notifications, (old) => {
    if (!old || old.pages.length === 0) return old;
    const pages = old.pages.map((page) => ({ ...page, items: page.items.filter((n) => !isReplaced(n)) }));
    pages[0] = { ...pages[0], items: [activity, ...pages[0].items] };
    return { ...old, pages };
  });
}

/**
 * Keeps the realtime socket in step with the session and feeds pushed notifications into the
 * cache: the heart's unread count and, when it's loaded, the activity list. Mount once.
 */
export function useRealtimeNotifications() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!hydrated) return;
    if (!token) return disconnectRealtime();
    connectRealtime(token);
    const unsubscribe = [
      // Also after a reconnect: catch up on what happened while offline.
      onRealtime("connect", () => void queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotifications })),
      onRealtime(REALTIME_EVENTS.notificationUnreadCount, (payload) => {
        const count = notificationService.countFromEvent(payload);
        if (count !== null) queryClient.setQueryData(queryKeys.unreadNotifications, count);
      }),
      onRealtime(REALTIME_EVENTS.notificationNew, (payload) => {
        const activity = notificationService.fromEvent(payload);
        if (activity) prependActivity(queryClient, activity);
      }),
      // The token was rejected: let /auth/me decide; its 401 logs out through the usual handler.
      onRealtime("connect_error", (err) => {
        if (err instanceof Error && err.message === "Unauthorized") void useAuthStore.getState().refreshMe();
      }),
    ];
    return () => unsubscribe.forEach((off) => off());
  }, [hydrated, token, queryClient]);
}
