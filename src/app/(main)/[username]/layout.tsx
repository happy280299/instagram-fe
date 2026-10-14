import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Highlights } from "@/components/profile/Highlights";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { RemoteProfile } from "@/components/profile/RemoteProfile";
import { getUserByUsername } from "@/lib/data";

type Params = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params;
  const user = getUserByUsername(username);
  // Backend profiles load on the client, so the server only knows the username.
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
  // Not mock data: a backend user, loaded on the client.
  if (!user) return <RemoteProfile username={username}>{children}</RemoteProfile>;

  return (
    <div className="max-w-content mx-auto w-full pb-8 md:px-5">
      <ProfileHeader user={user} />
      <Highlights user={user} />
      <ProfileTabs username={user.username} userId={user.id} />
      {children}
    </div>
  );
}
