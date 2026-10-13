import { notFound } from "next/navigation";
import { ReelsGrid } from "@/components/profile/ReelsGrid";
import { getUserByUsername, getUserReels } from "@/lib/data";

export default async function ProfileReelsPage({ params }: { params: Promise<{ username: string }> }) {
  const user = getUserByUsername((await params).username);
  if (!user) notFound();
  return <ReelsGrid reels={getUserReels(user.id)} />;
}
