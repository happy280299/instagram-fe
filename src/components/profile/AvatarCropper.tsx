"use client";

import { CropFrame } from "@/components/ui/CropFrame";
import { ZoomSlider } from "@/components/ui/ZoomSlider";
import { clampPan, type CropSource } from "@/lib/image-crop";

/** A picked photo and how it's framed. */
export type AvatarCrop = CropSource;

/** Avatars are square; the backend crops its thumbnail square too. */
export const AVATAR_ASPECT = 1;

/** Square frame with a circular guide: drag to position the photo, slider to zoom. */
export function AvatarCropper({ crop, onChange }: { crop: AvatarCrop; onChange: (crop: AvatarCrop) => void }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <CropFrame
        crop={crop}
        aspect={AVATAR_ASPECT}
        onChange={onChange}
        alt="New profile photo"
        className="w-60 rounded-md"
        // Dims everything outside the circle the avatar will show.
        overlay={<span className="absolute inset-0 rounded-full outline-200 outline-black/50 outline-solid" />}
      />
      <p className="text-muted text-xs">Drag to reposition</p>
      <ZoomSlider value={crop.zoom} onChange={(zoom) => onChange(clampPan({ ...crop, zoom }, AVATAR_ASPECT))} />
    </div>
  );
}
