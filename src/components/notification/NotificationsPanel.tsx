"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { queryKeys } from "@/lib/query-keys";
import { notificationService } from "@/services/notification.service";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import type { Activity } from "@/types";
import { NotificationItem } from "./NotificationItem";

const PAGE_SIZE = 20;
const DAY = 86_400_000;

function groupOf(activity: Activity, now: number) {
  const age = now - Date.parse(activity.createdAt);
  if (age < DAY) return "Today";
  if (age < 7 * DAY) return "This week";
  if (age < 30 * DAY) return "This month";
  return "Earlier";
}

/** Marks everything read once the list has loaded, keeping this view's "new" dots, and clears the heart's dot. */
function useMarkReadOnOpen(loaded: boolean) {
  const queryClient = useQueryClient();
  const done = useRef(false);
  useEffect(() => {
    if (!loaded || done.current) return;
    done.current = true;
    notificationService.markAllRead().then(
      () => {
        queryClient.setQueryData(queryKeys.unreadNotifications, 0);
      },
      // Not something the user asked for; the dot stays and it's retried next time.
      () => undefined,
    );
  }, [loaded, queryClient]);
}

export function NotificationsPanel() {
  const close = useUIStore((s) => s.closePanel);
  const hydrated = useAuthStore((s) => s.hydrated);
  const isLoggedIn = useAuthStore((s) => s.accessToken !== null);
  // staleTime 0: every open shows what happened since; mark read only once that fresh list is in.
  const { items, loading, fetching, initialLoading, error, done, sentinelRef, loadMore } = usePaginatedQuery<Activity>(
    queryKeys.notifications,
    notificationService.list,
    { limit: PAGE_SIZE, enabled: hydrated && isLoggedIn, staleTime: 0 },
  );
  useMarkReadOnOpen(!initialLoading && !fetching && !error);

  const now = Date.now();
  const groups = new Map<string, Activity[]>();
  for (const n of items) {
    const key = groupOf(n, now);
    groups.set(key, [...(groups.get(key) ?? []), n]);
  }

  return (
    <SlidePanel title="Notifications" onClose={close}>
      <div className="flex-1 overflow-y-auto pb-4" aria-busy={loading}>
        {[...groups].map(([title, list]) => (
          <section key={title} className="border-separator border-b py-2 last:border-b-0">
            <h3 className="px-6 py-2 font-bold">{title}</h3>
            <ul>
              {list.map((n) => (
                <NotificationItem key={n.id} activity={n} />
              ))}
            </ul>
          </section>
        ))}
        {loading && (
          <div role="status" aria-label="Loading notifications">
            {Array.from({ length: items.length === 0 ? 8 : 2 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-2" aria-hidden>
                <Skeleton rounded="full" className="size-avatar-md" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="size-11" />
              </div>
            ))}
          </div>
        )}
        {error && (
          <div role="alert" className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-muted text-sm">Couldn&apos;t load {items.length === 0 ? "your activity" : "more activity"}.</p>
            <Button size="sm" variant="secondary" onClick={loadMore}>
              Try again
            </Button>
          </div>
        )}
        {done && items.length === 0 && (
          <EmptyState icon={Heart} title="Activity on your posts" description="When someone likes or comments on one of your posts, you'll see it here." />
        )}
        <div ref={sentinelRef} aria-hidden className="h-px" />
      </div>
    </SlidePanel>
  );
}
