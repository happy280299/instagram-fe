import { RemoteSaved } from "@/components/profile/RemoteSaved";
import { SavedPosts } from "@/components/profile/SavedPosts";
import { getUserByUsername } from "@/lib/data";

export default async function SavedPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = getUserByUsername(username);
  // Not a mock user: the layout renders the backend profile (RemoteProfile).
  if (!user) return <RemoteSaved username={username} />;
  return <SavedPosts userId={user.id} />;
}
