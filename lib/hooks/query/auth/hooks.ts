"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, login, loginAs, logout } from "@/api";
import type { LoginAsRequestBody, LoginRequestBody } from "@/api";
import { authKeys } from "./keys";

export function useMeQuery(options?: {
  permissionsBreakdown?: boolean;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: authKeys.me(options?.permissionsBreakdown),
    queryFn: () =>
      getMe({
        permissionsBreakdown: options?.permissionsBreakdown,
      }),
    enabled: options?.enabled ?? true,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: LoginRequestBody) => login(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
}

export function useLoginAsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: LoginAsRequestBody) => loginAs(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}
