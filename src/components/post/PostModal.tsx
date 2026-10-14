"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";

/** Rendered by the intercepting @modal/(.)p/[postId] route. Closing goes back in history. */
export function PostModal({ label, children }: { label: string; children: ReactNode }) {
  const router = useRouter();
  return (
    <Modal
      open
      onClose={() => router.back()}
      title={label}
      hideTitle
      showOverlayClose
      className="max-w-[min(1200px,calc(100vw-2rem))]! w-auto! rounded-sm! md:h-[min(90dvh,800px)] md:max-w-[min(1200px,calc(100vw-8rem))]!"
    >
      {children}
    </Modal>
  );
}
