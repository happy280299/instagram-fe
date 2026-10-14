import { notFound } from "next/navigation";
import { ProfilePosts } from "@/components/profile/ProfilePosts";
import { getTaggedPosts, getUserByUsername } from "@/lib/data";

export default async function TaggedPage({ params }: { params: Promise<{ username: string }> }) {
  const user = getUserByUsername((await params).username);
  if (!user) notFound();
  return <ProfilePosts username={user.username} tab="tagged" initial={getTaggedPosts(user.id, null, 12)} />;
}
