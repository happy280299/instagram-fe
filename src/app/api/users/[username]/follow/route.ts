import { getUserByUsername } from "@/lib/data";
import { fail, ok, readJson, simulateLatency } from "@/lib/http";

/** Acknowledges follow/unfollow; the client overlays the change on counts. */
export async function POST(request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const { follow } = await readJson<{ follow: boolean }>(request);
  await simulateLatency(200, 500);
  const user = getUserByUsername(username);
  if (!user) return fail("User not found", 404);
  if (typeof follow !== "boolean") return fail("`follow` must be a boolean");
  return ok({ userId: user.id, following: follow });
}
