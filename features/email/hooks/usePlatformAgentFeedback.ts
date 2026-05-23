"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PlatformAgentFeedbackSettingsBody } from "@/api/types/email.types";
import {
  getPlatformAgentFeedbackSettings,
  updatePlatformAgentFeedbackSettings,
} from "../api/email-api";
import { emailKeys } from "./keys";

export function usePlatformAgentFeedbackQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: emailKeys.platformAgentFeedback(),
    queryFn: () => getPlatformAgentFeedbackSettings(),
    enabled: options?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useUpdatePlatformAgentFeedbackMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PlatformAgentFeedbackSettingsBody) =>
      updatePlatformAgentFeedbackSettings(body),
    onSuccess: (data) => {
      qc.setQueryData(emailKeys.platformAgentFeedback(), data);
    },
  });
}
