import { getReels } from "@/lib/data";
import { ok, pageParams, simulateLatency } from "@/lib/http";

export async function GET(request: Request) {
  const { cursor, limit } = pageParams(request, 4);
  await simulateLatency();
  return ok(getReels(cursor, limit));
}
