import Link from "next/link";
import { FollowButton } from "@/components/user/FollowButton";
import { Avatar } from "@/components/ui/Avatar";
import { SafeImage } from "@/components/ui/SafeImage";
import { TimeAgo } from "@/components/ui/TimeAgo";
import type { NotificationWithActor } from "@/types";

const VERB: Record<NotificationWithActor["type"], string> = {
  like: "liked your post.",
  comment: "commented:",
  follow: "started following you.",
  mention: "mentioned you in a comment:",
};

export function NotificationItem({ notification: n }: { notification: NotificationWithActor }) {
  return (
    <li className="hover:bg-hover flex items-center gap-3 px-6 py-2">
      <Link href={`/${n.actor.username}`} aria-hidden tabIndex={-1} className="shrink-0">
        <Avatar src={n.actor.avatar} username={n.actor.username} size="md" />
      </Link>
      <p className="min-w-0 flex-1 text-sm">
        <Link href={`/${n.actor.username}`} className="font-semibold">
          {n.actor.username}
        </Link>{" "}
        {VERB[n.type]}
        {n.text && <> {n.text}</>} <TimeAgo date={n.createdAt} className="text-muted" />
      </p>
      {n.type === "follow" ? (
        <FollowButton user={n.actor} />
      ) : (
        n.postId &&
        n.postThumb && (
          <Link href={`/p/${n.postId}`} aria-label="View post" className="bg-skeleton relative size-11 shrink-0 overflow-hidden rounded">
            <SafeImage src={n.postThumb} alt="" fill sizes="44px" className="object-cover" />
          </Link>
        )
      )}
    </li>
  );
}
