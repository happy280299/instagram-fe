"use client";

import { type FormEvent, useState } from "react";
import { getErrorMessage } from "@/lib/api";
import { commentService } from "@/services/comment.service";
import { cn } from "@/lib/cn";
import { toast } from "@/store/ui";
import type { CommentWithAuthor, ID } from "@/types";

interface AddCommentProps {
  postId: ID;
  placeholder?: string;
  /** Initial text (e.g. "@username " when replying). Remount via `key` to reset. */
  defaultText?: string;
  onAdded?: (comment: CommentWithAuthor) => void;
  className?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}

export function AddComment({ postId, placeholder = "Add a comment…", defaultText = "", onAdded, className, inputRef }: AddCommentProps) {
  const [text, setText] = useState(defaultText);
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const comment = await commentService.create(postId, body);
      setText("");
      onAdded?.(comment);
    } catch (err) {
      toast(getErrorMessage(err, "Couldn't post comment. Try again."));
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className={cn("flex items-center gap-2", className)}>
      <label className="sr-only" htmlFor={`comment-${postId}`}>
        Add a comment
      </label>
      <input
        id={`comment-${postId}`}
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        maxLength={2200}
        autoComplete="off"
        autoFocus={defaultText !== ""}
        className="placeholder:text-muted min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
      />
      {text.trim() && (
        <button type="submit" disabled={sending} className="text-primary hover:text-foreground text-sm font-semibold disabled:opacity-50">
          {sending ? "Posting…" : "Post"}
        </button>
      )}
    </form>
  );
}
