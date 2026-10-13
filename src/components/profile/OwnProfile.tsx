"use client";

import type { ReactNode } from "react";
import { NotFoundView } from "@/components/ui/NotFoundView";
import { useAuthStore } from "@/store/auth";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { ProfileTabs } from "./ProfileTabs";

/**
 * Profile of the logged-in backend user, rendered from the session (GET /auth/me).
 * Used when the username isn't in the mock data; anyone else's unknown username is a 404.
 */
export function OwnProfile({ username, children }: { username: string; children: ReactNode }) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const me = useAuthStore((s) => s.user);

  if (!hydrated) return <ProfileSkeleton />;
  if (!me || me.username !== decodeURIComponent(username).toLowerCase()) return <NotFoundView />;

  return (
    <div className="max-w-content mx-auto w-full pb-8 md:px-5">
      <ProfileHeader user={me} />
      <ProfileTabs username={me.username} userId={me.id} />
      {children}
    </div>
  );
}
