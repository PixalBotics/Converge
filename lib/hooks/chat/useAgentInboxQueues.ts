"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { subscribeAgentInboxRefresh } from "./agent-inbox-refresh-bus";
import { MAX_ACTIVE_CHATS_PER_AGENT } from "@/services/chat/chat.constants";
import {
  getMyActiveChats,
  getMyClosedChats,
  getWaitingChats,
} from "@/services/chat/agent-inbox.api";
import type { ConversationSummary } from "@/services/chat/chat.types";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";

function inboxRefreshFailureMessage(error: unknown): string {
  if (axios.isAxiosError(error) && !error.response) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "API";
    return `Cannot reach the API at ${base}. Start the Nest backend (Convergit_saas) and ensure its port matches NEXT_PUBLIC_API_BASE_URL — often http://localhost:3001 while Next.js uses 3000.`;
  }
  return (
    extractApiErrorMessageForToast(error, "Could not refresh agent inbox.") ??
    "Could not refresh agent inbox."
  );
}

export interface AgentInboxQueuesState {
  activeChats: ConversationSummary[];
  waitingChats: ConversationSummary[];
  closedChats: ConversationSummary[];
  atActiveCap: boolean;
  refreshQueues: () => Promise<void>;
}

export function useAgentInboxQueues(token: string, apiEnabled = true): AgentInboxQueuesState {
  const [activeChats, setActiveChats] = useState<ConversationSummary[]>([]);
  const [waitingChats, setWaitingChats] = useState<ConversationSummary[]>([]);
  const [closedChats, setClosedChats] = useState<ConversationSummary[]>([]);
  const lastToastAtRef = useRef(0);

  const refreshQueues = useCallback(async () => {
    if (!apiEnabled || !token) {
      setActiveChats([]);
      setWaitingChats([]);
      setClosedChats([]);
      return;
    }

    const [activeResult, waitingResult, closedResult] = await Promise.allSettled([
      getMyActiveChats(token),
      getWaitingChats(token),
      getMyClosedChats(token),
    ]);

    const failures: unknown[] = [];
    if (activeResult.status === "fulfilled") {
      setActiveChats(activeResult.value);
    } else {
      failures.push(activeResult.reason);
      setActiveChats([]);
    }
    if (waitingResult.status === "fulfilled") {
      setWaitingChats(waitingResult.value);
    } else {
      failures.push(waitingResult.reason);
      setWaitingChats([]);
    }
    if (closedResult.status === "fulfilled") {
      setClosedChats(closedResult.value);
    } else {
      failures.push(closedResult.reason);
      setClosedChats([]);
    }

    if (failures.length) {
      const now = Date.now();
      if (now - lastToastAtRef.current > 8000) {
        lastToastAtRef.current = now;
        publishAppToast({
          variant: "error",
          message: inboxRefreshFailureMessage(failures[0]),
        });
      }
    }
  }, [apiEnabled, token]);

  const atActiveCap = activeChats.length >= MAX_ACTIVE_CHATS_PER_AGENT;

  useEffect(() => {
    if (!apiEnabled) {
      setActiveChats([]);
      setWaitingChats([]);
      setClosedChats([]);
      return;
    }
    void refreshQueues();
  }, [apiEnabled, refreshQueues]);

  useEffect(() => {
    if (!apiEnabled || !token) return undefined;
    return subscribeAgentInboxRefresh(() => {
      void refreshQueues();
    });
  }, [apiEnabled, refreshQueues, token]);

  return {
    activeChats,
    waitingChats,
    closedChats,
    atActiveCap,
    refreshQueues,
  };
}
