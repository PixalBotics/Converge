"use client";

import { useQuery } from "@tanstack/react-query";
import { listWebsitesInScope } from "@/api";
import { websiteAssignmentsKeys } from "./keys";

export type WebsiteAssignmentsWebsitesParams = {
  /** When true, disables paging and returns up to safe max rows (dropdowns). */
  all?: boolean;
  page?: number;
  limit?: number;
  /** Filter by assignment state: true = at least one agent, false = none, omit = all. */
  assigned?: boolean;
  resellerId?: string;
  parentCompanyId?: string;
  childCompanyId?: string;
  userId?: string;
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
