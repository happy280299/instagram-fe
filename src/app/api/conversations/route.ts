import { DEMO_USER_ID } from "@/lib/constants";
import { getConversations } from "@/lib/data";
import { ok, simulateLatency, viewerId } from "@/lib/http";

export async function GET(request: Request) {
  await simulateLatency();
  return ok(getConversations(viewerId(request, DEMO_USER_ID)));
}
