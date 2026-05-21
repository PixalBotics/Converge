"use client";

import { useCallback, useEffect, useState } from "react";
import { subscribeAgentInboxRefresh } from "./agent-inbox-refresh-bus";
import { MAX_ACTIVE_CHATS_PER_AGENT } from "@/services/chat/chat.constants";
import {
  getMyActiveChats,
  getMyClosedChats,
  getWaitingChats,
} from "@/services/chat/agent-inbox.api";
import type { ConversationSummary } from "@/services/chat/chat.types";

export interface AgentInboxQueuesState {
  activeChats: ConversationSummary[];
  waitingChats: ConversationSummary[];
  closedChats: ConversationSummary[];
  atActiveCap: boolean;
  refreshQueues: () => Promise<void>;
}

export function useAgentInboxQueues(token: string): AgentInboxQueuesState {
  const [activeChats, setActiveChats] = useState<ConversationSummary[]>([]);
  const [waitingChats, setWaitingChats] = useState<ConversationSummary[]>([]);
  const [closedChats, setClosedChats] = useState<ConversationSummary[]>([]);

  const refreshQueues = useCallback(async () => {
    if (!token) {
      setActiveChats([]);
      setWaitingChats([]);
      setClosedChats([]);
      return;
    }
    const [active, waiting, closed] = await Promise.all([
      getMyActiveChats(token),
      getWaitingChats(token),
      getMyClosedChats(token),
    ]);
    setActiveChats(active);
    setWaitingChats(waiting);
    setClosedChats(closed);
  }, [token]);

  const atActiveCap = activeChats.length >= MAX_ACTIVE_CHATS_PER_AGENT;

  useEffect(() => {
    void refreshQueues();
  }, [refreshQueues]);

  useEffect(() => {
    if (!token) return undefined;
    return subscribeAgentInboxRefresh(() => {
      void refreshQueues();
    });
  }, [refreshQueues, token]);

  return {
    activeChats,
    waitingChats,
    closedChats,
    atActiveCap,
    refreshQueues,
  };
}
