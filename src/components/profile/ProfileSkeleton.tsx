import { Skeleton } from "@/components/ui/Skeleton";
import { GridSkeleton } from "@/components/post/PostGrid";

export function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Loading profile" className="max-w-content mx-auto w-full md:px-5">
      <div className="flex items-center gap-6 px-4 pt-4 md:gap-8 lg:gap-24 md:px-0 md:pt-8">
        <div className="flex md:w-[min(290px,30%)] md:justify-center">
          <Skeleton rounded="full" className="size-avatar-profile md:size-avatar-xl" />
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64 max-w-full" />
          <Skeleton className="h-3 w-48 max-w-full" />
        </div>
      </div>
      <div className="mt-12">
        <GridSkeleton />
      </div>
    </div>
  );
}
