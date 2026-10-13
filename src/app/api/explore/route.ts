import { getExplore } from "@/lib/data";
import { ok, pageParams, simulateLatency } from "@/lib/http";

/** GET /api/explore?cursor=&limit=&tag= */
export async function GET(request: Request) {
  const { cursor, limit, searchParams } = pageParams(request, 15);
  await simulateLatency();
  return ok(getExplore(cursor, limit, searchParams.get("tag")));
}
