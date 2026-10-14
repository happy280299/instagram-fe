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
import { loadImage, renderImage } from "@/lib/render-image";
import { useAuthStore } from "@/store/auth";
import { toast, useUIStore } from "@/store/ui";
import { CaptionStep } from "./CaptionStep";
import { CropStep } from "./CropStep";
import { DropZone } from "./DropZone";
import { FilterStep } from "./FilterStep";
import { ASPECTS, type Draft, FILTERS } from "./types";

type Step = "select" | "crop" | "filter" | "caption";
const ORDER: Step[] = ["select", "crop", "filter", "caption"];
const TITLES: Record<Step, string> = { select: "Create new post", crop: "Crop", filter: "Edit", caption: "Create new post" };

export function CreatePostModal() {
  const setOpen = useUIStore((s) => s.setCreateOpen);
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("select");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [caption, setCaption] = useState("");
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
    setStep("select");
  };
  const requestClose = () => (draft && !sharing ? setConfirmDiscard("close") : !sharing && close());
  const go = (dir: 1 | -1) => setStep(ORDER[ORDER.indexOf(step) + dir]);

  async function onFile(file: File) {
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
      const image = await renderImage({ ...draft, aspect: ASPECTS[draft.aspect], filter: draft.filter.css });
      const uploaded = await uploadService.image(image.blob, "post.jpg");
      const post = await postService.create({ caption, media: [{ url: uploaded.url, width: uploaded.width, height: uploaded.height }] });
      const username = post.author.username.toLowerCase();
      prependToPages(queryClient, queryKeys.feed, post);
      prependToPages(queryClient, queryKeys.userPosts(username), post);
      queryClient.setQueryData(queryKeys.post(post.id), post);
      // Post counts: the profile page's and the session's (/auth/me).
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile(username) });
      void useAuthStore.getState().refreshMe();
      toast("Your post has been shared.");
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
            <IconButton label="Back" onClick={() => (step === "crop" ? setConfirmDiscard("back") : go(-1))} disabled={sharing}>
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
        {draft && step === "caption" && <CaptionStep draft={draft} caption={caption} onCaption={setCaption} />}
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
