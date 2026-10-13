import { DEMO_USER_ID } from "@/lib/constants";
import { createPost, getPostsByIds } from "@/lib/data";
import { fail, ok, readJson, simulateLatency, viewerId } from "@/lib/http";
import type { Media } from "@/types";

/** GET /api/posts?ids=p1,p2 — used by the Saved tab. */
export async function GET(request: Request) {
  const ids = (new URL(request.url).searchParams.get("ids") ?? "").split(",").filter(Boolean).slice(0, 100);
  await simulateLatency();
  return ok(getPostsByIds(ids));
}

const MAX_IMAGE_CHARS = 4_000_000; // ~3 MB of base64

/** POST /api/posts — create a post from a client-rendered (data URL) image. */
export async function POST(request: Request) {
  const { media, caption } = await readJson<{ media: Omit<Media, "id">[]; caption: string }>(request);
  await simulateLatency(500, 900);
  if (!Array.isArray(media) || media.length === 0 || media.length > 10) return fail("Add between 1 and 10 images");
  const valid = media.every(
    (m) => typeof m.url === "string" && m.url.startsWith("data:image/") && m.url.length < MAX_IMAGE_CHARS && m.width > 0 && m.height > 0,
  );
  if (!valid) return fail("Invalid image data");
  const text = typeof caption === "string" ? caption.slice(0, 2200) : "";
  return ok(createPost(viewerId(request, DEMO_USER_ID), media, text), { status: 201 });
}
