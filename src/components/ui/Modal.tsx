"use client";

import { X } from "lucide-react";
import { useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useHydrated } from "@/hooks/useHydrated";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Accessible dialog title. Rendered visibly unless `hideTitle`. */
  title: string;
  hideTitle?: boolean;
  children: ReactNode;
  className?: string;
  /** Show the floating close (X) button on the overlay, Instagram-style. */
  showOverlayClose?: boolean;
}

export function Modal({ open, onClose, title, hideTitle, children, className, showOverlayClose }: ModalProps) {
  const hydrated = useHydrated();
  const titleId = useId();
  const ref = useFocusTrap<HTMLDivElement>(open, onClose);
  useLockBodyScroll(open);

  if (!open || !hydrated) return null;

  return createPortal(
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden className="bg-overlay absolute inset-0" onClick={onClose} />
      {showOverlayClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-on-media absolute top-3 right-3 z-10 p-2 hover:opacity-70"
        >
          <X aria-hidden className="size-7" />
        </button>
      )}
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "bg-elevated relative z-10 flex max-h-[calc(100dvh-2rem)] w-full max-w-sm flex-col overflow-hidden rounded-xl shadow-xl outline-none",
          className,
        )}
      >
        <h2
          id={titleId}
          className={cn(hideTitle ? "sr-only" : "border-separator border-b py-3 text-center text-base font-bold")}
        >
          {title}
        </h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}
