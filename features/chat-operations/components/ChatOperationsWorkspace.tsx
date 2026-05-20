"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { getAccessToken, postAgentAiSuggestion, formatAgentSuggestResponse } from "@/api";
import type { AgentAiAction } from "@/api/ai/agent-suggest.api";
import { useAuth } from "@/lib/auth";
import { useAgentChat } from "@/lib/hooks/chat/useAgentChat";
import type { ConversationSummary } from "@/services/chat/chat.types";
import { postAgentWebsiteAvailabilityCheck } from "@/services/chat/chatApi";
import type { AiChatMessage } from "../types/ai-chat";
import {
  getConversationAiState,
  getConversationDraft,
  patchConversationAiState,
  patchConversationDraft,
} from "../utils/conversation-scoped-state";
import { ChatConversationPanel } from "./ChatConversationPanel";
import { ChatQueueSidebar } from "./ChatQueueSidebar";
import { VisitorInfoPanel } from "./VisitorInfoPanel";
import {
  chatOpsPageWrapper,
  chatOpsWorkspaceGrid,
  chatOpsWorkspaceShell,
} from "../styles/chat-operations.styles";

function needsWebsite(action: AgentAiAction): boolean {
  return (
    action === "suggested_reply" ||
    action === "knowledge_lookup" ||
    action === "coach_reply" ||
    action === "rewrite_tone"
  );
}

