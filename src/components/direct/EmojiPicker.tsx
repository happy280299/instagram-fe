"use client";

import { useState } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/cn";

const CATEGORIES: { name: string; emojis: string[] }[] = [
  { name: "Smileys", emojis: ["😀", "😂", "🥹", "😊", "😍", "🥰", "😘", "😎", "🤩", "🥳", "😅", "😉", "🙃", "😇", "🤔", "😴", "😭", "😡", "🤯", "😱", "🤗", "🙄", "😬", "🤤"] },
  { name: "Gestures", emojis: ["👍", "👎", "👏", "🙌", "🙏", "👋", "🤝", "💪", "✌️", "🤞", "👌", "🫶", "🤙", "👀", "🫡", "🤘"] },
  { name: "Hearts", emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "❤️‍🔥", "💕", "💖"] },
  { name: "Things", emojis: ["🔥", "✨", "🎉", "🌈", "☀️", "🌙", "⭐", "🍕", "☕", "🍰", "🌸", "🌊", "📷", "🎶", "✈️", "🏝️"] },
];

interface EmojiPickerProps {
  onPick: (emoji: string) => void;
  onClose: () => void;
}

/** Lightweight emoji picker (no dependency). Loaded on demand via next/dynamic. */
export function EmojiPicker({ onPick, onClose }: EmojiPickerProps) {
  const [tab, setTab] = useState(0);
  const ref = useFocusTrap<HTMLDivElement>(true, onClose);

  return (
    <>
      <div aria-hidden className="fixed inset-0 z-30" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-label="Emoji picker"
        className="bg-elevated border-separator animate-fade-in absolute bottom-full left-0 z-40 mb-2 w-72 rounded-xl border shadow-xl"
      >
        <div role="tablist" aria-label="Emoji categories" className="border-separator flex border-b">
          {CATEGORIES.map((c, i) => (
            <button
              key={c.name}
              type="button"
              role="tab"
              aria-selected={tab === i}
              onClick={() => setTab(i)}
              className={cn("flex-1 py-2 text-xs font-semibold", tab === i ? "border-foreground border-b-2" : "text-muted")}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div role="tabpanel" aria-label={CATEGORIES[tab].name} className="grid max-h-56 grid-cols-8 gap-0.5 overflow-y-auto p-2">
          {CATEGORIES[tab].emojis.map((emoji) => (
            <button key={emoji} type="button" aria-label={`Insert ${emoji}`} onClick={() => onPick(emoji)} className="hover:bg-hover rounded-md p-1 text-xl">
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
