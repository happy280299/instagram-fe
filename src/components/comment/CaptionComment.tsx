import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { RichText } from "@/components/ui/RichText";
import { TimeAgo } from "@/components/ui/TimeAgo";
import type { PostWithAuthor } from "@/types";

/** The post caption rendered as the first entry of the comment list. */
export function CaptionComment({ post }: { post: PostWithAuthor }) {
  if (!post.caption) return null;
  return (
    <li className="flex gap-3 py-2">
      <Avatar src={post.author.avatar} username={post.author.username} size="sm" />
      <div className="min-w-0 text-sm">
        <p className="break-words whitespace-pre-line">
          <Link href={`/${post.author.username}`} className="mr-1 font-semibold hover:opacity-60">
            {post.author.username}
          </Link>
          <RichText text={post.caption} />
        </p>
        <TimeAgo date={post.createdAt} className="text-muted mt-1 block text-xs" />
      </div>
    </li>
  );
}
