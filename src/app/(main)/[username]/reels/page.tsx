import { ReelsGrid } from "@/components/profile/ReelsGrid";
import { RemoteReels } from "@/components/profile/RemoteReels";
import { getUserByUsername, getUserReels } from "@/lib/data";

export default async function ProfileReelsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = getUserByUsername(username);
  // Not a mock user: the layout renders the backend profile (RemoteProfile).
  if (!user) return <RemoteReels username={username} />;
  return <ReelsGrid reels={getUserReels(user.id)} />;
}
