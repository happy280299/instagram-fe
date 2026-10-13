import { createUser } from "@/lib/data";
import { fail, ok, readJson, simulateLatency } from "@/lib/http";

export async function POST(request: Request) {
  const { contact, fullName, username, password } = await readJson<{ contact: string; fullName: string; username: string; password: string }>(request);
  await simulateLatency(500, 900);
  if (!contact?.trim()) return fail("Enter a mobile number or email address.");
  if (!password || password.length < 6) return fail("Create a password at least 6 characters long.");
  const result = createUser(username ?? "", fullName ?? "");
  if ("error" in result) return fail(result.error, 409);
  return ok(result, { status: 201 });
}
