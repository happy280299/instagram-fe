import { notFound } from "next/navigation";
import { SavedPosts } from "@/components/profile/SavedPosts";
import { getUserByUsername } from "@/lib/data";

export default async function SavedPage({ params }: { params: Promise<{ username: string }> }) {
  const user = getUserByUsername((await params).username);
  if (!user) notFound();
  return <SavedPosts userId={user.id} />;
}
