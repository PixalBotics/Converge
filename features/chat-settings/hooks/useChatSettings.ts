"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listDepartments } from "@/api/hrms/departments.api";
import { listPools } from "@/api/hrms/pools.api";
import {
  createChatRoute,
  deleteChatRoute,
  fetchWebsiteChatSettings,
  patchChatRoute,
  replaceCannedResponses,
  replaceDepartmentNotifyEmails,
  saveWebsiteChatSettings,
} from "@/services/chat/chat-settings.api";
import type {
  PatchChatRouteBody,
  ReplaceCannedResponsesBody,
  ReplaceDepartmentNotifyEmailsBody,
  UpsertChatRouteBody,
  UpsertWebsiteChatSettingsBody,
} from "@/services/chat/chat-settings.types";
import { fetchQaWebsiteRoster, saveQaWebsiteRoster } from "@/services/chat/qa-roster.api";
import { parseDepartmentOptions, parsePoolOptions } from "../utils/catalog";
import { chatSettingsKeys } from "./keys";

export function useWebsiteChatSettingsQuery(websiteId: string, enabled = true) {
  return useQuery({
    queryKey: chatSettingsKeys.website(websiteId),
    queryFn: () => fetchWebsiteChatSettings(websiteId),
    enabled: Boolean(websiteId) && enabled,
  });
}

export function useDepartmentCatalogQuery(parentCompanyId: string, enabled = true) {
  return useQuery({
    queryKey: chatSettingsKeys.departments(parentCompanyId),
    queryFn: async () => {
      const raw = await listDepartments({
        parentCompanyId,
        all: true,
        limit: 500,
      });
      return parseDepartmentOptions(raw);
    },
    enabled: Boolean(parentCompanyId) && enabled,
  });
}

export function usePoolCatalogQuery(parentCompanyId: string, enabled = true) {
  return useQuery({
    queryKey: chatSettingsKeys.pools(parentCompanyId),
    queryFn: async () => {
      const raw = await listPools({
        parentCompanyId,
        all: true,
        limit: 500,
      });
      return parsePoolOptions(raw);
    },
    enabled: Boolean(parentCompanyId) && enabled,
  });
}

export function useSaveWebsiteChatSettingsMutation(websiteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertWebsiteChatSettingsBody) =>
      saveWebsiteChatSettings(websiteId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatSettingsKeys.website(websiteId) });
    },
  });
}

export function useCreateChatRouteMutation(websiteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertChatRouteBody) => createChatRoute(websiteId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatSettingsKeys.website(websiteId) });
    },
  });
}

export function usePatchChatRouteMutation(websiteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ routeId, body }: { routeId: string; body: PatchChatRouteBody }) =>
      patchChatRoute(websiteId, routeId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatSettingsKeys.website(websiteId) });
    },
  });
}

export function useDeleteChatRouteMutation(websiteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (routeId: string) => deleteChatRoute(websiteId, routeId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatSettingsKeys.website(websiteId) });
    },
  });
}

export function useReplaceDepartmentEmailsMutation(websiteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ReplaceDepartmentNotifyEmailsBody) =>
      replaceDepartmentNotifyEmails(websiteId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatSettingsKeys.website(websiteId) });
    },
  });
}

export function useReplaceCannedResponsesMutation(websiteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ReplaceCannedResponsesBody) =>
      replaceCannedResponses(websiteId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatSettingsKeys.website(websiteId) });
    },
  });
}

export function useQaRosterQuery(websiteId: string, enabled = true) {
  return useQuery({
    queryKey: chatSettingsKeys.qaRoster(websiteId),
    queryFn: () => fetchQaWebsiteRoster(websiteId),
    enabled: Boolean(websiteId) && enabled,
  });
}

export function useSaveQaRosterMutation(websiteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userIds: string[]) => saveQaWebsiteRoster(websiteId, userIds),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatSettingsKeys.qaRoster(websiteId) });
    },
  });
}
