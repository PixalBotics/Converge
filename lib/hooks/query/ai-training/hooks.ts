"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAiTrainingBehavior,
  fetchAiTrainingTestContext,
  patchAiTrainingBehavior,
  postAiTrainingTestRespond,
  type WebsiteAiBehavior,
} from "@/api/ai-training/ai-training.api";
import { aiTrainingKeys } from "./keys";

export function useAiTrainingBehaviorQuery(
  websiteId: string | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: aiTrainingKeys.behavior(websiteId ?? ""),
    queryFn: () => fetchAiTrainingBehavior(websiteId!),
    enabled: (options?.enabled ?? true) && Boolean(websiteId?.trim()),
  });
}

export function useAiTrainingTestContextQuery(
  websiteId: string | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: aiTrainingKeys.testContext(websiteId ?? ""),
    queryFn: () => fetchAiTrainingTestContext(websiteId!),
    enabled: (options?.enabled ?? true) && Boolean(websiteId?.trim()),
  });
}

export function useUpdateAiTrainingBehaviorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { websiteId: string; body: Partial<WebsiteAiBehavior> }) =>
      patchAiTrainingBehavior(params.websiteId, params.body),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: aiTrainingKeys.behavior(vars.websiteId),
      });
    },
  });
}

export function useAiTrainingTestRespondMutation() {
  return useMutation({
    mutationFn: postAiTrainingTestRespond,
    meta: { skipSuccessToast: true },
  });
}
