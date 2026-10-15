"use client";

import { Eye, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { Spinner } from "@/components/ui/Spinner";
import type { StorySlide } from "@/types";

const StoryViewersModal = dynamic(() => import("./StoryViewersModal").then((m) => m.StoryViewersModal), { ssr: false });

interface OwnStoryFooterProps {
  slide: StorySlide;
  /** Pauses the story while a dialog is open. */
  hold: (held: boolean) => void;
  onDelete: (slide: StorySlide) => Promise<void>;
}

type Dialog = "viewers" | "delete" | null;

/** "Seen by N" and delete, shown under your own story. */
export function OwnStoryFooter({ slide, hold, onDelete }: OwnStoryFooterProps) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const [deleting, setDeleting] = useState(false);
  // ActionMenu calls onSelect then onClose in the same tick, before `deleting` re-renders.
  const deletingRef = useRef(false);
  const open = (next: Dialog) => {
    setDialog(next);
    hold(next !== null);
  };
  const count = slide.viewCount ?? 0;

  async function handleDelete() {
    deletingRef.current = true;
    setDeleting(true);
    try {
      await onDelete(slide);
    } finally {
      deletingRef.current = false;
      setDeleting(false);
      hold(false);
    }
  }

  return (
    <div className="text-on-media flex items-center justify-between">
      <button type="button" onClick={() => open("viewers")} className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-80">
        <Eye aria-hidden className="size-5" />
        Seen by {count}
      </button>
      <button
        type="button"
        onClick={() => open("delete")}
        disabled={deleting}
        aria-label="Delete story"
        className="p-1 hover:opacity-80 disabled:opacity-50"
      >
        {deleting ? <Spinner size="sm" /> : <Trash2 aria-hidden className="size-5" />}
      </button>
      {dialog === "viewers" && <StoryViewersModal storyId={slide.id} count={count} onClose={() => open(null)} />}
      <ActionMenu
        open={dialog === "delete"}
        onClose={() => {
          setDialog(null);
          // Keep playback held while the delete runs; handleDelete releases it.
          if (!deletingRef.current) hold(false);
        }}
        title="Delete story?"
        actions={[{ label: "Delete", tone: "danger", onSelect: () => void handleDelete() }]}
      />
    </div>
  );
}
