import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading post" className="max-w-content mx-auto w-full md:px-5 md:pt-8">
      <div className="border-separator flex flex-col md:h-[min(80dvh,700px)] md:flex-row md:border">
        <Skeleton rounded="none" className="aspect-square w-full md:h-full md:w-auto" />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}
