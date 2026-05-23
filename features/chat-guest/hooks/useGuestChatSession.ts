"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearGuestSession,
  guestSessionFromExchange,
  loadGuestSession,
  saveGuestSession,
  type StoredGuestSession,
} from "@/lib/chat/guest-session";
import { exchangeGuestLinkToken, getGuestTranscript } from "@/services/chat/guest.api";
import type { ChatMessage } from "@/services/chat/chat.types";
import type { GuestTranscriptResponse } from "@/services/chat/guest.types";

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
  const [phase, setPhase] = useState<GuestChatPhase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<StoredGuestSession | null>(null);
  const [transcript, setTranscript] = useState<GuestTranscriptResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTranscript = useCallback(async (s: StoredGuestSession) => {
    if (!s.permissions.viewTranscript) {
      setPhase("no_access");
      setError("This guest link does not include transcript access.");
      return;
    }
    const data = await getGuestTranscript(s.conversationId, s.accessToken);
    setTranscript(data);
    setMessages(data.messages ?? []);
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
