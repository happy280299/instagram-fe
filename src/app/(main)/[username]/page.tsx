import { Camera } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProfilePosts } from "@/components/profile/ProfilePosts";
import { getUserByUsername, getUserPosts } from "@/lib/data";

export default async function ProfilePostsPage({ params }: { params: Promise<{ username: string }> }) {
  const user = getUserByUsername((await params).username);
  // The backend has no user-posts endpoint yet (see OwnProfile in the layout).
  if (!user) return <EmptyState icon={Camera} title="No posts yet" />;
  return <ProfilePosts username={user.username} userId={user.id} tab="posts" initial={getUserPosts(user.id, null, 12)} />;
}
