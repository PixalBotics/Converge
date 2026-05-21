"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWebsiteChatSettings } from "@/services/chat/chat-settings.api";

export function useWebsiteChatDefaults(websiteId: string | null | undefined) {
  const wid = websiteId?.trim() ?? "";
  return useQuery({
    queryKey: ["chat-website-defaults", wid],
    queryFn: () => fetchWebsiteChatSettings(wid),
    enabled: Boolean(wid),
    staleTime: 120_000,
    select: (bundle) => ({
      defaultDepartmentId: bundle.settings.defaultDepartmentId?.trim() ?? "",
      cannedEnabled: Boolean(
        (bundle.settings.operationsJson?.cannedResponses as Record<string, unknown> | undefined)
          ?.enabled ?? true,
      ),
      qaEnabled: Boolean(
        (bundle.settings.operationsJson?.qa as Record<string, unknown> | undefined)?.enabled,
      ),
      cannedCount: bundle.cannedResponses?.length ?? 0,
    }),
  });
}
