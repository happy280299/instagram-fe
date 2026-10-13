"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

/** The 9:16 frame a story (or its loading/error placeholder) is drawn in. */
export const STORY_FRAME_CLASS =
  "relative aspect-[9/16] h-full max-h-dvh w-full max-w-[min(100vw,calc(100dvh*9/16))] overflow-hidden md:h-[calc(100dvh-2rem)] md:rounded-lg";

interface StoryOverlayProps {
  label: string;
  onClose: () => void;
  children: ReactNode;
}

/** Full-screen black dialog that hosts the story frame and its navigation. */
export function StoryOverlay({ label, onClose, children }: StoryOverlayProps) {
  const ref = useFocusTrap<HTMLDivElement>(true, onClose);
  useLockBodyScroll(true);

  return createPortal(
    <div ref={ref} role="dialog" aria-modal="true" aria-label={label} className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black">
      <button type="button" onClick={onClose} aria-label="Close stories" className="text-on-media absolute top-4 right-4 z-20 p-2 hover:opacity-70">
        <X aria-hidden className="size-7" />
      </button>
      {children}
    </div>,
    document.body,
  );
}
