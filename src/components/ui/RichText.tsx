import Link from "next/link";
import { Fragment } from "react";
import { hashtagHref, parseCaption } from "@/lib/parse-caption";

/** Renders text with #hashtags (→ hashtag page) and @mentions (→ profile) as links. Never as HTML. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {parseCaption(text).map((token, i) => {
        if (token.type === "hashtag") {
          return (
            <Link key={i} href={hashtagHref(token.value)} className="text-primary dark:text-primary hover:underline">
              #{token.value}
            </Link>
          );
        }
        if (token.type === "mention") {
          return (
            <Link key={i} href={`/${token.value.toLowerCase()}`} className="text-primary hover:underline">
              @{token.value}
            </Link>
          );
        }
        return <Fragment key={i}>{token.value}</Fragment>;
      })}
    </>
  );
}
