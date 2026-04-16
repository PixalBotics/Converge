"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserFilterSuggestions, listUsers } from "@/api";
import { usersKeys } from "./keys";

type UserFilterSuggestionKind =
  | "company"
  | "parentCompany"
  | "reseller"
  | "role"
  | "department"
  | "designation"
  | "user";

export type UserFilterSuggestionsParams = {
  kind: UserFilterSuggestionKind;
  q: string;
};

export type UsersListParams = {
  page?: number;
  limit?: number;
  userType?: "Internal" | "External";
  search?: string;
  companyId?: string;
  companyName?: string;
  parentCompanyId?: string;
  departmentId?: string;
  designationId?: string;
  userId?: string;
};

export function useUserFilterSuggestionsQuery(
  params: UserFilterSuggestionsParams,
  options?: { enabled?: boolean },
) {
  const enabledByInput = params.q.trim().length > 0;
  return useQuery({
    queryKey: usersKeys.filterSuggestions(params),
    queryFn: () => getUserFilterSuggestions(params),
    enabled: (options?.enabled ?? true) && enabledByInput,
  });
}

export function useUsersListQuery(params?: UsersListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => listUsers(params),
    enabled: options?.enabled ?? true,
  });
}
