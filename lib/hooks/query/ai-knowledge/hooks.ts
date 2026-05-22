"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAiChatbotSource,
  listAiChatbotSources,
  postAiChatbotReindex,
  postAiChatbotSourceJson,
} from "@/api/ai-chatbot/ai-chatbot-knowledge.api";
import {
  deleteAiAssistantKbSource,
  listAiAssistantKbSources,
  postAiAssistantKbReindex,
  postAiAssistantKbSourceJson,
  postAiAssistantKbSourceMultipart,
  type UploadAssistantKbSourceParams,
} from "@/api/ai-assistant/ai-assistant-kb.api";
import type {
  CreateKnowledgeSourceJsonBody,
  ListKnowledgeSourcesParams,
  ReindexKnowledgeBody,
} from "@/api/ai-knowledge/types";
import { aiAssistantKbKeys, aiChatbotKnowledgeKeys } from "./keys";

export function useAiChatbotSourcesQuery(
  params: ListKnowledgeSourcesParams | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: aiChatbotKnowledgeKeys.sources(params),
    queryFn: () => listAiChatbotSources(params),
    enabled: (options?.enabled ?? true) && Boolean(params?.websiteId?.trim()),
  });
}

export function useAiAssistantKbSourcesQuery(
  params: ListKnowledgeSourcesParams | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: aiAssistantKbKeys.sources(params),
    queryFn: () => listAiAssistantKbSources(params),
    enabled: (options?.enabled ?? true) && Boolean(params?.websiteId?.trim()),
  });
}

export function useCreateAiChatbotSourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateKnowledgeSourceJsonBody) => postAiChatbotSourceJson(body),
    meta: { skipSuccessToast: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiChatbotKnowledgeKeys.all });
    },
  });
}

export function useCreateAiAssistantKbSourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: CreateKnowledgeSourceJsonBody | UploadAssistantKbSourceParams) => {
      if ("file" in vars) return postAiAssistantKbSourceMultipart(vars);
      return postAiAssistantKbSourceJson(vars);
    },
    meta: { skipSuccessToast: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiAssistantKbKeys.all });
    },
  });
}

export function useDeleteAiChatbotSourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sourceId: string) => deleteAiChatbotSource(sourceId),
    meta: { skipSuccessToast: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiChatbotKnowledgeKeys.all });
    },
  });
}

export function useDeleteAiAssistantKbSourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sourceId: string) => deleteAiAssistantKbSource(sourceId),
    meta: { skipSuccessToast: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiAssistantKbKeys.all });
    },
  });
}

export function useAiChatbotReindexMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReindexKnowledgeBody) => postAiChatbotReindex(body),
    meta: { skipSuccessToast: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiChatbotKnowledgeKeys.all });
    },
  });
}

export function useAiAssistantKbReindexMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReindexKnowledgeBody) => postAiAssistantKbReindex(body),
    meta: { skipSuccessToast: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiAssistantKbKeys.all });
    },
  });
}
