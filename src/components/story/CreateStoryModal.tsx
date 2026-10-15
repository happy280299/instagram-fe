"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CropFrame } from "@/components/ui/CropFrame";
import { Modal } from "@/components/ui/Modal";
import { ZoomSlider } from "@/components/ui/ZoomSlider";
import { getErrorMessage } from "@/lib/api";
import { clampPan, type CropSource } from "@/lib/image-crop";
import { isVideoFile, MAX_STORY_VIDEO_SECONDS, openImageFile, openVideoFile, VIDEO_TYPES, type VideoFile } from "@/lib/media-file";
import { queryKeys } from "@/lib/query-keys";
import { renderImage } from "@/lib/render-image";
import { storyService } from "@/services/story.service";
import { uploadService } from "@/services/upload.service";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/ui";

/** Stories are portrait 9:16; the backend stores photos as uploaded. */
const STORY_ASPECT = 9 / 16;
const STORY_OUTPUT_WIDTH = 1080;

/** A photo is framed and rendered here; a video is uploaded as-is (the backend converts it). */
type Picked = { kind: "photo"; crop: CropSource } | { kind: "video"; video: VideoFile };

/** Upload the picked photo or video and return its URL. */
async function uploadPicked(picked: Picked): Promise<string> {
  if (picked.kind === "video") return (await uploadService.media(picked.video.file, picked.video.file.name)).url;
  const { blob } = await renderImage({ ...picked.crop, aspect: STORY_ASPECT, filter: "none", outputWidth: STORY_OUTPUT_WIDTH });
  return (await uploadService.media(blob, "story.jpg")).url;
}

/** Pick a photo or video, frame photos 9:16, and post it (POST /api/uploads → POST /api/stories). */
export function CreateStoryModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const meId = useAuthStore((s) => s.user?.id ?? null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [sharing, setSharing] = useState(false);
  const pickedSrc = picked ? (picked.kind === "photo" ? picked.crop.src : picked.video.src) : null;
  useEffect(() => () => void (pickedSrc && URL.revokeObjectURL(pickedSrc)), [pickedSrc]);

  async function pick(file: File | undefined) {
    if (!file) return;
    try {
      setPicked(
        isVideoFile(file)
          ? { kind: "video", video: await openVideoFile(file, MAX_STORY_VIDEO_SECONDS) }
          : { kind: "photo", crop: await openImageFile(file) },
      );
    } catch (err) {
      toast(getErrorMessage(err));
    }
  }

  async function share() {
    if (!picked || sharing) return;
    setSharing(true);
    try {
      await storyService.create(await uploadPicked(picked));
      // The tray now starts with the viewer's own story; their open stories gain a slide.
      void queryClient.invalidateQueries({ queryKey: queryKeys.storyTray });
      if (meId) void queryClient.invalidateQueries({ queryKey: queryKeys.userStories(meId) });
      toast("Added to your story");
      onClose();
    } catch (err) {
      toast(getErrorMessage(err, "Couldn't share your story. Try again."));
      setSharing(false);
    }
  }

  return (
    <Modal open onClose={() => !sharing && onClose()} title="New story" className="md:max-w-md!">
      <input
        ref={inputRef}
        type="file"
        accept={["image/*", ...VIDEO_TYPES].join(",")}
        className="sr-only"
        aria-label="Choose a photo or video for your story"
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {picked ? (
        <div className="flex flex-col items-center gap-3 overflow-y-auto p-4">
          {picked.kind === "photo" ? (
            <>
              <CropFrame
                crop={picked.crop}
                aspect={STORY_ASPECT}
                onChange={(crop) => setPicked({ kind: "photo", crop })}
                alt="Story preview"
                className="h-[min(60dvh,480px)] rounded-lg"
              />
              <ZoomSlider
                value={picked.crop.zoom}
                onChange={(zoom) => setPicked({ kind: "photo", crop: clampPan({ ...picked.crop, zoom }, STORY_ASPECT) })}
              />
            </>
          ) : (
            <div style={{ aspectRatio: STORY_ASPECT }} className="relative h-[min(60dvh,480px)] max-w-full overflow-hidden rounded-lg bg-black">
              <video src={picked.video.src} autoPlay muted loop playsInline aria-label="Story preview" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          )}
          <div className="flex w-full gap-2">
            <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={sharing} fullWidth>
              Choose another
            </Button>
            <Button onClick={() => void share()} loading={sharing} fullWidth>
              Share to story
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
          <ImagePlus aria-hidden className="size-16 stroke-1" />
          <p>Share a photo or a video (up to {MAX_STORY_VIDEO_SECONDS} seconds) to your story. It disappears after 24 hours.</p>
          <Button data-autofocus onClick={() => inputRef.current?.click()}>
            Select from computer
          </Button>
        </div>
      )}
    </Modal>
  );
}
