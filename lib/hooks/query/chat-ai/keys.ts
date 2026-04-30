import type { VisitorAiAnalyticsParams } from "@/services/chat/chatAi.types";

export const chatAiKeys = {
  all: ["chat-ai"] as const,
  visitorAnalytics: (params?: VisitorAiAnalyticsParams) =>
    [...chatAiKeys.all, "visitor-analytics", params?.from ?? "", params?.to ?? ""] as const,
};
