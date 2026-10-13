import { createSession } from "@/lib/data";
import { fail, ok, readJson, simulateLatency } from "@/lib/http";

/** Mock login: `<username>@instaclone.dev` of an existing user + a password of 6+ characters. */
export async function POST(request: Request) {
  const { email, password } = await readJson<{
    email: string;
    password: string;
  }>(request);
  await simulateLatency(400, 800);
  if (!email || !password) return fail("Enter your email and password.");
  if (password.length < 6)
    return fail(
      "Sorry, your password was incorrect. Please double-check your password.",
      401,
    );
  const session = createSession(email);
  if (!session)
    return fail(
      "The email you entered doesn't belong to an account. Please check your email and try again.",
      401,
    );
  return ok(session);
}
