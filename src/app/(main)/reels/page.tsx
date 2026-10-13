import type { Metadata } from "next";
import { ReelsFeed } from "@/components/reels/ReelsFeed";
import { getReels, reelCursorBefore } from "@/lib/data";

export const metadata: Metadata = { title: "Reels" };

export default async function ReelsPage({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  const { r } = await searchParams;
  const initial = getReels(r ? reelCursorBefore(r) : null, 4);
  return (
    <>
      <h1 className="sr-only">Reels</h1>
      <ReelsFeed key={r ?? "all"} initial={initial} />
    </>
  );
}
