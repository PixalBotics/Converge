"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWidgetDraftConfig,
  getWidgetPublishedConfig,
  patchWidgetDraftConfig,
  publishWidgetDraft,
  rollbackWidgetPublished,
  uploadWidgetLogo,
} from "@/api";
import type { JsonRecord } from "@/api";
import { chatWidgetKeys } from "./keys";

export function useWidgetPublishedConfigQuery(
  widgetId: string | undefined,
  options?: { enabled?: boolean; scope?: string },
) {
  const id = widgetId?.trim() ?? "";
  const scope = options?.scope ?? "default";
  const enabled = Boolean(id) && (options?.enabled ?? true);
  return useQuery({
    queryKey: [...chatWidgetKeys.published(id), scope] as const,
    queryFn: () => getWidgetPublishedConfig(id),
    enabled,
  });
}

export function useWidgetDraftConfigQuery(
  widgetId: string | undefined,
  options?: { enabled?: boolean; scope?: string },
) {
  const id = widgetId?.trim() ?? "";
  const scope = options?.scope ?? "default";
  const enabled = Boolean(id) && (options?.enabled ?? true);
  return useQuery({
    queryKey: [...chatWidgetKeys.draft(id), scope] as const,
    queryFn: () => getWidgetDraftConfig(id),
    enabled,
  });
}

export function usePatchWidgetDraftMutation(widgetId: string) {
  const qc = useQueryClient();
  const id = widgetId.trim();
  return useMutation({
    mutationFn: (body: JsonRecord) => patchWidgetDraftConfig(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatWidgetKeys.draft(id) });
      void qc.invalidateQueries({ queryKey: chatWidgetKeys.published(id) });
    },
  });
}

export function usePublishWidgetDraftMutation(widgetId: string) {
  const qc = useQueryClient();
  const id = widgetId.trim();
  return useMutation({
    mutationFn: () => publishWidgetDraft(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatWidgetKeys.all });
    },
  });
}

export function useRollbackWidgetMutation(widgetId: string) {
  const qc = useQueryClient();
  const id = widgetId.trim();
  return useMutation({
    mutationFn: () => rollbackWidgetPublished(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatWidgetKeys.all });
    },
  });
}

export function useUploadWidgetLogoMutation(widgetId: string) {
  const qc = useQueryClient();
  const id = widgetId.trim();
  return useMutation({
    mutationFn: (file: File) => uploadWidgetLogo(id, file),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatWidgetKeys.draft(id) });
      void qc.invalidateQueries({ queryKey: chatWidgetKeys.published(id) });
    },
  });
}
