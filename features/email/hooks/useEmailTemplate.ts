"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteResellerEmailLogo,
  getResellerEmailTemplateDraft,
  getResellerEmailTemplateDraftPreview,
  getResellerEmailTemplatePublished,
  getResellerEmailTemplatePublishedPreview,
  publishResellerEmailTemplateDraft,
  updateResellerEmailTemplateDraft,
  uploadResellerEmailLogo,
} from "../api/email-api";
import type { EmailTemplateDraftBody } from "../types";
import { emailKeys } from "./keys";

export function useEmailTemplateDraftQuery(resellerId: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: emailKeys.templateDraft(resellerId ?? ""),
    queryFn: () => getResellerEmailTemplateDraft(resellerId!),
    enabled: Boolean(resellerId?.trim()) && (options?.enabled ?? true),
  });
}

export function useUpdateEmailTemplateDraftMutation(resellerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: EmailTemplateDraftBody) => updateResellerEmailTemplateDraft(resellerId, body),
    onSuccess: (data) => {
      qc.setQueryData(emailKeys.templateDraft(resellerId), data);
      void qc.invalidateQueries({ queryKey: emailKeys.templateDraftPreview(resellerId) });
    },
  });
}

export function usePublishEmailTemplateMutation(resellerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => publishResellerEmailTemplateDraft(resellerId),
    onSuccess: (data) => {
      qc.setQueryData(emailKeys.templateDraft(resellerId), data);
      void qc.invalidateQueries({ queryKey: emailKeys.templatePublishedPreview(resellerId) });
    },
  });
}

export function useEmailTemplatePublishedQuery(resellerId: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: emailKeys.templatePublished(resellerId ?? ""),
    queryFn: () => getResellerEmailTemplatePublished(resellerId!),
    enabled: Boolean(resellerId?.trim()) && (options?.enabled ?? true),
    retry: false,
  });
}

export function useEmailTemplateDraftPreviewQuery(resellerId: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: emailKeys.templateDraftPreview(resellerId ?? ""),
    queryFn: () => getResellerEmailTemplateDraftPreview(resellerId!),
    enabled: Boolean(resellerId?.trim()) && (options?.enabled ?? true),
  });
}

export function useEmailTemplatePublishedPreviewQuery(resellerId: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: emailKeys.templatePublishedPreview(resellerId ?? ""),
    queryFn: () => getResellerEmailTemplatePublishedPreview(resellerId!),
    enabled: Boolean(resellerId?.trim()) && (options?.enabled ?? true),
  });
}

export function useUploadEmailLogoMutation(resellerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadResellerEmailLogo(resellerId, file),
    meta: { skipSuccessToast: true },
    onSuccess: (data) => {
      qc.setQueryData(emailKeys.templateDraft(resellerId), data);
      void qc.invalidateQueries({ queryKey: emailKeys.templateDraftPreview(resellerId) });
    },
  });
}

export function useDeleteEmailLogoMutation(resellerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteResellerEmailLogo(resellerId),
    meta: { skipSuccessToast: true },
    onSuccess: (data) => {
      qc.setQueryData(emailKeys.templateDraft(resellerId), data);
      void qc.invalidateQueries({ queryKey: emailKeys.templateDraftPreview(resellerId) });
    },
  });
}
