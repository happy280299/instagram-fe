"use client";

import { Heart, ImageIcon, Smile } from "lucide-react";
import dynamic from "next/dynamic";
import { type FormEvent, useRef, useState } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { toast } from "@/store/ui";

const EmojiPicker = dynamic(() => import("./EmojiPicker").then((m) => m.EmojiPicker), { ssr: false });

export function MessageComposer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    const body = text.trim();
    if (!body) return;
    onSend(body);
    setText("");
  }

  return (
    <form onSubmit={submit} className="p-4">
      <div className="border-separator relative flex items-center gap-1 rounded-full border px-2 py-1">
        <IconButton label="Choose an emoji" aria-expanded={pickerOpen} onClick={() => setPickerOpen((v) => !v)}>
          <Smile aria-hidden className="size-6" />
        </IconButton>
        {pickerOpen && (
          <EmojiPicker
            onClose={() => {
              setPickerOpen(false);
              inputRef.current?.focus();
            }}
            onPick={(emoji) => setText((t) => t + emoji)}
          />
        )}
        <label htmlFor="dm-input" className="sr-only">Message</label>
        <input
          id="dm-input"
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message…"
          maxLength={1000}
          autoComplete="off"
          className="placeholder:text-muted min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none"
        />
        {text.trim() ? (
          <button type="submit" className="text-primary hover:text-foreground px-3 text-sm font-semibold">
            Send
          </button>
        ) : (
          <>
            <IconButton label="Add photo" onClick={() => toast("Photo messages aren't available in this demo")}>
              <ImageIcon aria-hidden className="size-6" />
            </IconButton>
            <IconButton label="Send a like" onClick={() => onSend("❤️")}>
              <Heart aria-hidden className="size-6" />
            </IconButton>
          </>
        )}
      </div>
    </form>
  );
}
