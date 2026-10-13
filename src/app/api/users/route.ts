import { DEMO_USER_ID } from "@/lib/constants";
import { listUsers } from "@/lib/data";
import { ok, pageParams, simulateLatency, viewerId } from "@/lib/http";

/** GET /api/users?limit= — people the viewer follows first (share sheet recipients). */
export async function GET(request: Request) {
  const { limit } = pageParams(request, 20);
  await simulateLatency();
  return ok(listUsers(viewerId(request, DEMO_USER_ID), limit));
}
