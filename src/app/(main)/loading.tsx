import { FeedSkeleton } from "@/components/post/PostSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex justify-center md:px-4 md:pt-6">
      <div className="max-w-feed w-full">
        <div className="mb-6 flex gap-3 overflow-hidden px-3 py-3 md:px-0" aria-hidden>
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} rounded="full" className="size-avatar-lg shrink-0" />
          ))}
        </div>
        <FeedSkeleton count={2} />
      </div>
      <div className="hidden w-[383px] lg:block" />
    </div>
  );
}
