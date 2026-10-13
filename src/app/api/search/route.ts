import { searchUsers } from "@/lib/data";
import { ok, pageParams, simulateLatency } from "@/lib/http";

/** GET /api/search?q= — username / full-name search. */
export async function GET(request: Request) {
  const { searchParams, limit } = pageParams(request, 20);
  await simulateLatency(200, 500);
  return ok(searchUsers(searchParams.get("q") ?? "", limit));
}
