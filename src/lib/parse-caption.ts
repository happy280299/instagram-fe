export type CaptionToken =
  | { type: "text"; value: string }
  | { type: "hashtag"; value: string }
  | { type: "mention"; value: string };

const TOKEN_RE = /([#@][\p{L}\p{N}_.]+)/gu;

/** Splits a caption into plain text, #hashtag and @mention tokens. */
export function parseCaption(text: string): CaptionToken[] {
  return text
    .split(TOKEN_RE)
    .filter((part) => part.length > 0)
    .map((part): CaptionToken => {
      if (part.startsWith("#") && part.length > 1) return { type: "hashtag", value: part.slice(1) };
      if (part.startsWith("@") && part.length > 1) return { type: "mention", value: part.slice(1).replace(/\.+$/, "") };
      return { type: "text", value: part };
    });
}
