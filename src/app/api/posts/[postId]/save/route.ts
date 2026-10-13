import { contentExists } from "@/lib/data";
import { fail, ok, readJson, simulateLatency } from "@/lib/http";

export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const { saved } = await readJson<{ saved: boolean }>(request);
  await simulateLatency(150, 400);
  if (!contentExists(postId)) return fail("Post not found", 404);
  if (typeof saved !== "boolean") return fail("`saved` must be a boolean");
  return ok({ postId, saved });
}
