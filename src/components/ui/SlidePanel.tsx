"use client";

import type { ReactNode } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/cn";

interface SlidePanelProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

/**
 * Slide-out panel that docks next to the collapsed sidebar on desktop and
 * covers the screen (below the top bar) on mobile.
 */
export function SlidePanel({ title, onClose, children, className }: SlidePanelProps) {
  const ref = useFocusTrap<HTMLElement>(true, onClose);
  return (
    <>
      <div aria-hidden className="fixed inset-0 z-30" onClick={onClose} />
      <aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "animate-slide-in bg-background border-separator fixed inset-y-0 left-0 z-40 flex w-full flex-col outline-none",
          "md:left-(--container-sidebar-collapsed) md:w-panel md:rounded-r-2xl md:border-r md:shadow-xl",
          "top-topbar bottom-bottomnav md:top-0 md:bottom-0",
          className,
        )}
      >
        <h2 className="px-6 pt-6 pb-4 text-2xl font-semibold">{title}</h2>
        {children}
      </aside>
    </>
  );
}
