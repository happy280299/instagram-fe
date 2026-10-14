import { ProfilePosts } from "@/components/profile/ProfilePosts";
import { RemotePosts } from "@/components/profile/RemotePosts";
import { getUserByUsername, getUserPosts } from "@/lib/data";

export default async function ProfilePostsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = getUserByUsername(username);
  // Not a mock user: the layout renders the backend profile (RemoteProfile).
  if (!user) return <RemotePosts username={username} />;
  return <ProfilePosts username={user.username} tab="posts" initial={getUserPosts(user.id, null, 12)} />;
}
