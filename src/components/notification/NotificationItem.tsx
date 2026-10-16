import Link from "next/link";
import { Fragment } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { SafeImage } from "@/components/ui/SafeImage";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { FollowButton } from "@/components/user/FollowButton";
import { cn } from "@/lib/cn";
import type { Activity } from "@/types";

const VERB: Record<Activity["type"], string> = {
  like: "liked your post.",
  comment: "commented:",
  follow: "started following you.",
};

/** "a", "a and b", "a, b and 3 others": the backend sends the latest actors plus a total. */
function ActorNames({ activity }: { activity: Activity }) {
  const shown = activity.actors.slice(0, 2);
  const others = activity.actorCount - shown.length;
  return (
    <>
      {shown.map((a, i) => (
        <Fragment key={a.id}>
          {i > 0 && (others > 0 ? ", " : " and ")}
          <Link href={`/${a.username}`} className="font-semibold">
            {a.username}
          </Link>
        </Fragment>
      ))}
      {others > 0 && ` and ${others} ${others === 1 ? "other" : "others"}`}
    </>
  );
}

/** One activity row: who, what, when, and the post (or a Follow button). */
export function NotificationItem({ activity }: { activity: Activity }) {
  const [first, second] = activity.actors;
  if (!first) return null;
  const post = activity.post;

  return (
    <li className="hover:bg-hover flex items-center gap-3 px-6 py-2">
      <Link href={`/${first.username}`} aria-hidden tabIndex={-1} className="relative size-avatar-md shrink-0">
        {second ? (
          // Two people: overlapping avatars, like Instagram.
          <>
            <Avatar src={second.avatar} username={second.username} size="sm" className="absolute top-0 right-0" />
            <Avatar src={first.avatar} username={first.username} size="sm" className="border-background absolute bottom-0 left-0 rounded-full border-2" />
          </>
        ) : (
          <Avatar src={first.avatar} username={first.username} size="md" />
        )}
      </Link>
      <p className="min-w-0 flex-1 text-sm">
        <ActorNames activity={activity} /> {VERB[activity.type]}
        {activity.commentText && <> {activity.commentText}</>} <TimeAgo date={activity.createdAt} className="text-muted" />
      </p>
      {!activity.isRead && <span aria-label="New" className="bg-primary size-2 shrink-0 rounded-full" />}
      {activity.type === "follow" ? (
        <FollowButton user={first} />
      ) : (
        post && (
          <Link href={`/p/${post.id}`} aria-label="View post" className={cn("bg-skeleton relative size-11 shrink-0 overflow-hidden rounded")}>
            {post.thumbnail && <SafeImage src={post.thumbnail} alt="" fill sizes="44px" className="object-cover" />}
          </Link>
        )
      )}
    </li>
  );
}
