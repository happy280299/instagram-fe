"use client";

import { useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useUIStore } from "@/store/ui";
import type { ID } from "@/types";
import { AddComment } from "./AddComment";
import type { ReplyTarget } from "./CommentItem";
import { CommentList } from "./CommentList";
import { useComments } from "./useComments";

/** "View all comments" sheet opened from feed cards. */
export function CommentsModal() {
  const postId = useUIStore((s) => s.commentsPostId);
  const close = useUIStore((s) => s.closeComments);
  if (!postId) return null;
  return (
    <Modal open onClose={close} title="Comments" className="h-[min(80dvh,720px)] md:max-w-lg!">
      <CommentsBody key={postId} postId={postId} />
    </Modal>
  );
}

function CommentsBody({ postId }: { postId: ID }) {
  const comments = useComments(postId);
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4">
        <CommentList
          threads={comments.items}
          loading={comments.loading}
          done={comments.done}
          sentinelRef={comments.sentinelRef}
          onDelete={(id) => void comments.remove(id)}
          onReply={(target) => {
            setReplyTo(target);
            inputRef.current?.focus();
          }}
        />
      </div>
      <div className="border-separator border-t px-4">
        {replyTo && (
          <p className="text-muted flex justify-between pt-2 text-xs">
            Replying to @{replyTo.username}
            <button type="button" onClick={() => setReplyTo(null)} className="font-semibold">
              Cancel
            </button>
          </p>
        )}
        <AddComment
          key={replyTo?.commentId ?? "root"}
          postId={postId}
          defaultText={replyTo ? `@${replyTo.username} ` : ""}
          inputRef={inputRef}
          onAdded={(c) => {
            comments.add(c);
            setReplyTo(null);
          }}
        />
      </div>
    </>
  );
}