export function ChatOperationsWorkspace() {
  const { user } = useAuth();
  const accessToken = getAccessToken() ?? "";

  const agentChat = useAgentChat({
    token: accessToken,
    agentId: user?.id,
  });

  const [queueTab, setQueueTab] = useState<"active" | "waiting">("active");
  const [draftsByConversation, setDraftsByConversation] = useState<Record<string, string>>({});
  const [aiByConversation, setAiByConversation] = useState<
    Record<string, { messages: AiChatMessage[]; prompt: string; busy: boolean }>
  >({});
  const [fallbackWebsiteId, setFallbackWebsiteId] = useState("");
  const [availabilityHint, setAvailabilityHint] = useState<string | null>(null);

  const composer = getConversationDraft(
    draftsByConversation,
    agentChat.selectedConversationId,
  );
  const aiState = getConversationAiState(
    aiByConversation,
    agentChat.selectedConversationId,
  );
  const aiMessages = aiState.messages;
  const aiPrompt = aiState.prompt;
  const aiBusy = aiState.busy;

  const list: ConversationSummary[] =
    queueTab === "active" ? agentChat.activeChats : agentChat.waitingChats;

  const selectedSummary = list.find((c) => c.id === agentChat.selectedConversationId);
  const conversationMeta =
    selectedSummary && typeof selectedSummary === "object"
      ? (selectedSummary as Record<string, unknown>)
      : null;
  const assignedAgentLabel = user?.displayName?.trim() || user?.email?.trim() || "You";
  const websiteIdEffective =
    (typeof selectedSummary?.websiteId === "string" ? selectedSummary.websiteId : "").trim() ||
    fallbackWebsiteId.trim() ||
    "";

  useEffect(() => {
    if (!accessToken || !websiteIdEffective.trim()) {
      setAvailabilityHint(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await postAgentWebsiteAvailabilityCheck(
          websiteIdEffective.trim(),
          accessToken,
        );
        if (cancelled) return;
        const text =
          typeof res === "string"
            ? res
            : res && typeof res === "object"
              ? JSON.stringify(res)
              : String(res);
        setAvailabilityHint(text.length > 120 ? `${text.slice(0, 120)}…` : text);
      } catch {
        if (!cancelled) setAvailabilityHint(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, websiteIdEffective]);

  const setComposer = useCallback(
    (value: string | ((prev: string) => string)) => {
      const id = agentChat.selectedConversationId;
      if (!id) return;
      setDraftsByConversation((prev) => patchConversationDraft(prev, id, value));
    },
    [agentChat.selectedConversationId],
  );

  const setAiPrompt = useCallback(
    (value: string) => {
      const id = agentChat.selectedConversationId;
      if (!id) return;
      setAiByConversation((prev) => patchConversationAiState(prev, id, { prompt: value }));
    },
    [agentChat.selectedConversationId],
  );

  const pushCannedToComposer = useCallback(
    (line: string) => {
      const id = agentChat.selectedConversationId;
      if (!id) return;
      setDraftsByConversation((prev) =>
        patchConversationDraft(prev, id, (current) => (current ? `${current} ${line}` : line)),
      );
    },
    [agentChat.selectedConversationId],
  );

  const applyAiToComposer = useCallback(
    (text: string) => {
      const id = agentChat.selectedConversationId;
      if (!id) return;
      const trimmed = text.trim();
      if (!trimmed) return;
      setDraftsByConversation((prev) =>
        patchConversationDraft(prev, id, (current) =>
          current ? `${current}\n\n${trimmed}` : trimmed,
        ),
      );
    },
    [agentChat.selectedConversationId],
  );

  const sendAiPrompt = useCallback(
    async (prompt: string, action: AgentAiAction = "coach_reply") => {
      const conversationId = agentChat.selectedConversationId;
      if (!accessToken || !conversationId) return;
      if (needsWebsite(action) && !websiteIdEffective.trim()) return;

      const userId = `ai-u-${Date.now()}`;
      const pendingId = `ai-a-${Date.now()}`;
      const draftContext = getConversationDraft(draftsByConversation, conversationId).trim();

      setAiByConversation((prev) => {
        const current = getConversationAiState(prev, conversationId);
        return patchConversationAiState(prev, conversationId, {
          prompt: "",
          busy: true,
          messages: [
            ...current.messages,
            { id: userId, role: "user", content: prompt, action },
            { id: pendingId, role: "assistant", content: "", pending: true },
          ],
        });
      });

      try {
        const input =
          draftContext.length > 0
            ? `${prompt}\n\n---\nDraft reply:\n${draftContext}`
            : prompt;

        const data = await postAgentAiSuggestion({
          action,
          input,
          conversationId,
          ...(websiteIdEffective.trim() ? { websiteId: websiteIdEffective.trim() } : {}),
          ...(action === "rewrite_tone" ? { tone: "professional" } : {}),
        });

        const reply = formatAgentSuggestResponse(data);
        setAiByConversation((prev) => {
          const current = getConversationAiState(prev, conversationId);
          return patchConversationAiState(prev, conversationId, {
            busy: false,
            messages: current.messages.map((m) =>
              m.id === pendingId ? { ...m, content: reply, pending: false } : m,
            ),
          });
        });
      } catch {
        setAiByConversation((prev) => {
          const current = getConversationAiState(prev, conversationId);
          return patchConversationAiState(prev, conversationId, {
            busy: false,
            messages: current.messages.map((m) =>
              m.id === pendingId
                ? { ...m, content: "Assistant request failed. Try again.", pending: false }
                : m,
            ),
          });
        });
      }
    },
    [accessToken, agentChat.selectedConversationId, draftsByConversation, websiteIdEffective],
  );

  const sendNow = async () => {
    const id = agentChat.selectedConversationId;
    if (!id) return;
    await agentChat.sendMessage(composer.trim());
    setDraftsByConversation((prev) => patchConversationDraft(prev, id, ""));
  };

  const handleSelectConversation = (id: string) => {
    void agentChat.selectConversation(id);
  };

  const activeCount = agentChat.activeChats.length;
  const waitingCount = agentChat.waitingChats.length;

  return (
    <Box sx={chatOpsPageWrapper}>
      <Box sx={chatOpsWorkspaceShell}>
        <Box sx={chatOpsWorkspaceGrid}>
          <Box data-chat-pane="inbox">
            <ChatQueueSidebar
              queueTab={queueTab}
              onQueueTabChange={setQueueTab}
              conversations={list}
              selectedConversationId={agentChat.selectedConversationId}
              onSelectConversation={handleSelectConversation}
              activeCount={activeCount}
              waitingCount={waitingCount}
              connected={agentChat.isConnected}
              hasToken={Boolean(accessToken)}
            />
          </Box>

          <Box data-chat-pane="thread">
            <ChatConversationPanel
              conversationId={agentChat.selectedConversationId}
              messages={agentChat.messages}
              visitor={agentChat.visitorFromHistory}
              conversationMeta={conversationMeta}
              assignedAgentLabel={assignedAgentLabel}
              visitorTyping={agentChat.visitorTypingSelected}
              composer={composer}
              onComposerChange={setComposer}
              onSend={() => void sendNow()}
              onTyping={agentChat.emitTyping}
              onStopTyping={agentChat.emitStopTyping}
              onInsertCanned={pushCannedToComposer}
              onCloseChat={() => void agentChat.closeSelectedConversation()}
              canSend={Boolean(agentChat.selectedConversationId && accessToken)}
              aiMessages={aiMessages}
              aiPrompt={aiPrompt}
              onAiPromptChange={setAiPrompt}
              onSendAiPrompt={(prompt, action) => void sendAiPrompt(prompt, action)}
              onApplyAiToComposer={applyAiToComposer}
              aiBusy={aiBusy}
              websiteRequiredDisabled={!websiteIdEffective.trim()}
              availabilityHint={
                availabilityHint && websiteIdEffective ? availabilityHint : null
              }
            />
          </Box>

          <Box data-chat-pane="details">
            <VisitorInfoPanel
              visitor={agentChat.visitorFromHistory}
              conversationId={agentChat.selectedConversationId}
              conversationMeta={conversationMeta}
              showWebsiteFallback={Boolean(
                agentChat.selectedConversationId && !selectedSummary?.websiteId,
              )}
              fallbackWebsiteId={fallbackWebsiteId}
              onFallbackWebsiteIdChange={setFallbackWebsiteId}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
