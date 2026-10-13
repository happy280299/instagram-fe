import { ChatPane } from "@/components/direct/ChatPane";

export default async function ThreadPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  return <ChatPane key={conversationId} conversationId={conversationId} />;
}
