import { redirect } from "next/navigation";

export default async function LegacyChatQaConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  redirect(`/dashboard/qa/inbox/${encodeURIComponent(conversationId)}`);
}
