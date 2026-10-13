import { DEMO_USER_ID } from "@/lib/constants";
import { getConversation } from "@/lib/data";
import { fail, ok, simulateLatency, viewerId } from "@/lib/http";

export async function GET(request: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  await simulateLatency();
  const convo = getConversation(conversationId, viewerId(request, DEMO_USER_ID));
  return convo ? ok(convo) : fail("Conversation not found", 404);
}
