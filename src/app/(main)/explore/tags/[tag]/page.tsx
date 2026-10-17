import type { Metadata } from "next";
import { HashtagPage } from "@/components/explore/HashtagPage";

type Props = { params: Promise<{ tag: string }> };

/** Next may hand the segment over still percent-encoded (e.g. #đàlạt); a malformed one is used as-is. */
function tagOf(raw: string) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `#${tagOf((await params).tag)}` };
}

export default async function TagPage({ params }: Props) {
  const tag = tagOf((await params).tag);
  return <HashtagPage key={tag} tag={tag} />;
}
