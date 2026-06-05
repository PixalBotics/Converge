"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { applyLoginAsTokenPair, login, loginAs, logout } from "@/api";
import { getMe } from "@/api/auth/auth.api";
import type { LoginAsRequestBody, LoginRequestBody } from "@/api";
import { requestApplyLoginAsSession } from "@/lib/auth/apply-login-as-session";
import { requestAfterTokenSessionSync } from "@/lib/auth/after-token-session-sync";
import {
  beginAuthTransition,
  endAuthTransition,
} from "@/lib/auth/auth-transition";
import { clearAppQueryCache } from "../core/app-query-cache";
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
    meta: { skipSuccessToast: true },
    onSettled: () => {
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
}

export function useLoginAsMutation(options?: { navigateTo?: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: LoginAsRequestBody) => {
      beginAuthTransition("login-as");
      try {
        return await loginAs(body);
      } catch (error) {
        endAuthTransition();
        throw error;
      }
    },
    onSuccess: async (data) => {
      try {
        applyLoginAsTokenPair(data);
        requestApplyLoginAsSession(data);
        clearAppQueryCache();
        queryClient.clear();
        await requestAfterTokenSessionSync();
        router.replace(options?.navigateTo ?? "/dashboard");
        await queryClient.invalidateQueries({ queryKey: authKeys.all });
      } finally {
        endAuthTransition();
      }
    },
    onError: () => {
      endAuthTransition();
    },
  });
}
