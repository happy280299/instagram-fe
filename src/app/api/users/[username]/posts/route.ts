import { getTaggedPosts, getUserByUsername, getUserPosts } from "@/lib/data";
import { fail, ok, pageParams, simulateLatency } from "@/lib/http";

/** GET /api/users/:username/posts?tab=posts|tagged&cursor=&limit= */
export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const { cursor, limit, searchParams } = pageParams(request, 12);
  await simulateLatency();
  const user = getUserByUsername(username);
  if (!user) return fail("User not found", 404);
  const tab = searchParams.get("tab") ?? "posts";
  if (tab === "tagged") return ok(getTaggedPosts(user.id, cursor, limit));
  if (tab === "posts") return ok(getUserPosts(user.id, cursor, limit));
  return fail("Unknown tab");
}
