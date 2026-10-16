"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { IconButton } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { prependToPages } from "@/hooks/usePaginatedQuery";
import { getErrorMessage } from "@/lib/api";
import { postService } from "@/services/post.service";
import { uploadService } from "@/services/upload.service";
import { cn } from "@/lib/cn";
import { queryKeys } from "@/lib/query-keys";
import { isVideoFile, MAX_POST_VIDEO_SECONDS, openVideoFile } from "@/lib/media-file";
import { loadImage, renderImage } from "@/lib/render-image";
import { useAuthStore } from "@/store/auth";
import { toast, useUIStore } from "@/store/ui";
import { CaptionStep } from "./CaptionStep";
import { CropStep } from "./CropStep";
import { DropZone } from "./DropZone";
import { FilterStep } from "./FilterStep";
import { ASPECTS, type Draft, FILTERS, nearestAspect } from "./types";

type Step = "select" | "crop" | "filter" | "caption";
const ORDER: Step[] = ["select", "crop", "filter", "caption"];
/** Videos are uploaded as-is, so they skip the canvas-only crop and filter steps. */
const VIDEO_ORDER: Step[] = ["select", "caption"];
const TITLES: Record<Step, string> = { select: "Create new post", crop: "Crop", filter: "Edit", caption: "Create new post" };

export function CreatePostModal() {
  const setOpen = useUIStore((s) => s.setCreateOpen);
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("select");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [caption, setCaption] = useState("");
  const [shareToFeed, setShareToFeed] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState<"back" | "close" | null>(null);

  const close = () => {
    if (draft?.src) URL.revokeObjectURL(draft.src);
    setOpen(false);
  };
  const reset = () => {
    if (draft?.src) URL.revokeObjectURL(draft.src);
    setDraft(null);
    setCaption("");
    setShareToFeed(true);
    setStep("select");
  };
  const requestClose = () => (draft && !sharing ? setConfirmDiscard("close") : !sharing && close());
  const order = draft?.video ? VIDEO_ORDER : ORDER;
  const go = (dir: 1 | -1) => setStep(order[order.indexOf(step) + dir]);

  async function onFile(file: File) {
    if (isVideoFile(file)) {
      try {
        const { src, width, height } = await openVideoFile(file, MAX_POST_VIDEO_SECONDS);
        setDraft({ src, name: file.name, width, height, aspect: nearestAspect(width, height), zoom: 1, offsetX: 0, offsetY: 0, filter: FILTERS[0], video: file });
        setStep("caption");
      } catch (err) {
        toast(getErrorMessage(err));
      }
      return;
    }
    const src = URL.createObjectURL(file);
    try {
      const img = await loadImage(src);
      setDraft({ src, name: file.name, width: img.naturalWidth, height: img.naturalHeight, aspect: "1:1", zoom: 1, offsetX: 0, offsetY: 0, filter: FILTERS[0] });
      setStep("crop");
    } catch {
      URL.revokeObjectURL(src);
      toast("That image couldn't be opened.");
    }
  }

  async function share() {
    if (!draft) return;
    setSharing(true);
    try {
      const uploaded = draft.video
        ? await uploadService.media(draft.video, draft.name)
        : await uploadService.media((await renderImage({ ...draft, aspect: ASPECTS[draft.aspect], filter: draft.filter.css })).blob, "post.jpg");
      const post = await postService.create({
        caption,
        media: [{ url: uploaded.url, width: uploaded.width, height: uploaded.height }],
        // Only meaningful for a reel (a single video); the backend decides what's a reel.
        ...(draft.video ? { shareToFeed } : {}),
      });
      const username = post.author.username.toLowerCase();
      const inFeed = !post.isReel || shareToFeed;
      if (inFeed) {
        prependToPages(queryClient, queryKeys.feed, post);
        prependToPages(queryClient, queryKeys.userPosts(username), post);
      }
      if (post.isReel) prependToPages(queryClient, queryKeys.userReels(username), post);
      queryClient.setQueryData(queryKeys.post(post.id), post);
      // Post counts: the profile page's and the session's (/auth/me).
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile(username) });
      void useAuthStore.getState().refreshMe();
      toast(post.isReel ? "Your reel has been shared." : "Your post has been shared.");
      close();
    } catch (err) {
      toast(getErrorMessage(err, "Couldn't share your post. Try again."));
      setSharing(false);
    }
  }

  const wide = step === "filter" || step === "caption";
  return (
    <Modal
      open
      onClose={requestClose}
      title={TITLES[step]}
      hideTitle
      showOverlayClose
      className={cn("md:max-w-[min(90vw,calc(80dvh))]!", wide && "md:max-w-[min(95vw,calc(80dvh+340px))]!")}
    >
      <header className="border-separator flex h-11 items-center border-b px-2">
        <span className="w-16">
          {step !== "select" && (
            <IconButton label="Back" onClick={() => (step === order[1] ? setConfirmDiscard("back") : go(-1))} disabled={sharing}>
              <ArrowLeft aria-hidden className="size-6" />
            </IconButton>
          )}
        </span>
        <h2 className="flex-1 text-center font-semibold" aria-live="polite">{TITLES[step]}</h2>
        <span className="flex w-16 justify-end">
          {step !== "select" && (
            sharing ? <Spinner size="sm" className="mr-2" /> : (
              <button type="button" onClick={() => (step === "caption" ? void share() : go(1))} className="text-primary hover:text-foreground px-2 text-sm font-semibold">
                {step === "caption" ? "Share" : "Next"}
              </button>
            )
          )}
        </span>
      </header>
      <div className="flex min-h-[min(60dvh,420px)] overflow-y-auto md:h-[min(80dvh,calc(90vw))]">
        {step === "select" && <DropZone onFile={(f) => void onFile(f)} onError={toast} />}
        {draft && step === "crop" && <CropStep draft={draft} onChange={setDraft} />}
        {draft && step === "filter" && <FilterStep draft={draft} onChange={setDraft} />}
        {draft && step === "caption" && (
          <CaptionStep draft={draft} caption={caption} onCaption={setCaption} shareToFeed={shareToFeed} onShareToFeed={setShareToFeed} />
        )}
      </div>
      <ActionMenu
        open={confirmDiscard !== null}
        onClose={() => setConfirmDiscard(null)}
        title="Discard post?"
        actions={[{ label: "Discard", tone: "danger", onSelect: confirmDiscard === "back" ? reset : close }]}
      />
    </Modal>
  );
}
