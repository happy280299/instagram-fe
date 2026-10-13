import type { Metadata } from "next";
import Link from "next/link";
import { ExploreGrid } from "@/components/explore/ExploreGrid";
import { MobileSearchTrigger } from "@/components/explore/MobileSearchTrigger";
import { getExplore } from "@/lib/data";

type Props = { searchParams: Promise<{ tag?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { tag } = await searchParams;
  return { title: tag ? `#${tag}` : "Explore" };
}

export default async function ExplorePage({ searchParams }: Props) {
  const tag = (await searchParams).tag?.trim().replace(/^#/, "") || null;
  const initial = getExplore(null, 15, tag);

  return (
    <div className="max-w-content mx-auto w-full pt-3 pb-8 md:px-5 md:pt-8">
      <h1 className="sr-only">Explore</h1>
      <MobileSearchTrigger />
      {tag && (
        <div className="flex items-center justify-between px-4 pb-6 md:px-0">
          <div>
            <p className="text-2xl font-semibold">#{tag}</p>
            <p className="text-muted text-sm">{initial.items.length}{initial.nextCursor ? "+" : ""} posts</p>
          </div>
          <Link href="/explore" className="text-primary text-sm font-semibold">
            Clear
          </Link>
        </div>
      )}
      <ExploreGrid key={tag ?? "all"} initial={initial} tag={tag} />
    </div>
  );
}
