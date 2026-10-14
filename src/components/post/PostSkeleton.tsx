import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";

export function PostSkeleton() {
  return (
    <div className="mb-4 pb-4" aria-hidden>
      <div className="flex items-center gap-3 px-3 py-3 md:px-0">
        <Skeleton rounded="full" className="size-avatar-sm" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
      <Skeleton rounded="none" className="aspect-square w-full md:rounded-sm" />
      <div className="flex flex-col gap-2 px-3 pt-3 md:px-0">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading posts">
      {Array.from({ length: count }, (_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

/** Two-pane placeholder for the post detail page and modal. */
export function PostDetailSkeleton({ className }: { className?: string }) {
  return (
    <div role="status" aria-label="Loading post" className={cn("flex flex-col md:flex-row", className)}>
      <Skeleton rounded="none" className="aspect-square w-full md:h-full md:w-auto" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
