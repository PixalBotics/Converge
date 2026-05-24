"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import { getAccessToken, postAgentAiSuggestion, formatAgentSuggestResponse } from "@/api";
import type { AgentAiAction } from "@/api/ai/agent-suggest.api";
import { useAuth, useResellerListScope } from "@/lib/auth";
import { DashboardCard, PermissionDeniedPanel, Typography } from "@/components/common";
import {
  buildChatLiveNavItems,
  needsChatScopeFilters,
  useChatApiGates,
} from "@/lib/permissions";
import { useNotificationsContext } from "@/lib/notifications/NotificationsContext";
import { useAgentChat } from "@/lib/hooks/chat/useAgentChat";
import { mergeSx } from "@/lib/mui/merge-sx";
import {
  ChatLivePageHeader,
  ChatScopeFiltersPanel,
  conversationMatchesScope,
  useChatScopeFilters,
} from "@/features/chat-shared";
import {
  chatLiveAgentStackSx,
  chatLivePageStackSx,
  chatLiveQueueStatPillSx,
} from "@/features/chat-shared/styles/chat-live.styles";
import type { AgentVisitorPresentation, ConversationSummary } from "@/services/chat/chat.types";
import { extractVisitorPresentation } from "@/services/chat/visitor-presentation";
import type { ChatQueueTab } from "./ChatQueueSidebar";
import { postAgentWebsiteAvailabilityCheck } from "@/services/chat/agent-inbox.api";
import type { AiChatMessage } from "../types/ai-chat";
import {
  getConversationAiState,
  getConversationDraft,
  patchConversationAiState,
  patchConversationDraft,
} from "../utils/conversation-scoped-state";
import { AgentWrapUpModal } from "./AgentWrapUpModal";
import { AgentDistributionPrompt } from "./AgentDistributionPrompt";
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
  const { user, hasOperational, hasPage, permissionsSyncing } = useAuth();
  const gates = useChatApiGates();
  const { canFilterByResellerId } = useResellerListScope();
  const notifications = useNotificationsContext();
  const searchParams = useSearchParams();
  const inboxAllowed = gates.agentInbox;
  const showScopeFilters = needsChatScopeFilters(hasOperational, canFilterByResellerId);
  const chatNavItems = useMemo(
    () => buildChatLiveNavItems(hasPage, hasOperational),
    [hasPage, hasOperational],
  );
  const accessToken = inboxAllowed ? getAccessToken() ?? "" : "";
  const scopeFilters = useChatScopeFilters(undefined, { apiEnabled: showScopeFilters });
  const conversationIdFromUrl = searchParams.get("conversationId")?.trim() ?? "";

  useEffect(() => {
    if (inboxAllowed) {
      void notifications?.markAllRead("chat");
    }
  }, [inboxAllowed, notifications]);

  const agentChat = useAgentChat({
    token: accessToken,
    agentId: user?.id,
    apiEnabled: inboxAllowed,
  });

  const [queueTab, setQueueTab] = useState<ChatQueueTab>("active");
  const [draftsByConversation, setDraftsByConversation] = useState<Record<string, string>>({});
  const [aiByConversation, setAiByConversation] = useState<
    Record<string, { messages: AiChatMessage[]; prompt: string; busy: boolean }>
  >({});
  const [fallbackWebsiteId, setFallbackWebsiteId] = useState("");
  const [availabilityHint, setAvailabilityHint] = useState<string | null>(null);

  useEffect(() => {
    if (!inboxAllowed || !conversationIdFromUrl) return;
    if (agentChat.selectedConversationId === conversationIdFromUrl) return;
    void agentChat.selectConversation(conversationIdFromUrl);
  }, [
    agentChat.selectConversation,
    agentChat.selectedConversationId,
    conversationIdFromUrl,
    inboxAllowed,
  ]);

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

  const filterByScope = useCallback(
    (rows: ConversationSummary[]) =>
      rows.filter((c) =>
        conversationMatchesScope(c, scopeFilters.filters, scopeFilters.websiteIdsInScope),
      ),
    [scopeFilters.filters, scopeFilters.websiteIdsInScope],
  );

  const activeFiltered = useMemo(
    () => (showScopeFilters ? filterByScope(agentChat.activeChats) : agentChat.activeChats),
    [agentChat.activeChats, filterByScope, showScopeFilters],
  );
  const waitingFiltered = useMemo(
    () => (showScopeFilters ? filterByScope(agentChat.waitingChats) : agentChat.waitingChats),
    [agentChat.waitingChats, filterByScope, showScopeFilters],
  );
  const closedFiltered = useMemo(
    () => (showScopeFilters ? filterByScope(agentChat.closedChats) : agentChat.closedChats),
    [agentChat.closedChats, filterByScope, showScopeFilters],
  );

  const list: ConversationSummary[] =
    queueTab === "active"
      ? activeFiltered
      : queueTab === "waiting"
        ? waitingFiltered
        : closedFiltered;

  const selectedSummary =
    [...agentChat.activeChats, ...agentChat.waitingChats, ...agentChat.closedChats].find(
      (c) => c.id === agentChat.selectedConversationId,
    ) ?? list.find((c) => c.id === agentChat.selectedConversationId);

  const visitorPresentation: AgentVisitorPresentation | null = selectedSummary
    ? extractVisitorPresentation(selectedSummary)
    : null;
  const conversationMeta =
    selectedSummary && typeof selectedSummary === "object"
      ? (selectedSummary as Record<string, unknown>)
      : null;
  const assignedAgentLabel = user?.displayName?.trim() || user?.email?.trim() || "You";
  const assignedAgentId =
    typeof selectedSummary?.assignedAgentId === "string"
      ? selectedSummary.assignedAgentId
      : null;
  const websiteIdEffective =
    (typeof selectedSummary?.websiteId === "string" ? selectedSummary.websiteId : "").trim() ||
    fallbackWebsiteId.trim() ||
    "";
  const departmentIdEffective =
    (
      typeof selectedSummary?.departmentId === "string"
        ? selectedSummary.departmentId
        : typeof conversationMeta?.departmentId === "string"
          ? conversationMeta.departmentId
          : ""
    ).trim() || null;

  useEffect(() => {
    if (!inboxAllowed || !accessToken || !websiteIdEffective.trim()) {
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
  }, [inboxAllowed, accessToken, websiteIdEffective]);

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
    void agentChat.selectConversation(id, { readOnly: queueTab === "closed" });
  };

  if (permissionsSyncing) {
    return (
      <Box sx={chatOpsPageWrapper}>
        <Typography sx={{ py: 4, color: "text.secondary" }}>Loading permissions…</Typography>
      </Box>
    );
  }

  if (!inboxAllowed) {
    return (
      <Box sx={chatOpsPageWrapper}>
        <PermissionDeniedPanel
          title="Agent inbox not available"
          description="Requires page:chat and chat:access on GET /auth/me (from a chat bundle on the role). Sign out and back in after role changes."
        />
      </Box>
    );
  }

  const canPickWaiting = !agentChat.atActiveCap;
  const distributionFormHref =
    agentChat.pendingWrapUp?.requiresDistributionForm &&
    agentChat.selectedConversationId &&
    agentChat.pendingWrapUp.conversationId === agentChat.selectedConversationId
      ? agentChat.pendingWrapUp.distributionFormPath ??
        `/dashboard/chat-operations/distribution?conversationId=${encodeURIComponent(agentChat.selectedConversationId)}`
      : null;

  const canSend =
    Boolean(agentChat.selectedConversationId && accessToken) &&
    !agentChat.selectedIsClosed;

  return (
    <Box sx={mergeSx(chatOpsPageWrapper, showScopeFilters ? chatLivePageStackSx : chatLiveAgentStackSx)}>
      <ChatLivePageHeader
        title="Agent inbox"
        subtitle={
          showScopeFilters
            ? "Reply to visitors in your scoped queue. Use filters to narrow by organization or website."
            : "Your assigned queue — reply, insert canned responses, and wrap up when required."
        }
        navItems={chatNavItems}
        trailing={
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, justifyContent: "flex-end" }}>
            <Box sx={chatLiveQueueStatPillSx("active")}>Active {activeFiltered.length}</Box>
            <Box sx={chatLiveQueueStatPillSx("waiting")}>Waiting {waitingFiltered.length}</Box>
            <Box sx={chatLiveQueueStatPillSx("closed")}>Closed {closedFiltered.length}</Box>
          </Box>
        }
      />
      {showScopeFilters ? (
        <DashboardCard sx={{ flexShrink: 0, p: { xs: 1.5, md: 2 }, height: "auto", minHeight: 0 }}>
          <ChatScopeFiltersPanel
            filters={scopeFilters.filters}
            onPatch={scopeFilters.patchFilters}
            onReset={scopeFilters.resetFilters}
            canFilterByResellerId={scopeFilters.canFilterByResellerId}
            resellerOptions={scopeFilters.resellerOptions}
            parentCompanyOptions={scopeFilters.parentCompanyOptions}
            childCompanyOptions={scopeFilters.childCompanyOptions}
            websiteOptions={scopeFilters.websiteOptions}
            hint="Supervisors and leads: narrow the queue by reseller, company, or website."
          />
        </DashboardCard>
      ) : null}
      <Box sx={chatOpsWorkspaceShell}>
        <Box sx={chatOpsWorkspaceGrid}>
          <Box data-chat-pane="inbox">
            <ChatQueueSidebar
              queueTab={queueTab}
              onQueueTabChange={setQueueTab}
              conversations={list}
              selectedConversationId={agentChat.selectedConversationId}
              onSelectConversation={handleSelectConversation}
              activeCount={activeFiltered.length}
              waitingCount={waitingFiltered.length}
              closedCount={closedFiltered.length}
              connected={agentChat.isConnected}
              hasToken={Boolean(accessToken)}
              atActiveCap={agentChat.atActiveCap}
              canPickWaiting={canPickWaiting}
            />
          </Box>

          <Box data-chat-pane="thread">
            <ChatConversationPanel
              conversationId={agentChat.selectedConversationId}
              messages={agentChat.messages}
              visitor={agentChat.visitorFromHistory}
              conversationMeta={conversationMeta}
              visitorPresentation={visitorPresentation}
              readOnly={agentChat.selectedIsClosed}
              assignedAgentLabel={assignedAgentLabel}
              visitorTyping={agentChat.visitorTypingSelected && !agentChat.selectedIsClosed}
              composer={composer}
              onComposerChange={setComposer}
              onSend={() => void sendNow()}
              onTyping={agentChat.emitTyping}
              onStopTyping={agentChat.emitStopTyping}
              onInsertCanned={pushCannedToComposer}
              onCloseChat={
                agentChat.selectedIsClosed
                  ? undefined
                  : () => void agentChat.closeSelectedConversation()
              }
              canSend={canSend}
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
              websiteId={websiteIdEffective || null}
              departmentId={departmentIdEffective}
              activeWhisper={agentChat.activeWhisper}
              onApplyWhisperToComposer={applyAiToComposer}
              onDismissWhisper={agentChat.dismissWhisper}
              distributionFormHref={distributionFormHref}
              distributionSubmitted={Boolean(agentChat.pendingWrapUp?.distributionSubmitted)}
            />
          </Box>

          <Box data-chat-pane="details">
            <VisitorInfoPanel
              visitor={agentChat.visitorFromHistory}
              conversationId={agentChat.selectedConversationId}
              conversationMeta={conversationMeta}
              visitorPresentation={visitorPresentation}
              assignedAgentId={assignedAgentId}
              currentUserId={user?.id}
              hasOperational={hasOperational}
              supervisorRefreshToken={agentChat.supervisorRefreshToken}
              supervisorReadOnly={agentChat.selectedIsClosed}
              showWebsiteFallback={Boolean(
                agentChat.selectedConversationId && !selectedSummary?.websiteId,
              )}
              fallbackWebsiteId={fallbackWebsiteId}
              onFallbackWebsiteIdChange={setFallbackWebsiteId}
            />
          </Box>
        </Box>
      </Box>

      {agentChat.pendingWrapUp?.requiresDistributionForm ? (
        <AgentDistributionPrompt
          payload={agentChat.pendingWrapUp}
          onDismiss={agentChat.dismissWrapUp}
        />
      ) : (
        <AgentWrapUpModal
          open={Boolean(agentChat.pendingWrapUp)}
          payload={agentChat.pendingWrapUp}
          onClose={agentChat.dismissWrapUp}
          onSubmitted={() => {
            agentChat.dismissWrapUp();
            void agentChat.refreshQueues();
          }}
        />
      )}
    </Box>
  );
}
