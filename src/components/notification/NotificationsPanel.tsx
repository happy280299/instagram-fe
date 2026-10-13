"use client";

import { Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { Skeleton } from "@/components/ui/Skeleton";
import { useInfiniteList } from "@/hooks/useInfiniteList";
import { useUIStore } from "@/store/ui";
import type { NotificationWithActor } from "@/types";
import { NotificationItem } from "./NotificationItem";

const DAY = 86_400_000;

function groupOf(n: NotificationWithActor, now: number) {
  if (!n.read) return "New";
  const age = now - Date.parse(n.createdAt);
  if (age < DAY) return "Today";
  if (age < 7 * DAY) return "This week";
  if (age < 30 * DAY) return "This month";
  return "Earlier";
}

export function NotificationsPanel() {
  const close = useUIStore((s) => s.closePanel);
  const { items, loading, done, sentinelRef } = useInfiniteList<NotificationWithActor>("/api/notifications");
  const now = Date.now();

  const groups = new Map<string, NotificationWithActor[]>();
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
                <NotificationItem key={n.id} notification={n} />
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
        {done && items.length === 0 && <EmptyState icon={Heart} title="Activity on your posts" description="When someone likes or comments on one of your posts, you'll see it here." />}
        <div ref={sentinelRef} aria-hidden className="h-px" />
      </div>
    </SlidePanel>
  );
}
