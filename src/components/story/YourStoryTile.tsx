"use client";

import { Plus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import type { StoryTrayItem, User } from "@/types";

interface YourStoryTileProps {
  me: User;
  /** The viewer's tray entry, when they have an active story. */
  mine: StoryTrayItem | null;
  onView: () => void;
  onAdd: () => void;
}

const BADGE =
  "bg-primary text-on-media border-background absolute right-0 bottom-5 flex size-5 items-center justify-center rounded-full border-2";

/** First tile of the story bar: opens your story, and the "+" badge adds to it. */
export function YourStoryTile({ me, mine, onView, onAdd }: YourStoryTileProps) {
  const plus = <Plus aria-hidden className="size-3" strokeWidth={3} />;

  if (!mine) {
    return (
      <li className="shrink-0">
        <button type="button" onClick={onAdd} className="relative flex w-16.5 flex-col items-center gap-1" aria-label="Add to your story">
          {/* p-1 matches the ring's width so the tile lines up with the others. */}
          <Avatar src={me.avatar} username={me.username} size="lg" className="p-1" />
          <span className={BADGE}>{plus}</span>
          <span className="text-muted w-full truncate text-center text-xs">Your story</span>
        </button>
      </li>
    );
  }

  // Two sibling buttons, since a button can't contain another one.
  return (
    <li className="relative shrink-0">
      <button
        type="button"
        onClick={onView}
        className="flex w-16.5 flex-col items-center gap-1"
        aria-label={`View your story${mine.hasUnseen ? ", unseen" : ""}`}
      >
        <Avatar src={me.avatar} username={me.username} size="lg" ring={mine.hasUnseen ? "unseen" : "seen"} />
        <span className="w-full truncate text-center text-xs">Your story</span>
      </button>
      <button type="button" onClick={onAdd} aria-label="Add to your story" className={cn(BADGE, "hover:opacity-90")}>
        {plus}
      </button>
    </li>
  );
}
