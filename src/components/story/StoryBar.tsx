"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/store/auth";
import { useStoryTray } from "./useStoryTray";
import { YourStoryTile } from "./YourStoryTile";

const StoryTrayViewer = dynamic(() => import("./StoryTrayViewer").then((m) => m.StoryTrayViewer), { ssr: false });
const CreateStoryModal = dynamic(() => import("./CreateStoryModal").then((m) => m.CreateStoryModal), { ssr: false });

const SKELETON_COUNT = 6;

export function StoryBar() {
  const { items, error, loading, retry, markUserSeen } = useStoryTray();
  const me = useAuthStore((s) => s.user);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const scroller = useRef<HTMLUListElement>(null);
  const scrollBy = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  if (loading) return <StoryBarSkeleton />;
  if (error || !items) {
    return (
      <div role="alert" className="mb-2 flex items-center justify-between gap-3 px-3 py-4 md:mb-6 md:px-0">
        <p className="text-muted text-sm">{error ?? "Couldn't load stories."}</p>
        <Button size="sm" variant="secondary" onClick={retry}>
          Try again
        </Button>
      </div>
    );
  }
  const myIndex = items.findIndex((i) => i.isMe);
  // Logged-in viewers always get their own tile, so only guests can see an empty bar.
  if (items.length === 0 && !me) {
    return <p className="text-muted mb-2 px-3 py-4 text-sm md:mb-6 md:px-0">No stories right now. Follow people to see their stories here.</p>;
  }

  return (
    <div className="relative mb-2 md:mb-6">
      <ul ref={scroller} aria-label="Stories" className="scrollbar-none flex gap-3 overflow-x-auto scroll-smooth px-3 py-3 md:px-0">
        {me && <YourStoryTile me={me} mine={items[myIndex] ?? null} onView={() => setOpenIndex(myIndex)} onAdd={() => setCreating(true)} />}
        {items.map((item, index) => {
          if (item.isMe && me) return null;
          const label = item.isMe ? "Your story" : item.user.username;
          return (
            <li key={item.user.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                className="flex w-16.5 flex-col items-center gap-1"
                aria-label={`View ${item.isMe ? "your" : `${item.user.username}'s`} story${item.hasUnseen ? ", unseen" : ""}`}
              >
                <Avatar src={item.user.avatar} username={item.user.username} size="lg" ring={item.hasUnseen ? "unseen" : "seen"} />
                <span className="w-full truncate text-center text-xs">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        aria-label="Scroll stories left"
        onClick={() => scrollBy(-1)}
        className="bg-on-media absolute top-8 left-1 hidden size-6 items-center justify-center rounded-full shadow md:flex"
      >
        <ChevronLeft aria-hidden className="size-4 text-black" />
      </button>
      <button
        type="button"
        aria-label="Scroll stories right"
        onClick={() => scrollBy(1)}
        className="bg-on-media absolute top-8 right-1 hidden size-6 items-center justify-center rounded-full shadow md:flex"
      >
        <ChevronRight aria-hidden className="size-4 text-black" />
      </button>
      {creating && <CreateStoryModal onClose={() => setCreating(false)} />}
      {openIndex !== null && (
        <StoryTrayViewer tray={items} startIndex={openIndex} onClose={() => setOpenIndex(null)} onUserSeen={markUserSeen} />
      )}
    </div>
  );
}

function StoryBarSkeleton() {
  return (
    <div role="status" aria-label="Loading stories" className="scrollbar-none mb-2 flex gap-3 overflow-hidden px-3 py-3 md:mb-6 md:px-0">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <div key={i} className="flex w-16.5 shrink-0 flex-col items-center gap-1">
          <Skeleton rounded="full" className="size-16" />
          <Skeleton className="h-2.5 w-12" />
        </div>
      ))}
    </div>
  );
}
