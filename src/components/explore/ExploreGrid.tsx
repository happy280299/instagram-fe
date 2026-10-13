"use client";

import { Compass } from "lucide-react";
import { GridItem } from "@/components/post/GridItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useInfiniteList } from "@/hooks/useInfiniteList";
import { cn } from "@/lib/cn";
import type { Paginated, PostWithAuthor } from "@/types";

const GROUP = 5;

/** Instagram explore pattern: every 5 tiles = 1 tall tile + 4 squares, tall side alternating. */
export function ExploreGrid({ initial, tag }: { initial: Paginated<PostWithAuthor>; tag: string | null }) {
  const { items, loading, sentinelRef } = useInfiniteList<PostWithAuthor>("/api/explore", { initial, params: { tag } });

  if (items.length === 0 && !loading) {
    return <EmptyState icon={Compass} title="Nothing to explore" description={tag ? `No posts tagged #${tag} yet.` : "Check back later."} />;
  }

  const groups: PostWithAuthor[][] = [];
  for (let i = 0; i < items.length; i += GROUP) groups.push(items.slice(i, i + GROUP));

  return (
    <div className="flex flex-col gap-0.5 md:gap-1" aria-busy={loading}>
      {groups.map((group, g) => (
        <ul key={group[0].id} className="grid grid-cols-3 grid-rows-2 gap-0.5 md:gap-1">
          {group.map((post, i) => {
            const tall = i === 0 && group.length === GROUP;
            return (
              <li key={post.id} className={cn(tall && "row-span-2", tall && g % 2 === 1 && "col-start-3 row-start-1")}>
                <GridItem
                  href={`/p/${post.id}`}
                  image={post.media[0].url}
                  alt={post.media[0].alt}
                  likes={post.likes}
                  comments={post.commentsCount}
                  multiple={post.media.length > 1}
                  shape={tall ? "fill" : "square"}
                  sizes={tall ? "(max-width: 767px) 66vw, 620px" : "(max-width: 767px) 33vw, 310px"}
                  priority={g === 0}
                />
              </li>
            );
          })}
        </ul>
      ))}
      {loading && <ExploreSkeleton />}
      <div ref={sentinelRef} aria-hidden className="h-px" />
    </div>
  );
}

export function ExploreSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="grid grid-cols-3 grid-rows-2 gap-0.5 md:gap-1">
      <Skeleton rounded="none" className="row-span-2 h-full w-full" />
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} rounded="none" className="aspect-square w-full" />
      ))}
    </div>
  );
}
