"use client";

import { Clapperboard } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useInfiniteList } from "@/hooks/useInfiniteList";
import type { Paginated, ReelWithAuthor } from "@/types";
import { ReelItem } from "./ReelItem";

/** Vertical, scroll-snapping reels feed. Loads more when the second-to-last reel is reached. */
export function ReelsFeed({ initial }: { initial: Paginated<ReelWithAuthor> }) {
  const { items, loading, sentinelRef } = useInfiniteList<ReelWithAuthor>("/api/reels", { initial, limit: 4 });

  if (items.length === 0 && !loading) {
    return <EmptyState icon={Clapperboard} title="No reels yet" description="Reels will show up here." />;
  }

  return (
    <ul
      aria-label="Reels"
      className="scrollbar-none h-[calc(100dvh-var(--spacing-topbar)-var(--spacing-bottomnav))] snap-y snap-mandatory overflow-y-scroll md:h-dvh"
    >
      {items.map((reel, i) => (
        <li key={reel.id} className="relative h-full snap-start snap-always">
          {i === Math.max(items.length - 2, 0) && <div ref={sentinelRef} aria-hidden className="absolute top-0 h-px w-px" />}
          <ReelItem reel={reel} priority={i === 0} />
        </li>
      ))}
      {loading && (
        <li className="flex h-24 items-center justify-center">
          <Spinner />
        </li>
      )}
    </ul>
  );
}
