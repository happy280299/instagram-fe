import { Link2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import type { User } from "@/types";
import { ProfileActions } from "./ProfileActions";
import { ProfileStats } from "./ProfileStats";

export function ProfileHeader({ user, canOpenLists = false }: { user: User; canOpenLists?: boolean }) {
  const bio = (
    <div className="text-sm">
      <p className="font-semibold">{user.fullName}</p>
      <p className="whitespace-pre-line">{user.bio}</p>
      {user.website && (
        <a
          href={`https://${user.website}`}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="text-primary inline-flex items-center gap-1 font-semibold hover:underline"
        >
          <Link2 aria-hidden className="size-3.5" /> {user.website}
        </a>
      )}
    </div>
  );

  return (
    <header className="px-4 pt-4 md:px-0 md:pt-8">
      <div className="flex items-center gap-6 md:items-start md:gap-8 lg:gap-24">
        <div className="flex shrink-0 md:w-[min(290px,30%)] md:justify-center">
          <span className="md:hidden">
            <Avatar src={user.avatar} username={user.username} size="profile" priority />
          </span>
          <span className="hidden md:block">
            <Avatar src={user.avatar} username={user.username} size="xl" priority />
          </span>
        </div>
        <section className="flex min-w-0 flex-col gap-4 md:gap-5">
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-5">
            <h1 className="flex items-center gap-1.5 truncate text-xl">
              {user.username}
              {user.isVerified && <VerifiedBadge className="size-4" />}
            </h1>
            <ProfileActions user={user} />
          </div>
          <ProfileStats user={user} canOpenLists={canOpenLists} className="hidden gap-10 text-base md:flex" />
          <div className="hidden md:block">{bio}</div>
        </section>
      </div>
      <div className="mt-4 md:hidden">{bio}</div>
      <ProfileStats user={user} canOpenLists={canOpenLists} className="border-separator mt-4 -mx-4 border-t py-3 text-center text-sm md:hidden" />
    </header>
  );
}
