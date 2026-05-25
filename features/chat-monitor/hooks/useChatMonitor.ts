"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/api";
import {
  conversationIdFromSocketPayload,
  sortMessagesChronologically,
  stableMessageDedupeKey,
} from "@/lib/hooks/chat/agent-chat.utils";
import { useAgentChatSocket } from "@/lib/hooks/chat/useAgentChatSocket";
import {
  fetchMonitorCapabilities,
  fetchMonitorClosed,
  fetchMonitorLive,
  fetchMonitorTranscript,
} from "@/services/chat/monitor.api";
import type { ChatMessage } from "@/services/chat/chat.types";
import type {
  MonitorConversationRow,
  MonitorListFilters,
  MonitorListTab,
} from "@/services/chat/monitor.types";
import { getSharedAgentChatSocket } from "@/services/chat/sharedAgentChatSocket";
import { chatMonitorKeys } from "./keys";

const LIVE_REFRESH_DEBOUNCE_MS = 350;

export function useChatMonitor(
  initialConversationId?: string | null,
  options?: { apiEnabled?: boolean },
) {
  const apiEnabled = options?.apiEnabled !== false;
  const token = apiEnabled ? getAccessToken() ?? "" : "";
  const queryClient = useQueryClient();
  const socketClient = useMemo(() => getSharedAgentChatSocket(), []);

  const [listTab, setListTab] = useState<MonitorListTab>("live");
  const [filters, setFilters] = useState<MonitorListFilters>({});
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    initialConversationId ?? null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [visitorFromHistory, setVisitorFromHistory] =
    useState<Record<string, unknown> | null>(null);
  const [supervisorControlUserId, setSupervisorControlUserId] = useState<string | null>(
    null,
  );
  const [isConnected, setIsConnected] = useState(false);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  const messageMapRef = useRef(new Map<string, ChatMessage>());
  const selectedIdRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    selectedIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const capabilitiesQuery = useQuery({
    queryKey: chatMonitorKeys.capabilities(),
    queryFn: fetchMonitorCapabilities,
    enabled: apiEnabled && Boolean(token),
  });

  const capabilitiesReady =
    apiEnabled && Boolean(token) && capabilitiesQuery.isSuccess && !capabilitiesQuery.isError;

  const liveQuery = useQuery({
    queryKey: chatMonitorKeys.live(filters),
    queryFn: () => fetchMonitorLive(filters),
    enabled: capabilitiesReady,
  });

  const closedQuery = useQuery({
    queryKey: chatMonitorKeys.closed(filters),
    queryFn: () => fetchMonitorClosed(filters),
    enabled: capabilitiesReady,
  });

  const liveList = liveQuery.data ?? [];
  const closedList = closedQuery.data ?? [];
  const list = listTab === "live" ? liveList : closedList;

  const invalidateLists = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: chatMonitorKeys.all });
  }, [queryClient]);

  const syncMessagesFromMap = useCallback(() => {
    setMessages(sortMessagesChronologically(Array.from(messageMapRef.current.values())));
  }, []);

  const loadTranscript = useCallback(
    async (conversationId: string, opts?: { silent?: boolean }) => {
      if (!apiEnabled || !token) return;
      if (!opts?.silent) {
        setTranscriptLoading(true);
        setTranscriptError(null);
      }
      try {
        const history = await fetchMonitorTranscript(conversationId);
        messageMapRef.current.clear();
        for (const msg of history.messages) {
          messageMapRef.current.set(stableMessageDedupeKey(msg), msg);
        }
        syncMessagesFromMap();
        const v = history.visitor;
        setVisitorFromHistory(
          typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null,
        );
        const sc = (history as { supervisorControlUserId?: string | null })
          .supervisorControlUserId;
        setSupervisorControlUserId(sc ?? null);
      } catch (err: unknown) {
        if (!opts?.silent) {
          const msg =
            err && typeof err === "object" && "message" in err
              ? String((err as { message: unknown }).message)
              : "Could not load transcript.";
          setTranscriptError(msg);
          messageMapRef.current.clear();
          syncMessagesFromMap();
          setVisitorFromHistory(null);
        }
      } finally {
        if (!opts?.silent) setTranscriptLoading(false);
      }
    },
    [apiEnabled, syncMessagesFromMap, token],
  );

  const scheduleListRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      refreshTimerRef.current = null;
      invalidateLists();
      const cid = selectedIdRef.current;
      if (cid) void loadTranscript(cid, { silent: true });
    }, LIVE_REFRESH_DEBOUNCE_MS);
  }, [invalidateLists, loadTranscript]);

  const upsertMessage = useCallback(
    (message: ChatMessage) => {
      messageMapRef.current.set(stableMessageDedupeKey(message), message);
      syncMessagesFromMap();
    },
    [syncMessagesFromMap],
  );

  const selectConversation = useCallback(
    async (conversationId: string) => {
      const prev = selectedIdRef.current;
      if (prev && prev !== conversationId) {
        socketClient.leaveRoom({ conversationId: prev });
      }
      setSelectedConversationId(conversationId);
      selectedIdRef.current = conversationId;
      socketClient.joinRoom({ conversationId });
      await loadTranscript(conversationId);
    },
    [loadTranscript, socketClient],
  );

  const clearSelection = useCallback(() => {
    const prev = selectedIdRef.current;
    if (prev) socketClient.leaveRoom({ conversationId: prev });
    setSelectedConversationId(null);
    selectedIdRef.current = null;
    messageMapRef.current.clear();
    setMessages([]);
    setVisitorFromHistory(null);
    setSupervisorControlUserId(null);
    setTranscriptError(null);
  }, [socketClient]);

  const initialAppliedRef = useRef(false);
  useEffect(() => {
    if (!apiEnabled || !initialConversationId || !token || initialAppliedRef.current) return;
    initialAppliedRef.current = true;
    void selectConversation(initialConversationId);
  }, [apiEnabled, initialConversationId, selectConversation, token]);

  const scheduleListRefreshRef = useRef(scheduleListRefresh);
  scheduleListRefreshRef.current = scheduleListRefresh;

  useAgentChatSocket(
    apiEnabled ? token : "",
    socketClient,
    {
      onVisitorMessage: upsertMessage,
      onRefreshQueues: () => scheduleListRefreshRef.current(),
      onSessionEnded: (payload) => {
        const endedId = conversationIdFromSocketPayload(payload);
        if (endedId && endedId === selectedIdRef.current) clearSelection();
        scheduleListRefreshRef.current();
      },
      onChatResumed: () => scheduleListRefreshRef.current(),
      onVisitorTyping: () => {},
      selectedConversationIdRef: selectedIdRef,
      selectedIsClosedRef: { current: false },
    },
    setIsConnected,
  );

  useEffect(() => {
    const socket = socketClient;
    const offMonitor = socket.onMonitorLiveUpdate(() => scheduleListRefreshRef.current());
    return () => {
      offMonitor();
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [socketClient]);

  const filterOptions = useMemo(() => {
    const rows = [...(liveQuery.data ?? []), ...(closedQuery.data ?? [])];
    const websites = new Map<string, string>();
    const departments = new Map<string, string>();
    const pools = new Map<string, string>();
    const statuses = new Set<string>();

    for (const row of rows) {
      statuses.add(row.status);
      if (row.websiteId) {
        websites.set(
          row.websiteId,
          row.visitorPresentation?.websiteName || row.websiteId.slice(0, 8),
        );
      }
      if (row.departmentId && row.department?.name) {
        departments.set(row.departmentId, row.department.name);
      }
      if (row.poolId && row.pool?.name) {
        pools.set(row.poolId, row.pool.name);
      }
    }

    return {
      websites: [...websites.entries()].map(([id, label]) => ({ id, label })),
      departments: [...departments.entries()].map(([id, label]) => ({ id, label })),
      pools: [...pools.entries()].map(([id, label]) => ({ id, label })),
      statuses: [...statuses].sort(),
    };
  }, [closedQuery.data, liveQuery.data]);

  const selectedRow: MonitorConversationRow | null =
    list.find((r) => r.id === selectedConversationId) ??
    [...(liveQuery.data ?? []), ...(closedQuery.data ?? [])].find(
      (r) => r.id === selectedConversationId,
    ) ??
    null;

  const listsLoading = liveQuery.isLoading || closedQuery.isFetching || closedQuery.isLoading;

  return {
    token,
    capabilities: capabilitiesQuery.data,
    capabilitiesLoading: capabilitiesQuery.isLoading,
    listTab,
    setListTab,
    filters,
    setFilters,
    filterOptions,
    list,
    liveList,
    closedList,
    listsLoading,
    listsError: liveQuery.isError || closedQuery.isError,
    liveCount: liveList.length,
    closedCount: closedList.length,
    selectedConversationId,
    selectedRow,
    messages,
    visitorFromHistory,
    supervisorControlUserId,
    transcriptLoading,
    transcriptError,
    isConnected,
    selectConversation,
    clearSelection,
    refreshLists: invalidateLists,
  };
}
