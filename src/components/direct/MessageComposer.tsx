"use client";

import { Heart, ImageIcon, Smile } from "lucide-react";
import dynamic from "next/dynamic";
import { type FormEvent, useRef, useState } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { imageFileError, isVideoFile, MAX_VIDEO_BYTES, VIDEO_TYPES } from "@/lib/media-file";
import { toast } from "@/store/ui";
import type { ID } from "@/types";
import type { Outgoing } from "./useSendMessage";
import { useTypingEmitter } from "./useTypingEmitter";

const EmojiPicker = dynamic(() => import("./EmojiPicker").then((m) => m.EmojiPicker), { ssr: false });

/** Same limit as POST /api/conversations/:id/messages. */
const MAX_LENGTH = 2000;

/** Why a picked file can't be sent, or null. The backend re-checks (type by content, size, video length). */
function attachmentError(file: File): string | null {
  if (!isVideoFile(file)) return imageFileError(file);
  if (!VIDEO_TYPES.some((t) => t === file.type)) return "Only MP4, MOV or WebM videos are supported.";
  if (file.size > MAX_VIDEO_BYTES) return "This video is too large (max 50 MB).";
  return null;
}

interface MessageComposerProps {
  conversationId: ID;
  onSend: (outgoing: Outgoing) => void;
}

export function MessageComposer({ conversationId, onSend }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { onInput, stop } = useTypingEmitter(conversationId);

  function send(outgoing: Outgoing) {
    stop();
    onSend(outgoing);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const body = text.trim();
    if (!body) return;
    send({ text: body });
    setText("");
  }

  function attach(file: File | undefined) {
    if (!file) return;
    const error = attachmentError(file);
    if (error) return toast(error);
    send({ file, kind: isVideoFile(file) ? "video" : "image" });
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
        <label htmlFor="dm-input" className="sr-only">
          Message
        </label>
        <input
          id="dm-input"
          ref={inputRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (e.target.value.trim()) onInput();
            else stop();
          }}
          onBlur={stop}
          placeholder="Message…"
          maxLength={MAX_LENGTH}
          autoComplete="off"
          className="placeholder:text-muted min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none"
        />
        <input
          ref={fileRef}
          type="file"
          accept={["image/*", ...VIDEO_TYPES].join(",")}
          className="sr-only"
          aria-label="Send a photo or video"
          onChange={(e) => {
            attach(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {text.trim() ? (
          <button type="submit" className="text-primary hover:text-foreground px-3 text-sm font-semibold">
            Send
          </button>
        ) : (
          <>
            <IconButton label="Add photo or video" onClick={() => fileRef.current?.click()}>
              <ImageIcon aria-hidden className="size-6" />
            </IconButton>
            <IconButton label="Send a like" onClick={() => send({ text: "❤️" })}>
              <Heart aria-hidden className="size-6" />
            </IconButton>
          </>
        )}
      </div>
    </form>
  );
}
