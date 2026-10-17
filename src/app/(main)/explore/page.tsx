import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ExploreGrid } from "@/components/explore/ExploreGrid";
import { MobileSearchTrigger } from "@/components/explore/MobileSearchTrigger";
import { hashtagHref } from "@/lib/parse-caption";

export const metadata: Metadata = { title: "Explore" };

/** Old links used /explore?tag=…; hashtags have their own page now. */
export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const tag = (await searchParams).tag?.trim().replace(/^#/, "");
  if (tag) redirect(hashtagHref(tag));

  return (
    <div className="max-w-content mx-auto w-full pt-3 pb-8 md:px-5 md:pt-8">
      <h1 className="sr-only">Explore</h1>
      <MobileSearchTrigger />
      <ExploreGrid />
    </div>
  );
}
