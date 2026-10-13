import { DEMO_USER_ID } from "@/lib/constants";
import { addComment, getComments, contentExists } from "@/lib/data";
import { fail, ok, pageParams, readJson, simulateLatency, viewerId } from "@/lib/http";

type Params = { params: Promise<{ postId: string }> };

export async function GET(request: Request, { params }: Params) {
  const { postId } = await params;
  const { cursor, limit } = pageParams(request, 15);
  await simulateLatency();
  if (!contentExists(postId)) return fail("Post not found", 404);
  return ok(getComments(postId, cursor, limit));
}

export async function POST(request: Request, { params }: Params) {
  const { postId } = await params;
  const { text, parentId } = await readJson<{ text: string; parentId: string | null }>(request);
  await simulateLatency(200, 500);
  if (!contentExists(postId)) return fail("Post not found", 404);
  const body = text?.trim();
  if (!body) return fail("Comment cannot be empty");
  if (body.length > 2200) return fail("Comment is too long");
  return ok(addComment(postId, viewerId(request, DEMO_USER_ID), body, parentId ?? null), { status: 201 });
}
