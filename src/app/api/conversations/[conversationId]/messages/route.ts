import { DEMO_USER_ID } from "@/lib/constants";
import { getConversation, sendMessage } from "@/lib/data";
import { fail, ok, readJson, simulateLatency, viewerId } from "@/lib/http";

export async function POST(request: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const { text } = await readJson<{ text: string }>(request);
  const sender = viewerId(request, DEMO_USER_ID);
  await simulateLatency(200, 500);
  if (!getConversation(conversationId, sender)) return fail("Conversation not found", 404);
  const body = text?.trim();
  if (!body) return fail("Message cannot be empty");
  if (body.length > 1000) return fail("Message is too long");
  const message = sendMessage(conversationId, sender, body);
  return message ? ok(message, { status: 201 }) : fail("Conversation not found", 404);
}
