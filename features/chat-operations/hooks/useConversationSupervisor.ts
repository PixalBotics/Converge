"use client";

import { useCallback, useEffect, useState } from "react";
import {
  approveTakeoverRequest,
  createConversationWhisper,
  fetchConversationWhispers,
  fetchTakeoverRequests,
  rejectTakeoverRequest,
  requestConversationTakeover,
} from "@/services/chat/supervisor.api";
import type {
  ChatTakeoverRequest,
  ChatWhisper,
  RequestTakeoverBody,
} from "@/services/chat/supervisor.types";

export function useConversationSupervisor(conversationId: string | null, enabled: boolean) {
  const [whispers, setWhispers] = useState<ChatWhisper[]>([]);
  const [takeoverRequests, setTakeoverRequests] = useState<ChatTakeoverRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!conversationId || !enabled) {
      setWhispers([]);
      setTakeoverRequests([]);
      return;
    }
    setLoading(true);
    try {
      const [w, t] = await Promise.all([
        fetchConversationWhispers(conversationId),
        fetchTakeoverRequests(conversationId),
      ]);
      setWhispers(w);
      setTakeoverRequests(t);
    } catch {
      setWhispers([]);
      setTakeoverRequests([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId, enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const sendWhisper = useCallback(
    async (message: string) => {
      if (!conversationId) return;
      await createConversationWhisper(conversationId, { message });
      await refresh();
    },
    [conversationId, refresh],
  );

  const requestTakeover = useCallback(
    async (body: RequestTakeoverBody) => {
      if (!conversationId) return;
      await requestConversationTakeover(conversationId, body);
      await refresh();
    },
    [conversationId, refresh],
  );

  const approveTakeover = useCallback(
    async (requestId: string) => {
      if (!conversationId) return;
      await approveTakeoverRequest(conversationId, requestId);
      await refresh();
    },
    [conversationId, refresh],
  );

  const rejectTakeover = useCallback(
    async (requestId: string) => {
      if (!conversationId) return;
      await rejectTakeoverRequest(conversationId, requestId);
      await refresh();
    },
    [conversationId, refresh],
  );

  return {
    whispers,
    takeoverRequests,
    loading,
    refresh,
    sendWhisper,
    requestTakeover,
    approveTakeover,
    rejectTakeover,
  };
}
