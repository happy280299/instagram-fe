import type { Metadata } from "next";
import { ReelsFeed } from "@/components/reels/ReelsFeed";

export const metadata: Metadata = { title: "Reels" };

/** ?r=<post id> opens the tab on that reel (from a profile grid or a shared link). */
export default async function ReelsPage({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  const { r } = await searchParams;
  return (
    <>
      <h1 className="sr-only">Reels</h1>
      <ReelsFeed key={r ?? "all"} startId={r ?? null} />
    </>
  );
}
