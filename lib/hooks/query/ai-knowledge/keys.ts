import type { ListKnowledgeSourcesParams } from "@/api/ai-knowledge/types";

export const aiChatbotKnowledgeKeys = {
  all: ["ai-chatbot-knowledge"] as const,
  sources: (params?: ListKnowledgeSourcesParams) =>
    [...aiChatbotKnowledgeKeys.all, "sources", params ?? {}] as const,
};

export const aiAssistantKbKeys = {
  all: ["ai-assistant-kb"] as const,
  sources: (params?: ListKnowledgeSourcesParams) =>
    [...aiAssistantKbKeys.all, "sources", params ?? {}] as const,
};
