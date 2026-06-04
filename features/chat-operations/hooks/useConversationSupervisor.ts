"use client";

import { useCallback, useEffect, useState } from "react";
import { createConversationWhisper, fetchConversationWhispers } from "@/services/chat/supervisor.api";
import type { ChatWhisper } from "@/services/chat/supervisor.types";

export function useConversationSupervisor(conversationId: string | null, enabled: boolean) {
  const [whispers, setWhispers] = useState<ChatWhisper[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!conversationId || !enabled) {
      setWhispers([]);
      return;
    }
    setLoading(true);
    try {
      const w = await fetchConversationWhispers(conversationId);
      setWhispers(w);
    } catch {
      setWhispers([]);
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

  return {
    whispers,
    loading,
    refresh,
    sendWhisper,
  };
}
