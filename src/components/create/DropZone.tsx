"use client";

import { ImagePlus } from "lucide-react";
import { type DragEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { imageFileError, isVideoFile, VIDEO_TYPES } from "@/lib/media-file";

export function DropZone({ onFile, onError }: { onFile: (file: File) => void; onError: (message: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function accept(file: File | undefined) {
    if (!file) return;
    // Videos are checked (size, length) once their metadata is read.
    const error = isVideoFile(file) ? null : imageFileError(file);
    if (error) return onError(error);
    onFile(file);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    accept(event.dataTransfer.files[0]);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn("flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center transition-colors", dragging && "bg-hover")}
    >
      <ImagePlus aria-hidden className={cn("size-20 stroke-1", dragging && "text-primary")} />
      <p className="text-xl">Drag photos and videos here</p>
      <input
        ref={inputRef}
        type="file"
        accept={["image/*", ...VIDEO_TYPES].join(",")}
        className="sr-only"
        aria-label="Select a photo or video from your computer"
        onChange={(e) => accept(e.target.files?.[0])}
      />
      <Button data-autofocus onClick={() => inputRef.current?.click()}>
        Select from computer
      </Button>
    </div>
  );
}
