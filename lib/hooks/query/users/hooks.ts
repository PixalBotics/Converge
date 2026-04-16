"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  getUser,
  getUserFilterSuggestions,
  listUsers,
  updateUser,
} from "@/api";
import type { JsonRecord } from "@/api";
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

export function useUserQuery(id: string | undefined, options?: { enabled?: boolean }) {
  const trimmed = id?.trim() ?? "";
  return useQuery({
    queryKey: usersKeys.detail(trimmed),
    queryFn: () => getUser(trimmed),
    enabled: (options?.enabled ?? true) && trimmed.length > 0,
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: JsonRecord) => createUser(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; body: JsonRecord }) => updateUser(vars.id, vars.body),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: usersKeys.detail(vars.id) });
    },
  });
}
