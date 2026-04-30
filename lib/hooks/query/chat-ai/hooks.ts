"use client";

import { useQuery } from "@tanstack/react-query";
import { getVisitorAiAnalytics } from "@/services/chat/chatAiApi";
import type { VisitorAiAnalyticsParams } from "@/services/chat/chatAi.types";
import { chatAiKeys } from "./keys";

export function useVisitorAiAnalyticsQuery(
  params: VisitorAiAnalyticsParams | undefined,
  options?: { enabled?: boolean; token?: string; scope?: string },
) {
  const scope = options?.scope ?? "default";
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: [...chatAiKeys.visitorAnalytics(params), scope] as const,
    queryFn: () => getVisitorAiAnalytics(params, options?.token),
    enabled,
  });
}
