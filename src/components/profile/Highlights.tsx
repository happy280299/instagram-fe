"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import type { StoryWithUser, User } from "@/types";

const StoryViewer = dynamic(() => import("@/components/story/StoryViewer").then((m) => m.StoryViewer), { ssr: false });

export function Highlights({ user }: { user: User }) {
  const [open, setOpen] = useState<number | null>(null);
  if (user.highlights.length === 0) return null;

  // Present each highlight as a one-slide story.
  const stories: StoryWithUser[] = user.highlights.map((h) => ({
    id: h.id,
    userId: user.id,
    user,
    slides: [{ id: `${h.id}-0`, url: h.cover.replace(/\/200\/200$/, "/720/1280"), createdAt: new Date(0).toISOString() }],
  }));

  return (
    <>
      <ul aria-label="Story highlights" className="scrollbar-none flex gap-4 overflow-x-auto px-4 py-6 md:gap-12 md:px-12 md:py-10">
        {user.highlights.map((h, i) => (
          <li key={h.id} className="shrink-0">
            <button type="button" onClick={() => setOpen(i)} className="flex w-16 flex-col items-center gap-2 md:w-[87px]">
              <span className="border-separator bg-background block rounded-full border p-[3px]">
                <span className="bg-skeleton relative block size-14 overflow-hidden rounded-full md:size-[77px]">
                  <SafeImage src={h.cover} alt="" fill sizes="77px" className="object-cover" />
                </span>
              </span>
              <span className="w-full truncate text-center text-xs font-semibold">{h.title}</span>
            </button>
          </li>
        ))}
      </ul>
      {open !== null && <StoryViewer stories={stories} startIndex={open} onClose={() => setOpen(null)} />}
    </>
  );
}
