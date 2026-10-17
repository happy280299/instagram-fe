"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Switch } from "@/components/ui/Switch";
import { TextField } from "@/components/ui/TextField";
import { getErrorMessage } from "@/lib/api";
import { updateCachedPost } from "@/lib/post-cache";
import { postService, type UpdatePostBody } from "@/services/post.service";
import { toast } from "@/store/ui";
import type { PostWithAuthor } from "@/types";

/** Same limits as PATCH /api/posts/:id. */
const CAPTION_LIMIT = 2200;
const LOCATION_LIMIT = 100;

/** Edit a post's caption, location and (reels) "Also share to Feed". Media can't change, like Instagram. */
export function EditPostModal({ post, onClose }: { post: PostWithAuthor; onClose: () => void }) {
  const [caption, setCaption] = useState(post.caption);
  const [location, setLocation] = useState(post.location ?? "");
  const [shareToFeed, setShareToFeed] = useState(post.shareToFeed ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const body: UpdatePostBody = {};
    if (caption.trim() !== post.caption) body.caption = caption.trim();
    if (location.trim() !== (post.location ?? "")) body.location = location.trim();
    if (post.isReel && shareToFeed !== (post.shareToFeed ?? true)) body.shareToFeed = shareToFeed;
    if (Object.keys(body).length === 0) return onClose();

    setSaving(true);
    setError(null);
    try {
      const updated = await postService.update(post.id, body);
      updateCachedPost(post.id, (p) => ({ ...p, caption: updated.caption, location: updated.location, shareToFeed: updated.shareToFeed }));
      toast("Post updated");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't update the post. Try again."));
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={() => !saving && onClose()} title="Edit info" className="md:max-w-md!">
      <form onSubmit={submit} noValidate className="flex flex-col gap-3 overflow-y-auto p-4">
        <div className="bg-secondary border-separator focus-within:border-muted rounded-sm border">
          <label htmlFor="edit-caption" className="sr-only">
            Caption
          </label>
          <textarea
            id="edit-caption"
            data-autofocus
            value={caption}
            maxLength={CAPTION_LIMIT}
            rows={6}
            placeholder="Write a caption… Use #hashtags and @mentions"
            onChange={(e) => setCaption(e.target.value)}
            className="placeholder:text-muted block w-full resize-none bg-transparent px-2 py-2 text-sm outline-none"
          />
          <p className="text-muted px-2 pb-1 text-right text-xs" aria-live="polite">
            {caption.length.toLocaleString("en-US")} / {CAPTION_LIMIT.toLocaleString("en-US")}
          </p>
        </div>
        <TextField label="Location (leave empty to remove)" value={location} maxLength={LOCATION_LIMIT} onChange={(e) => setLocation(e.target.value)} />
        {post.isReel && (
          <div className="flex items-center justify-between gap-3">
            <span id="edit-share-to-feed" className="text-sm">
              Also share to Feed
            </span>
            <Switch checked={shareToFeed} onChange={setShareToFeed} labelledBy="edit-share-to-feed" />
          </div>
        )}
        {error && (
          <p role="alert" className="text-danger text-center text-sm whitespace-pre-line">
            {error}
          </p>
        )}
        <Button type="submit" loading={saving} fullWidth>
          Done
        </Button>
      </form>
    </Modal>
  );
}
