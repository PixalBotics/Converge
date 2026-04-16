"use client";

import { useQuery } from "@tanstack/react-query";
import { listWebsitesInScope } from "@/api";
import { websiteAssignmentsKeys } from "./keys";

export type WebsiteAssignmentsWebsitesParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export function useWebsiteAssignmentsWebsitesQuery(
  params?: WebsiteAssignmentsWebsitesParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: websiteAssignmentsKeys.websites(params),
    queryFn: () => listWebsitesInScope(params),
    enabled: options?.enabled ?? true,
  });
}
