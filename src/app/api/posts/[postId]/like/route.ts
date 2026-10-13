import { contentExists } from "@/lib/data";
import { fail, ok, readJson, simulateLatency } from "@/lib/http";

/**
 * Acknowledges a like/unlike. Counts are not mutated server-side: the client
 * overlays the viewer's own like on top of the server count (optimistic UI).
 */
export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const { liked } = await readJson<{ liked: boolean }>(request);
  await simulateLatency(150, 400);
  if (!contentExists(postId)) return fail("Post not found", 404);
  if (typeof liked !== "boolean") return fail("`liked` must be a boolean");
  return ok({ postId, liked });
}
