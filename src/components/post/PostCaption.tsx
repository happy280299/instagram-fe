"use client";

import Link from "next/link";
import { useState } from "react";
import { RichText } from "@/components/ui/RichText";
import type { UserSummary } from "@/types";

const LIMIT = 125;

export function PostCaption({ author, caption }: { author: UserSummary; caption: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!caption) return null;
  const truncated = !expanded && caption.length > LIMIT;
  const text = truncated ? `${caption.slice(0, LIMIT).trimEnd()}…` : caption;

  return (
    <p className="mt-1 text-sm break-words whitespace-pre-line">
      <Link href={`/${author.username}`} className="mr-1 font-semibold hover:opacity-60">
        {author.username}
      </Link>
      <RichText text={text} />
      {truncated && (
        <button type="button" onClick={() => setExpanded(true)} className="text-muted ml-1">
          more
        </button>
      )}
    </p>
  );
}
