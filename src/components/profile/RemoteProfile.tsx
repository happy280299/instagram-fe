"use client";

import type { ReactNode } from "react";
import { ErrorView } from "@/components/ui/ErrorView";
import { NotFoundView } from "@/components/ui/NotFoundView";
import { useAuthStore } from "@/store/auth";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { ProfileTabs } from "./ProfileTabs";
import { useProfile } from "./useProfile";

/**
 * Profile of a backend user (GET /api/users/:username), loaded on the client because
 * isFollowing/isMe depend on the session in localStorage. Used when the username isn't mock data.
 */
export function RemoteProfile({ username, children }: { username: string; children: ReactNode }) {
  const { profile, error, notFound, retry } = useProfile(decodeURIComponent(username));
  const me = useAuthStore((s) => s.user);

  if (notFound) return <NotFoundView />;
  if (error) return <ErrorView title="Couldn't load this profile" description={error} onRetry={retry} />;
  if (!profile) return <ProfileSkeleton />;

  // Your own profile follows the session, so edits show without a refetch.
  const user = profile.isMe && me ? me : profile.user;
  return (
    <div className="max-w-content mx-auto w-full pb-8 md:px-5">
      <ProfileHeader user={user} />
      {/* Saved, reels and tagged have no backend endpoints yet. */}
      <ProfileTabs username={user.username} userId={user.id} tabs={["posts"]} />
      {children}
    </div>
  );
}
