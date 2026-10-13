import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading reels" className="flex h-[calc(100dvh-var(--spacing-topbar)-var(--spacing-bottomnav))] items-center justify-center md:h-dvh md:py-4">
      <Skeleton rounded="none" className="h-full w-full md:aspect-[9/16] md:w-auto md:rounded-lg" />
    </div>
  );
}
