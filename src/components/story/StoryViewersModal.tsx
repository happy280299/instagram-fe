"use client";

import { Eye } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { UserListItem } from "@/components/user/UserListItem";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { timeAgoShort } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { storyService, type StoryViewer } from "@/services/story.service";
import { useAuthStore } from "@/store/auth";
import type { ID } from "@/types";

const PAGE_SIZE = 20;

/** Who saw one of your stories (GET /api/stories/:id/viewers), most recent first. */
export function StoryViewersModal({ storyId, count, onClose }: { storyId: ID; count: number; onClose: () => void }) {
  const fetchPage = useCallback(
    async (params: { cursor: string | null; limit: number }) => {
      const page = await storyService.viewers(storyId, params);
      useAuthStore.getState().syncFollowing(page.items.filter((v) => v.isFollowing).map((v) => v.id));
      return page;
    },
    [storyId],
  );
  const { items, loading, error, done, sentinelRef, loadMore } = usePaginatedQuery<StoryViewer>(queryKeys.storyViewers(storyId), fetchPage, {
    limit: PAGE_SIZE,
  });

  return (
    <Modal open onClose={onClose} title={`Seen by ${count}`} className="h-[min(70dvh,560px)] md:max-w-md!">
      <div className="flex-1 overflow-y-auto px-4" aria-busy={loading}>
        {items.length === 0 && done ? (
          <EmptyState icon={Eye} title="No viewers yet" description="When people see your story, they'll appear here." />
        ) : (
          <ul aria-label="Story viewers">
            {items.map((viewer) => (
              <UserListItem key={viewer.id} user={viewer} subtitle={`${viewer.fullName} · ${timeAgoShort(viewer.viewedAt)}`} />
            ))}
          </ul>
        )}
        {loading && (
          <div role="status" aria-label="Loading viewers">
            {Array.from({ length: items.length === 0 ? 5 : 2 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 py-2" aria-hidden>
                <Skeleton rounded="full" className="size-avatar-md" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
            ))}
          </div>
        )}
        {error && (
          <div role="alert" className="flex flex-col items-center gap-2 py-6 text-center">
            <p className="text-muted text-sm">{error}</p>
            <Button size="sm" variant="secondary" onClick={loadMore}>
              Try again
            </Button>
          </div>
        )}
        <div ref={sentinelRef} aria-hidden className="h-px" />
      </div>
    </Modal>
  );
}
