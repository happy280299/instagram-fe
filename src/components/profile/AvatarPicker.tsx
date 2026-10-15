"use client";

import { useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/api";
import { openImageFile } from "@/lib/media-file";
import { hasAvatar, placeholderAvatar } from "@/services/auth.service";
import type { User } from "@/types";
import { type AvatarCrop, AvatarCropper } from "./AvatarCropper";

/** What saving the form does to the avatar. */
export type AvatarChange = { kind: "keep" } | { kind: "remove" } | ({ kind: "new" } & AvatarCrop);

interface AvatarPickerProps {
  user: User;
  value: AvatarChange;
  onChange: (value: AvatarChange) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

/** Current avatar with "Change photo" / "Remove photo"; a picked photo opens the cropper. Uploaded on save. */
export function AvatarPicker({ user, value, onChange, onError, disabled }: AvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pickedSrc = value.kind === "new" ? value.src : null;
  useEffect(() => () => void (pickedSrc && URL.revokeObjectURL(pickedSrc)), [pickedSrc]);

  async function pick(file: File | undefined) {
    if (!file) return;
    try {
      onChange({ kind: "new", ...(await openImageFile(file)) });
    } catch (err) {
      onError(getErrorMessage(err));
    }
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="sr-only"
      aria-label="Choose a profile photo"
      onChange={(e) => {
        void pick(e.target.files?.[0]);
        // Picking the same file again should still fire onChange.
        e.target.value = "";
      }}
    />
  );
  const choose = () => inputRef.current?.click();

  if (value.kind === "new") {
    return (
      <div className="flex flex-col items-center gap-3">
        <AvatarCropper crop={value} onChange={(crop) => onChange({ kind: "new", ...crop })} />
        <div className="flex gap-2">
          {fileInput}
          <Button size="sm" variant="secondary" onClick={choose} disabled={disabled}>
            Choose another
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onChange({ kind: "keep" })} disabled={disabled}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar src={value.kind === "remove" ? placeholderAvatar(user.id) : user.avatar} username={user.username} size="lg" />
      <div className="flex flex-wrap gap-2">
        {fileInput}
        <Button size="sm" onClick={choose} disabled={disabled}>
          Change photo
        </Button>
        {value.kind === "keep" && hasAvatar(user) && (
          <Button size="sm" variant="danger" onClick={() => onChange({ kind: "remove" })} disabled={disabled}>
            Remove photo
          </Button>
        )}
      </div>
    </div>
  );
}
