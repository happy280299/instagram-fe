import Link from "next/link";
import { Fragment } from "react";
import { parseCaption } from "@/lib/parse-caption";

/** Renders text with #hashtags (→ explore search) and @mentions (→ profile) as links. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {parseCaption(text).map((token, i) => {
        if (token.type === "hashtag") {
          return (
            <Link key={i} href={`/explore?tag=${encodeURIComponent(token.value)}`} className="text-primary dark:text-primary hover:underline">
              #{token.value}
            </Link>
          );
        }
        if (token.type === "mention") {
          return (
            <Link key={i} href={`/${token.value}`} className="text-primary hover:underline">
              @{token.value}
            </Link>
          );
        }
        return <Fragment key={i}>{token.value}</Fragment>;
      })}
    </>
  );
}
