"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/api";
import { normalizeConversationHistoryPayload } from "@/services/chat/conversation-normalizers";
import {
  assignQaReview,
  fetchQaMyQueue,
  fetchQaReviewBundle,
  upsertQaMessageAnnotation,
  upsertQaSessionReview,
} from "@/services/chat/qa.api";
import type {
  MessageQaAnnotation,
  QaQueueFilters,
  QaReviewStatus,
  UpsertQaMessageAnnotationBody,
  UpsertQaSessionReviewBody,
} from "@/services/chat/qa.types";
import type { ChatMessage } from "@/services/chat/chat.types";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { useChatQaSocket } from "@/lib/hooks/chat/useChatQaSocket";
import { chatQaKeys } from "./keys";

export type QaStatusTab = QaReviewStatus | "all";

export function useChatQa(
  initialConversationId?: string | null,
  options?: { apiEnabled?: boolean },
) {
  const apiEnabled = options?.apiEnabled !== false;
  const token = apiEnabled ? getAccessToken() ?? "" : "";
  const queryClient = useQueryClient();

  const [statusTab, setStatusTab] = useState<QaStatusTab>("pending");
  const [filters, setFilters] = useState<QaQueueFilters>({});
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    initialConversationId ?? null,
  );
  const [bundleLoading, setBundleLoading] = useState(false);
  const [bundleError, setBundleError] = useState<string | null>(null);

  const queueFilters = useMemo((): QaQueueFilters => {
    const next = { ...filters };
    if (statusTab !== "all") next.status = statusTab;
    else delete next.status;
    return next;
  }, [filters, statusTab]);

  const queueQuery = useQuery({
    queryKey: chatQaKeys.queue(queueFilters),
    queryFn: () => fetchQaMyQueue(queueFilters, token),
    enabled: apiEnabled && Boolean(token),
  });

  const countFilters = useMemo((): QaQueueFilters => {
    const { status: _s, ...rest } = queueFilters;
    return rest;
  }, [queueFilters]);

  const countQuery = useQuery({
    queryKey: chatQaKeys.countQueue(countFilters),
    queryFn: () => fetchQaMyQueue(countFilters, token),
    enabled: apiEnabled && Boolean(token),
  });

  const bundleQuery = useQuery({
    queryKey: chatQaKeys.bundle(selectedConversationId ?? ""),
    queryFn: () => fetchQaReviewBundle(selectedConversationId!, token),
    enabled: apiEnabled && Boolean(token && selectedConversationId),
  });

  const messages: ChatMessage[] = useMemo(() => {
    const raw = bundleQuery.data?.transcript;
    if (!raw || !selectedConversationId) return [];
    const normalized = normalizeConversationHistoryPayload(raw, selectedConversationId);
    return normalized.messages;
  }, [bundleQuery.data?.transcript, selectedConversationId]);

  const annotationsByMessageId = useMemo(() => {
    const map = new Map<string, MessageQaAnnotation>();
    for (const a of bundleQuery.data?.annotations ?? []) {
      if (a.messageId) map.set(a.messageId, a);
    }
    return map;
  }, [bundleQuery.data?.annotations]);

  const visitorFromHistory = useMemo(() => {
    const v = bundleQuery.data?.transcript?.visitor;
    return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null;
  }, [bundleQuery.data?.transcript?.visitor]);

  const refreshQueue = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: chatQaKeys.all });
  }, [queryClient]);

  const refreshBundle = useCallback(() => {
    if (!selectedConversationId) return;
    void queryClient.invalidateQueries({
      queryKey: chatQaKeys.bundle(selectedConversationId),
    });
  }, [queryClient, selectedConversationId]);

  const refreshBundleForId = useCallback(
    (conversationId: string) => {
      void queryClient.invalidateQueries({
        queryKey: chatQaKeys.bundle(conversationId),
      });
    },
    [queryClient],
  );

  useChatQaSocket(token, apiEnabled && Boolean(token), refreshQueue, refreshBundleForId);

  const selectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
    setBundleError(null);
  }, []);

  useEffect(() => {
    if (initialConversationId) {
      setSelectedConversationId(initialConversationId);
    }
  }, [initialConversationId]);

  const saveSessionReview = useCallback(
    async (body: UpsertQaSessionReviewBody) => {
      if (!selectedConversationId || !token) return;
      setBundleLoading(true);
      try {
        await upsertQaSessionReview(selectedConversationId, body, token);
        refreshBundle();
        refreshQueue();
        publishAppToast({
          message:
            body.status === "completed"
              ? "QA report submitted."
              : body.status === "in_progress"
                ? "Review started."
                : "Review saved.",
          variant: "success",
        });
      } catch (err) {
        publishAppToast({
          message: extractApiErrorMessageForToast(err, "Could not save QA review."),
          variant: "error",
        });
        throw err;
      } finally {
        setBundleLoading(false);
      }
    },
    [refreshBundle, refreshQueue, selectedConversationId, token],
  );

  const saveMessageAnnotation = useCallback(
    async (messageId: string, body: UpsertQaMessageAnnotationBody) => {
      if (!token) return;
      setBundleLoading(true);
      try {
        await upsertQaMessageAnnotation(messageId, body, token);
        refreshBundle();
      } finally {
        setBundleLoading(false);
      }
    },
    [refreshBundle, token],
  );

  const claimReview = useCallback(async () => {
    if (!selectedConversationId || !token) return;
    setBundleLoading(true);
    try {
      await assignQaReview(selectedConversationId, {}, token);
      refreshBundle();
      refreshQueue();
      publishAppToast({ message: "Review assigned to you.", variant: "success" });
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err, "Could not take this review."),
        variant: "error",
      });
      throw err;
    } finally {
      setBundleLoading(false);
    }
  }, [refreshBundle, refreshQueue, selectedConversationId, token]);

  const assignReviewTo = useCallback(
    async (qaUserId: string) => {
      if (!selectedConversationId || !token || !qaUserId.trim()) return;
      setBundleLoading(true);
      try {
        await assignQaReview(selectedConversationId, { qaUserId: qaUserId.trim() }, token);
        refreshBundle();
        refreshQueue();
        publishAppToast({ message: "QA reviewer assigned.", variant: "success" });
      } catch (err) {
        publishAppToast({
          message: extractApiErrorMessageForToast(err, "Could not assign reviewer."),
          variant: "error",
        });
        throw err;
      } finally {
        setBundleLoading(false);
      }
    },
    [refreshBundle, refreshQueue, selectedConversationId, token],
  );

  const websiteOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of queueQuery.data ?? []) {
      const w = row.conversation?.website;
      if (w?.id) {
        map.set(w.id, w.name?.trim() || w.childCompany?.name?.trim() || w.id.slice(0, 8));
      }
    }
    return [...map.entries()].map(([id, label]) => ({ id, label }));
  }, [queueQuery.data]);

  return {
    token,
    statusTab,
    setStatusTab,
    filters,
    setFilters,
    queue: queueQuery.data ?? [],
    queueLoading: queueQuery.isLoading,
    queueError: queueQuery.error,
    refreshQueue,
    selectedConversationId,
    selectConversation,
    bundle: bundleQuery.data ?? null,
    bundleLoading: bundleQuery.isLoading || bundleLoading,
    bundleError: bundleQuery.error ? String(bundleQuery.error) : bundleError,
    messages,
    visitorFromHistory,
    annotationsByMessageId,
    saveSessionReview,
    saveMessageAnnotation,
    claimReview,
    assignReviewTo,
    refreshBundle,
    websiteOptions,
    statusCounts: {
      pending: (countQuery.data ?? []).filter((r) => r.status === "pending").length,
      in_progress: (countQuery.data ?? []).filter((r) => r.status === "in_progress").length,
      completed: (countQuery.data ?? []).filter((r) => r.status === "completed").length,
      all: countQuery.data?.length ?? 0,
    },
  };
}
