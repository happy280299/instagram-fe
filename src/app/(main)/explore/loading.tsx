import { ExploreSkeleton } from "@/components/explore/ExploreGrid";

export default function Loading() {
  return (
    <div className="max-w-content mx-auto flex w-full flex-col gap-1 pt-3 md:px-5 md:pt-8">
      <ExploreSkeleton />
      <ExploreSkeleton />
    </div>
  );
}
