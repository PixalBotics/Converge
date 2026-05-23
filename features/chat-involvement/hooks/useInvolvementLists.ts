"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChatScopeListQuery } from "@/services/chat/involvement-list.types";
import {
  fetchInvolvementUsers,
  listInvolvementUsersInScope,
  saveInvolvementUsers,
} from "@/services/chat/involvement-roster.api";
import { listQaRosterInScope, saveQaWebsiteRoster, fetchQaWebsiteRoster } from "@/services/chat/qa-roster.api";

export const involvementListKeys = {
  all: ["involvement-list"] as const,
  scope: (q: ChatScopeListQuery) => [...involvementListKeys.all, "scope", q] as const,
  website: (websiteId: string) => [...involvementListKeys.all, "website", websiteId] as const,
};

export const qaRosterListKeys = {
  all: ["qa-roster-list"] as const,
  scope: (q: ChatScopeListQuery) => [...qaRosterListKeys.all, "scope", q] as const,
  website: (websiteId: string) => [...qaRosterListKeys.all, "website", websiteId] as const,
};

export function useInvolvementListQuery(query: ChatScopeListQuery, enabled = true) {
  return useQuery({
    queryKey: involvementListKeys.scope(query),
    queryFn: () => listInvolvementUsersInScope({ ...query, all: true }),
    enabled,
    staleTime: 30_000,
  });
}

export function useInvolvementWebsiteQuery(websiteId: string, enabled = true) {
  return useQuery({
    queryKey: involvementListKeys.website(websiteId),
    queryFn: () => fetchInvolvementUsers(websiteId),
    enabled: Boolean(websiteId.trim()) && enabled,
    staleTime: 30_000,
  });
}

export function useSaveInvolvementWebsiteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      websiteId,
      items,
    }: {
      websiteId: string;
      items: Array<{ departmentId: string; userId: string; sortOrder?: number }>;
    }) => saveInvolvementUsers(websiteId, { items }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: involvementListKeys.all });
    },
  });
}

export function useQaRosterListQuery(query: ChatScopeListQuery, enabled = true) {
  return useQuery({
    queryKey: qaRosterListKeys.scope(query),
    queryFn: () => listQaRosterInScope({ ...query, all: true }),
    enabled,
    staleTime: 30_000,
  });
}

export function useQaRosterWebsiteQuery(websiteId: string, enabled = true) {
  return useQuery({
    queryKey: qaRosterListKeys.website(websiteId),
    queryFn: () => fetchQaWebsiteRoster(websiteId),
    enabled: Boolean(websiteId.trim()) && enabled,
    staleTime: 30_000,
  });
}

export function useSaveQaRosterWebsiteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      websiteId,
      internalUserIds,
      externalUserIds,
    }: {
      websiteId: string;
      internalUserIds: string[];
      externalUserIds: string[];
    }) => saveQaWebsiteRoster(websiteId, { internalUserIds, externalUserIds }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qaRosterListKeys.all });
    },
  });
}
