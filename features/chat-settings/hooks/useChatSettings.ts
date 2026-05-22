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
import { LIST_ALL_QUERY } from "@/lib/constants/pagination";
import {
  parseDepartmentCatalog,
  parseDepartmentOptions,
  parsePoolOptions,
  type DepartmentCatalogOption,
} from "../utils/catalog";
import { chatSettingsKeys } from "./keys";

export function useWebsiteChatSettingsQuery(websiteId: string, apiEnabled = true) {
  return useQuery({
    queryKey: chatSettingsKeys.website(websiteId),
    queryFn: () => fetchWebsiteChatSettings(websiteId),
    enabled: apiEnabled && Boolean(websiteId?.trim()),
  });
}

export type DepartmentCatalogQueryParams = {
  parentCompanyId: string;
  /** Scopes external departments to this client; internal departments are reseller-wide (not parent-scoped). */
  resellerId?: string;
};

export function useDepartmentCatalogQuery(
  params: DepartmentCatalogQueryParams | string,
  enabled = true,
) {
  const parentCompanyId =
    typeof params === "string" ? params.trim() : params.parentCompanyId.trim();
  const resellerId =
    typeof params === "string" ? undefined : params.resellerId?.trim();

  return useQuery({
    queryKey: chatSettingsKeys.departments(parentCompanyId, resellerId),
    queryFn: async () => {
      const internalParams: Record<string, unknown> = {
        type: "Internal",
        ...LIST_ALL_QUERY,
      };
      if (resellerId) internalParams.resellerId = resellerId;

      const externalParams: Record<string, unknown> = {
        type: "External",
        parentCompanyId,
        ...LIST_ALL_QUERY,
      };
      if (resellerId) externalParams.resellerId = resellerId;

      const [internalRaw, externalRaw] = await Promise.all([
        listDepartments(internalParams),
        listDepartments(externalParams),
      ]);
      const internal = parseDepartmentCatalog(internalRaw).map((d) => ({
        ...d,
        departmentType: "Internal" as const,
      }));
      const external = parseDepartmentCatalog(externalRaw).map((d) => ({
        ...d,
        departmentType: "External" as const,
      }));
      const byId = new Map<string, DepartmentCatalogOption>();
      for (const d of [...internal, ...external]) {
        byId.set(d.id, d);
      }
      return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label));
    },
    enabled: Boolean(parentCompanyId) && enabled,
  });
}

/** Legacy flat list without department type — prefer `useDepartmentCatalogQuery`. */
export function useDepartmentOptionsQuery(parentCompanyId: string, enabled = true) {
  return useQuery({
    queryKey: [...chatSettingsKeys.departments(parentCompanyId), "options"] as const,
    queryFn: async () => {
      const raw = await listDepartments({
        parentCompanyId,
        ...LIST_ALL_QUERY,
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
        ...LIST_ALL_QUERY,
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
    mutationFn: (body: { internalUserIds: string[]; externalUserIds: string[] }) =>
      saveQaWebsiteRoster(websiteId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: chatSettingsKeys.qaRoster(websiteId) });
    },
  });
}
