import { DEMO_USER_ID } from "@/lib/constants";
import { getSuggestions } from "@/lib/data";
import { ok, pageParams, simulateLatency, viewerId } from "@/lib/http";

export async function GET(request: Request) {
  const { limit } = pageParams(request, 5);
  await simulateLatency();
  return ok(getSuggestions(viewerId(request, DEMO_USER_ID), limit));
}
