"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteServiceScheduling,
  fetchServiceScheduling,
  saveServiceScheduling,
} from "@/services/chat/service-scheduling.api";
import type { UpsertServiceSchedulingBody } from "@/services/chat/service-scheduling.types";
import { chatSettingsKeys } from "./keys";

export function serviceSchedulingQueryKey(websiteId: string) {
  return [...chatSettingsKeys.website(websiteId), "service-scheduling"] as const;
}

export function useServiceSchedulingQuery(websiteId: string, apiEnabled = true) {
  const id = websiteId.trim();
  return useQuery({
    queryKey: serviceSchedulingQueryKey(id),
    queryFn: () => fetchServiceScheduling(id),
    enabled: apiEnabled && id.length > 0,
  });
}

export function useSaveServiceSchedulingMutation(websiteId: string) {
  const id = websiteId.trim();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertServiceSchedulingBody) => saveServiceScheduling(id, body),
    onSuccess: (data) => {
      queryClient.setQueryData(serviceSchedulingQueryKey(id), data);
      void queryClient.invalidateQueries({ queryKey: ["website-assignments"] });
    },
  });
}

export function useDeleteServiceSchedulingMutation(websiteId: string) {
  const id = websiteId.trim();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteServiceScheduling(id),
    onSuccess: (data) => {
      queryClient.setQueryData(serviceSchedulingQueryKey(id), data);
      void queryClient.invalidateQueries({ queryKey: ["website-assignments"] });
    },
  });
}
