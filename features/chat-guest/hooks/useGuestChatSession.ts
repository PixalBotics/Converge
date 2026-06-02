"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clearGuestSession,
  guestSessionFromExchange,
  loadGuestSession,
  saveGuestSession,
  type StoredGuestSession,
} from "@/lib/chat/guest-session";
import { exchangeGuestLinkToken, getGuestTranscript } from "@/services/chat/guest.api";
import { createChatSocketClient } from "@/services/chat/chatSocket";
import type { ChatMessage } from "@/services/chat/chat.types";
import type { GuestTranscriptResponse } from "@/services/chat/guest.types";
import {
  CHAT_DISCONNECTED_SYNC_MS,
  normalizeSocketMessage,
  scheduleJoinRoomRetries,
} from "@/lib/hooks/chat/chat-socket-delivery";

export type GuestChatPhase = "loading" | "ready" | "error" | "no_access";

function errorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const data = (err as { response?: { data?: { message?: string | string[] } } }).response?.data;
    const msg = data?.message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg) && msg[0]) return String(msg[0]);
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function useGuestChatSession(emailToken: string | null) {
  const socketClient = useMemo(() => createChatSocketClient(), []);
  const [phase, setPhase] = useState<GuestChatPhase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<StoredGuestSession | null>(null);
  const [transcript, setTranscript] = useState<GuestTranscriptResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messageMapRef = useRef(new Map<string, ChatMessage>());
  const connectedTokenRef = useRef<string | null>(null);

  const upsertMessage = useCallback((message: ChatMessage) => {
    const stableKey =
      (typeof message.id === "string" && message.id.trim()) ||
      `${message.conversationId}:${message.role}:${message.createdAt ?? ""}:${message.content}`;
    messageMapRef.current.set(stableKey, message);
    const sorted = Array.from(messageMapRef.current.values()).sort((a, b) =>
      String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? "")),
    );
    setMessages(sorted);
  }, []);

  const loadTranscript = useCallback(async (s: StoredGuestSession) => {
    if (!s.permissions.viewTranscript) {
      setPhase("no_access");
      setError("This guest link does not include transcript access.");
      return;
    }
    const data = await getGuestTranscript(s.conversationId, s.accessToken);
    setTranscript(data);
    messageMapRef.current.clear();
    for (const msg of data.messages ?? []) {
      const stableKey =
        (typeof msg.id === "string" && msg.id.trim()) ||
        `${msg.conversationId}:${msg.role}:${msg.createdAt ?? ""}:${msg.content}`;
      messageMapRef.current.set(stableKey, msg);
    }
    setMessages(Array.from(messageMapRef.current.values()));
    setPhase("ready");
  }, []);

  const bootstrap = useCallback(async () => {
    setPhase("loading");
    setError(null);

    try {
      if (emailToken?.trim()) {
        const exchanged = await exchangeGuestLinkToken(emailToken.trim());
        const stored = guestSessionFromExchange(exchanged);
        saveGuestSession(stored);
        setSession(stored);
        await loadTranscript(stored);
        return;
      }

      const stored = loadGuestSession();
      if (!stored) {
        setPhase("error");
        setError("Open the secure link from your email to view this chat.");
        return;
      }

      setSession(stored);
      await loadTranscript(stored);
    } catch (err) {
      const stored = loadGuestSession();
      if (!emailToken?.trim() && stored) {
        try {
          setSession(stored);
          await loadTranscript(stored);
          return;
        } catch {
          clearGuestSession();
        }
      }
      setPhase("error");
      setError(
        errorMessage(
          err,
          "This guest link is invalid, expired, or was already used. Request a new link from your team.",
        ),
      );
    }
  }, [emailToken, loadTranscript]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (!session || phase !== "ready" || !session.permissions.viewTranscript) {
      return;
    }

    const tokenChanged = connectedTokenRef.current !== session.accessToken;
    if (tokenChanged) {
      connectedTokenRef.current = session.accessToken;
      socketClient.connect({ authToken: session.accessToken, forceNew: true });
    } else {
      socketClient.connect({ authToken: session.accessToken });
    }

    let clearJoinRetries: (() => void) | undefined;
    const joinRoomWithRetries = () => {
      socketClient.joinRoom({ conversationId: session.conversationId });
      clearJoinRetries?.();
      clearJoinRetries = scheduleJoinRoomRetries(
        (cid) => socketClient.joinRoom({ conversationId: cid }),
        session.conversationId,
        () => phase === "ready",
      );
    };

    joinRoomWithRetries();
    setIsConnected(socketClient.isConnected());

    const deliverSocketMessage = (payload: unknown) => {
      const normalized = normalizeSocketMessage(payload, session.conversationId);
      if (!normalized) return;
      if (normalized.conversationId !== session.conversationId) return;
      upsertMessage(normalized);
    };

    const offSocketConnect = socketClient.onSocketConnect(() => {
      setIsConnected(true);
      joinRoomWithRetries();
    });
    const offSocketDisconnect = socketClient.onSocketDisconnect(() => {
      setIsConnected(false);
    });
    const offConnected = socketClient.onConnected(() => {
      setIsConnected(true);
      joinRoomWithRetries();
    });

    const offVisitorMessage = socketClient.onVisitorMessageRaw((payload) => {
      deliverSocketMessage(payload);
    });
    const offAgentMessage = socketClient.onAgentMessageRaw((payload) => {
      deliverSocketMessage(payload);
    });
    const offAiMessage = socketClient.onAiMessageRaw((payload) => {
      deliverSocketMessage(payload);
    });
    const offMonitorLive = socketClient.onMonitorLiveUpdate((update) => {
      const event = String(update.event ?? "").toLowerCase();
      if (
        event !== "visitor_message" &&
        event !== "agent_message" &&
        event !== "ai_message" &&
        !event.includes("message")
      ) {
        return;
      }
      const payload =
        update.payload && typeof update.payload === "object"
          ? {
              ...(update.payload as Record<string, unknown>),
              conversationId:
                (update.payload as { conversationId?: string }).conversationId ??
                update.conversationId,
            }
          : update.payload;
      deliverSocketMessage(payload);
    });
    const offChatClosed = socketClient.onChatClosed((payload) => {
      const sameConversation =
        typeof payload === "object" &&
        payload !== null &&
        (payload as { conversationId?: string }).conversationId === session.conversationId;
      if (!sameConversation) return;
      setTranscript((prev) =>
        prev ? { ...prev, chatCompleted: true, status: "closed" } : prev,
      );
    });
    const offChatCompleted = socketClient.onChatCompleted((payload) => {
      const sameConversation =
        typeof payload === "object" &&
        payload !== null &&
        (payload as { conversationId?: string }).conversationId === session.conversationId;
      if (!sameConversation) return;
      setTranscript((prev) =>
        prev ? { ...prev, chatCompleted: true, status: "closed" } : prev,
      );
    });

    return () => {
      clearJoinRetries?.();
      offSocketConnect();
      offSocketDisconnect();
      offConnected();
      offVisitorMessage();
      offAgentMessage();
      offAiMessage();
      offMonitorLive();
      offChatClosed();
      offChatCompleted();
      socketClient.leaveRoom({ conversationId: session.conversationId });
    };
  }, [phase, session, socketClient, upsertMessage]);

  useEffect(() => {
    if (!session || phase !== "ready" || isConnected) return;
    const poll = window.setInterval(() => {
      void loadTranscript(session);
    }, CHAT_DISCONNECTED_SYNC_MS);
    return () => window.clearInterval(poll);
  }, [isConnected, loadTranscript, phase, session]);

  const refreshTranscript = useCallback(async () => {
    if (!session) return;
    setRefreshing(true);
    try {
      await loadTranscript(session);
    } catch (err) {
      setError(errorMessage(err, "Could not refresh transcript."));
    } finally {
      setRefreshing(false);
    }
  }, [loadTranscript, session]);

  const signOutGuest = useCallback(() => {
    clearGuestSession();
    setSession(null);
    setTranscript(null);
    setMessages([]);
    setPhase("error");
    setError("Session ended. Use your email link again to reconnect.");
  }, []);

  return {
    phase,
    error,
    session,
    transcript,
    messages,
    refreshing,
    refreshTranscript,
    signOutGuest,
  };
}
