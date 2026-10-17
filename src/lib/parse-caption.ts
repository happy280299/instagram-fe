export type CaptionToken =
  | { type: "text"; value: string }
  | { type: "hashtag"; value: string }
  | { type: "mention"; value: string };

/** Same rules as the backend (text-entities.ts): hashtags are letters/digits/_, mentions are usernames. */
const TOKEN_RE = /(#[\p{L}\p{N}_]{1,50}|@[A-Za-z0-9._]{1,30})/gu;

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

/** The hashtag page for a tag; tags are matched lowercased (NFC), so link that form. */
export const hashtagHref = (tag: string) => `/explore/tags/${encodeURIComponent(tag.toLowerCase().normalize("NFC"))}`;
