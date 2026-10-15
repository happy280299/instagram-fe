import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import type { UserSummary } from "@/types";
import { FollowButton } from "./FollowButton";

/** A user row with avatar, username, a subtitle and a Follow button (hidden for the viewer). */
export function UserListItem({ user, subtitle = user.fullName }: { user: UserSummary; subtitle?: string }) {
  return (
    <li className="flex items-center gap-3 py-2">
      <Link href={`/${user.username}`} tabIndex={-1} aria-hidden>
        <Avatar src={user.avatar} username={user.username} size="md" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/${user.username}`} className="flex items-center gap-1 text-sm font-semibold hover:opacity-60">
          <span className="truncate">{user.username}</span>
          {user.isVerified && <VerifiedBadge />}
        </Link>
        <p className="text-muted truncate text-xs">{subtitle}</p>
      </div>
      <FollowButton user={user} variant="text" />
    </li>
  );
}
