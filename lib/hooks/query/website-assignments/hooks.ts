"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignWebsiteTier,
  getWebsiteAssignmentDetail,
  listWebsitesForUser,
  listWebsitesInScope,
  putDepartmentRoster,
  putWebsiteAssignmentSlot,
  removeWebsiteSlotAssignment,
} from "@/api";
import type { AssignWebsiteTierBody, JsonRecord, PutDepartmentRosterBody } from "@/api";
import { useAuth } from "@/lib/auth";
import { buildWebsiteAssignmentsScopeParams } from "@/lib/companies/reseller-list-filter";
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
  serviceSchedulingConfigured?: boolean;
  fullyAssigned?: boolean;
};

export function useWebsiteAssignmentsWebsitesQuery(
  params?: WebsiteAssignmentsWebsitesParams,
  options?: { enabled?: boolean; /** Only platform admins may pass `resellerId`. */ allowResellerIdFilter?: boolean },
) {
  const { user } = useAuth();
  const scopedParams = buildWebsiteAssignmentsScopeParams(params, user);
  return useQuery({
    queryKey: websiteAssignmentsKeys.websites(scopedParams),
    queryFn: () => listWebsitesInScope(scopedParams),
    enabled: options?.enabled ?? true,
  });
}

export type WebsiteAssignmentsUserWebsitesParams = {
  page?: number;
  limit?: number;
  search?: string;
  assigned?: boolean;
};

export function useWebsiteAssignmentDetailQuery(
  websiteId: string | undefined,
  options?: { enabled?: boolean },
) {
  const id = websiteId?.trim() ?? "";
  return useQuery({
    queryKey: websiteAssignmentsKeys.website(id),
    queryFn: () => getWebsiteAssignmentDetail(id),
    enabled: (options?.enabled ?? true) && id.length > 0,
  });
}

export function useWebsiteAssignmentsUserWebsitesQuery(
  userId: string | undefined,
  params?: WebsiteAssignmentsUserWebsitesParams,
  options?: { enabled?: boolean },
) {
  const id = userId?.trim() ?? "";
  const req = params as JsonRecord | undefined;
  return useQuery({
    queryKey: websiteAssignmentsKeys.userWebsites(id, req),
    queryFn: () => listWebsitesForUser(id, req),
    enabled: (options?.enabled ?? true) && id.length > 0,
  });
}

export function useAssignWebsiteTierMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AssignWebsiteTierBody) => putWebsiteAssignmentSlot(body),
    onSuccess: (_data, body) => {
      void queryClient.invalidateQueries({ queryKey: websiteAssignmentsKeys.all });
      void queryClient.invalidateQueries({
        queryKey: websiteAssignmentsKeys.website(body.websiteId),
      });
    },
  });
}

export function usePutDepartmentRosterMutation(websiteId: string) {
  const queryClient = useQueryClient();
  const wid = websiteId.trim();
  return useMutation({
    mutationFn: (args: { departmentId: string; body: PutDepartmentRosterBody }) =>
      putDepartmentRoster(wid, args.departmentId, args.body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: websiteAssignmentsKeys.all });
      if (wid) {
        void queryClient.invalidateQueries({
          queryKey: websiteAssignmentsKeys.website(wid),
        });
      }
    },
  });
}

export function useRemoveWebsiteSlotMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      websiteId: string;
      departmentId: string;
      serviceChannel: AssignWebsiteTierBody["serviceChannel"];
      assignmentType: AssignWebsiteTierBody["assignmentType"];
    }) =>
      removeWebsiteSlotAssignment(
        args.websiteId,
        args.departmentId,
        args.serviceChannel,
        args.assignmentType,
      ),
    onSuccess: (_data, args) => {
      void queryClient.invalidateQueries({ queryKey: websiteAssignmentsKeys.all });
      void queryClient.invalidateQueries({
        queryKey: websiteAssignmentsKeys.website(args.websiteId),
      });
    },
  });
}
