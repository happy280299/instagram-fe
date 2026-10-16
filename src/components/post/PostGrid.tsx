import { Skeleton } from "@/components/ui/Skeleton";
import type { Media, PostWithAuthor } from "@/types";
import { GridItem } from "./GridItem";

/** A video tile shows its cover image; without one the tile falls back to SafeImage's placeholder. */
const cover = (media: Media) => (media.type === "video" ? (media.poster ?? "") : media.url);

export function PostGrid({ posts }: { posts: PostWithAuthor[] }) {
  return (
    <ul className="grid grid-cols-3 gap-0.5 md:gap-1">
      {posts.map((post, i) => (
        <li key={post.id}>
          <GridItem
            href={`/p/${post.id}`}
            image={cover(post.media[0])}
            alt={post.media[0].alt}
            video={post.media[0].type === "video"}
            views={post.isReel ? post.viewCount : undefined}
            likes={post.likes}
            comments={post.commentsCount}
            multiple={post.media.length > 1}
            priority={i < 3}
          />
        </li>
      ))}
    </ul>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading" className="grid grid-cols-3 gap-0.5 md:gap-1">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} rounded="none" className="aspect-square w-full" />
      ))}
    </div>
  );
}
