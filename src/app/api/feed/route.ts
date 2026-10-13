import { getFeed } from "@/lib/data";
import { ok, pageParams, simulateLatency } from "@/lib/http";

export async function GET(request: Request) {
  const { cursor, limit } = pageParams(request, 6);
  await simulateLatency();
  return ok(getFeed(cursor, limit));
}
