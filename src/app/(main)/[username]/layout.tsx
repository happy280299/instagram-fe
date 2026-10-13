import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Highlights } from "@/components/profile/Highlights";
import { OwnProfile } from "@/components/profile/OwnProfile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { getUserByUsername } from "@/lib/data";

type Params = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params;
  const user = getUserByUsername(username);
  // Possibly the logged-in backend user, whom the server can't look up.
  if (!user) return { title: `@${decodeURIComponent(username)}` };
  const title = `${user.fullName} (@${user.username})`;
  const description = `${user.followers.toLocaleString("en-US")} followers, ${user.following.toLocaleString("en-US")} following, ${user.postsCount} posts — ${user.bio}`;
  return {
    title,
    description,
    alternates: { canonical: `/${user.username}` },
    openGraph: { title, description, type: "profile", images: [{ url: user.avatar, width: 300, height: 300 }] },
    twitter: { card: "summary", title, description, images: [user.avatar] },
  };
}

export default async function ProfileLayout({ params, children }: Params & { children: ReactNode }) {
  const { username } = await params;
  const user = getUserByUsername(username);
  // Backend users aren't in the mock data; the logged-in one is rendered from the session.
  if (!user) return <OwnProfile username={username}>{children}</OwnProfile>;

  return (
    <div className="max-w-content mx-auto w-full pb-8 md:px-5">
      <ProfileHeader user={user} />
      <Highlights user={user} />
      <ProfileTabs username={user.username} userId={user.id} />
      {children}
    </div>
  );
}
