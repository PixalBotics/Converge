"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import { getAccessToken, postAgentAiSuggestion, formatAgentSuggestResponse } from "@/api";
import type { AgentAiAction } from "@/api/ai/agent-suggest.api";
import { useAuth, useResellerListScope } from "@/lib/auth";
import { DashboardCard, PermissionDeniedPanel, Typography } from "@/components/common";
import {
  needsChatScopeFilters,
  useChatApiGates,
} from "@/lib/permissions";
import { useNotificationsContext } from "@/lib/notifications/NotificationsContext";
import { useAgentChat } from "@/lib/hooks/chat/useAgentChat";
import { mergeSx } from "@/lib/mui/merge-sx";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import {
  ChatLiveHubScopeCard,
  ChatLivePageHeader,
  ChatLivePageShell,
  ChatScopeFiltersPanel,
  ChatWebsiteAgentsTable,
  conversationMatchesScope,
  isUnassignedActiveChat,
  useChatScopeFilters,
  useChatWebsiteAgents,
  type ChatWebsiteAgentRow,
} from "@/features/chat-shared";
import { monitorRowsToConversationSummaries } from "@/features/chat-shared/utils/monitor-to-inbox-summary";
import { chatMonitorKeys } from "@/features/chat-monitor/hooks/keys";
import { useChatMonitor } from "@/features/chat-monitor/hooks/useChatMonitor";
import {
  chatLiveAgentStackSx,
  chatLiveQueueStatPillSx,
} from "@/features/chat-shared/styles/chat-live.styles";
import type { AgentVisitorPresentation, ConversationSummary } from "@/services/chat/chat.types";
import { extractVisitorPresentation } from "@/services/chat/visitor-presentation";
import type { ChatQueueTab } from "./ChatQueueSidebar";
import { postAgentWebsiteAvailabilityCheck } from "@/services/chat/agent-inbox.api";
import { fetchMonitorClosed, fetchMonitorLive } from "@/services/chat/monitor.api";
import type { AiChatMessage } from "../types/ai-chat";
import {
  getConversationAiState,
  getConversationDraft,
  patchConversationAiState,
  patchConversationDraft,
} from "../utils/conversation-scoped-state";
import { AgentWrapUpModal } from "./AgentWrapUpModal";
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
  const monitorApiEnabled = gates.monitor;
  const { canFilterByResellerId } = useResellerListScope();
  const notifications = useNotificationsContext();
  const searchParams = useSearchParams();
  const inboxAllowed = gates.agentInbox;
  const showScopeFilters = needsChatScopeFilters(hasOperational, canFilterByResellerId);
  const accessToken = inboxAllowed ? getAccessToken() ?? "" : "";
  const scopeFilters = useChatScopeFilters(undefined, { apiEnabled: showScopeFilters });
  const conversationIdFromUrl = searchParams.get("conversationId")?.trim() ?? "";

  const markAllChatNotificationsRead = notifications?.markAllRead;

  useEffect(() => {
    if (inboxAllowed && markAllChatNotificationsRead) {
      void markAllChatNotificationsRead("chat");
    }
  }, [inboxAllowed, markAllChatNotificationsRead]);

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
  const [teamAgent, setTeamAgent] = useState<ChatWebsiteAgentRow | null>(null);
  const [agentSearch, setAgentSearch] = useState("");
  const [teamView, setTeamView] = useState(showScopeFilters);

  const scopeMonitor = useChatMonitor(null, {
    apiEnabled: teamView && monitorApiEnabled,
  });
  const hubDepartmentOptions = useMemo(
    () => [
      { value: "", label: "All departments" },
      ...scopeMonitor.filterOptions.departments.map((d) => ({
        value: d.id,
        label: d.label,
      })),
    ],
    [scopeMonitor.filterOptions.departments],
  );
  const hubPoolOptions = useMemo(
    () => [
      { value: "", label: "All pools" },
      ...scopeMonitor.filterOptions.pools.map((p) => ({
        value: p.id,
        label: p.label,
      })),
    ],
    [scopeMonitor.filterOptions.pools],
  );

  const websiteIdScope = scopeFilters.filters.websiteId.trim();
  const superviseAgent =
    teamView &&
    Boolean(teamAgent?.userId) &&
    Boolean(websiteIdScope) &&
    monitorApiEnabled;

  const teamMonitorFilters = useMemo(
    () => ({
      websiteId: websiteIdScope,
      agentId: teamAgent?.userId,
    }),
    [teamAgent?.userId, websiteIdScope],
  );

  const teamLiveQuery = useQuery({
    queryKey: chatMonitorKeys.live(teamMonitorFilters),
    queryFn: () => fetchMonitorLive(teamMonitorFilters),
    enabled: inboxAllowed && superviseAgent,
  });

  const teamClosedQuery = useQuery({
    queryKey: chatMonitorKeys.closed(teamMonitorFilters),
    queryFn: () => fetchMonitorClosed(teamMonitorFilters),
    enabled: inboxAllowed && superviseAgent,
  });

  const supervisedActive = useMemo(() => {
    const rows = monitorRowsToConversationSummaries(teamLiveQuery.data ?? []);
    return rows.filter(
      (c) =>
        (c.status === "assigned" || c.status === "active") &&
        !isUnassignedActiveChat(c),
    );
  }, [teamLiveQuery.data]);

  const supervisedWaiting = useMemo(() => {
    const rows = monitorRowsToConversationSummaries(teamLiveQuery.data ?? []);
    return rows.filter((c) => c.status === "waiting" && !isUnassignedActiveChat(c));
  }, [teamLiveQuery.data]);

  const supervisedClosed = useMemo(
    () => monitorRowsToConversationSummaries(teamClosedQuery.data ?? []),
    [teamClosedQuery.data],
  );

  const agentsQuery = useChatWebsiteAgents(
    websiteIdScope,
    scopeFilters.filters.parentCompanyId,
    {
      departmentId: scopeFilters.filters.departmentId,
      poolId: scopeFilters.filters.poolId,
      search: agentSearch,
    },
    { enabled: inboxAllowed && teamView && Boolean(websiteIdScope) },
  );

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

  useEffect(() => {
    if (!superviseAgent || agentChat.selectedConversationId) return;
    const pick = [...supervisedActive, ...supervisedWaiting];
    if (pick.length !== 1) return;
    const row = pick[0];
    void agentChat.selectConversation(row.id, {
      assigneeAgentId:
        row.assignedAgentId ??
        (typeof row.agentId === "string" ? row.agentId : null),
    });
  }, [
    agentChat.selectConversation,
    agentChat.selectedConversationId,
    superviseAgent,
    supervisedActive,
    supervisedWaiting,
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
      rows.filter((c) => {
        if (isUnassignedActiveChat(c)) return false;
        if (teamView && teamAgent?.userId && !superviseAgent) {
          const aid =
            c.assignedAgentId ??
            (typeof c.agentId === "string" ? c.agentId : null);
          if (aid && aid !== teamAgent.userId) return false;
        }
        return conversationMatchesScope(c, scopeFilters.filters, scopeFilters.websiteIdsInScope);
      }),
    [
      scopeFilters.filters,
      scopeFilters.websiteIdsInScope,
      superviseAgent,
      teamAgent?.userId,
      teamView,
    ],
  );

  const activeSource = superviseAgent ? supervisedActive : agentChat.activeChats;
  const waitingSource = superviseAgent ? supervisedWaiting : agentChat.waitingChats;
  const closedSource = superviseAgent ? supervisedClosed : agentChat.closedChats;

  const activeFiltered = useMemo(
    () => (showScopeFilters && !superviseAgent ? filterByScope(activeSource) : activeSource),
    [activeSource, filterByScope, showScopeFilters, superviseAgent],
  );
  const waitingFiltered = useMemo(
    () => (showScopeFilters && !superviseAgent ? filterByScope(waitingSource) : waitingSource),
    [filterByScope, showScopeFilters, superviseAgent, waitingSource],
  );
  const closedFiltered = useMemo(
    () => (showScopeFilters && !superviseAgent ? filterByScope(closedSource) : closedSource),
    [closedSource, filterByScope, showScopeFilters, superviseAgent],
  );

  const list: ConversationSummary[] =
    queueTab === "active"
      ? activeFiltered
      : queueTab === "waiting"
        ? waitingFiltered
        : closedFiltered;

  const queuePool = superviseAgent
    ? [...supervisedActive, ...supervisedWaiting, ...supervisedClosed]
    : [...agentChat.activeChats, ...agentChat.waitingChats, ...agentChat.closedChats];

  const selectedSummary =
    queuePool.find((c) => c.id === agentChat.selectedConversationId) ??
    list.find((c) => c.id === agentChat.selectedConversationId);

  const visitorPresentation: AgentVisitorPresentation | null = selectedSummary
    ? extractVisitorPresentation(selectedSummary)
    : null;
  const conversationMeta =
    selectedSummary && typeof selectedSummary === "object"
      ? (selectedSummary as Record<string, unknown>)
      : null;
  const viewingOtherAgent = Boolean(
    superviseAgent && teamAgent?.userId && teamAgent.userId !== user?.id,
  );
  const assignedAgentLabel =
    (viewingOtherAgent ? teamAgent?.displayName : null)?.trim() ||
    user?.displayName?.trim() ||
    user?.email?.trim() ||
    "You";
  const assignedAgentId =
    typeof selectedSummary?.assignedAgentId === "string"
      ? selectedSummary.assignedAgentId
      : null;
  const websiteIdEffective =
    (typeof selectedSummary?.websiteId === "string" ? selectedSummary.websiteId : "").trim() ||
    agentChat.selectedWebsiteId?.trim() ||
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
        if (res == null) {
          setAvailabilityHint(null);
          return;
        }
        const text =
          typeof res === "string"
            ? res
            : res && typeof res === "object"
              ? JSON.stringify(res)
              : String(res);
        if (!text.trim() || text === "null") {
          setAvailabilityHint(null);
          return;
        }
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
      if (needsWebsite(action) && !websiteIdEffective.trim()) {
        publishAppToast({
          variant: "warning",
          message:
            "Select a chat from your queue or wait for history to load so the copilot can resolve the website.",
        });
        return;
      }

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
      } catch (err) {
        const apiMsg = extractApiErrorMessageForToast(err);
        setAiByConversation((prev) => {
          const current = getConversationAiState(prev, conversationId);
          return patchConversationAiState(prev, conversationId, {
            busy: false,
            messages: current.messages.map((m) =>
              m.id === pendingId
                ? {
                    ...m,
                    content: apiMsg ?? "Assistant request failed. Try again.",
                    pending: false,
                  }
                : m,
            ),
          });
        });
        if (apiMsg) {
          publishAppToast({ variant: "error", message: apiMsg });
        }
      }
    },
    [accessToken, agentChat.selectedConversationId, draftsByConversation, websiteIdEffective],
  );

  const sendNow = async () => {
    const id = agentChat.selectedConversationId;
    if (!id || !composer.trim()) return;
    try {
      await agentChat.sendMessage(composer.trim());
      setDraftsByConversation((prev) => patchConversationDraft(prev, id, ""));
    } catch (err) {
      publishAppToast({
        variant: "error",
        message:
          extractApiErrorMessageForToast(err) ??
          agentChat.sendBlockedReason ??
          "Could not send message.",
      });
    }
  };

  const handleSelectConversation = (id: string) => {
    const row = queuePool.find((c) => c.id === id);
    const assigneeAgentId =
      row?.assignedAgentId ??
      (typeof row?.agentId === "string" ? row.agentId : null);
    void agentChat.selectConversation(id, {
      readOnly: queueTab === "closed" || viewingOtherAgent,
      assigneeAgentId,
    });
  };

  const sendBlockedHint = agentChat.sendBlockedReason;

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
          description="Requires page:chat-inbox (or legacy page:chat) and chat:access on GET /auth/me (e.g. chat:bundle:agent). Sign out and back in after role changes."
        />
      </Box>
    );
  }

  const canPickWaiting = !agentChat.atActiveCap;
  const wrapUpForSelected =
    agentChat.pendingWrapUp &&
    agentChat.selectedConversationId &&
    agentChat.pendingWrapUp.conversationId === agentChat.selectedConversationId
      ? agentChat.pendingWrapUp
      : null;

  const distributionFormHref =
    wrapUpForSelected?.requiresDistributionForm
      ? wrapUpForSelected.distributionFormPath ??
        `/dashboard/chat-operations/distribution?conversationId=${encodeURIComponent(agentChat.selectedConversationId!)}`
      : null;

  const closeFormHref =
    wrapUpForSelected?.requiresAgentWrapUp && !wrapUpForSelected.requiresDistributionForm
      ? `/dashboard/chat-operations?conversationId=${encodeURIComponent(agentChat.selectedConversationId!)}&wrapUp=1`
      : null;

  const canSend =
    Boolean(agentChat.selectedConversationId && accessToken) &&
    agentChat.canSendMessage &&
    !viewingOtherAgent;
  const agentReadOnly =
    viewingOtherAgent ||
    Boolean(agentChat.sendBlockedReason) ||
    agentChat.selectedIsClosed;

  return (
    <ChatLivePageShell
      variant="workstation"
      sx={showScopeFilters ? undefined : chatLiveAgentStackSx}
    >
      <ChatLivePageHeader
        title="Agent inbox"
        subtitle={
          showScopeFilters
            ? teamView
              ? "Choose a website, then optionally an agent. Queue updates as you filter."
              : "Your personal assignments across scoped websites."
            : "Your assigned queue — reply, insert canned responses, and wrap up when required."
        }
        navPreset="triage"
        viewSwitch={
          showScopeFilters
            ? {
                options: [
                  { id: "team", label: "By website" },
                  { id: "mine", label: "My queue" },
                ],
                value: teamView ? "team" : "mine",
                onChange: (id) => {
                  setTeamView(id === "team");
                  setTeamAgent(null);
                },
                ariaLabel: "Agent inbox view",
              }
            : undefined
        }
        trailing={
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, justifyContent: "flex-end" }}>
            <Box sx={chatLiveQueueStatPillSx("active")}>Active {activeFiltered.length}</Box>
            <Box sx={chatLiveQueueStatPillSx("waiting")}>Waiting {waitingFiltered.length}</Box>
            <Box sx={chatLiveQueueStatPillSx("closed")}>Closed {closedFiltered.length}</Box>
          </Box>
        }
      />
      {showScopeFilters ? (
        <>
          {teamView ? (
            <>
              <ChatLiveHubScopeCard
                filters={scopeFilters.filters}
                onPatch={(patch) => {
                  scopeFilters.patchFilters(patch);
                  if (patch.websiteId !== undefined) setTeamAgent(null);
                }}
                onReset={() => {
                  scopeFilters.resetFilters();
                  setTeamAgent(null);
                  setAgentSearch("");
                }}
                canFilterByResellerId={scopeFilters.canFilterByResellerId}
                resellerOptions={scopeFilters.resellerOptions}
                parentCompanyOptions={scopeFilters.parentCompanyOptions}
                childCompanyOptions={scopeFilters.childCompanyOptions}
                websiteOptions={scopeFilters.websiteOptions}
                agentSearch={agentSearch}
                onAgentSearchChange={setAgentSearch}
                showDepartmentPool
                departmentOptions={hubDepartmentOptions}
                poolOptions={hubPoolOptions}
              />
              {websiteIdScope ? (
                <ChatWebsiteAgentsTable
                  rows={agentsQuery.rows}
                  isLoading={agentsQuery.isLoading}
                  isError={agentsQuery.isError}
                  selectedAgentUserId={teamAgent?.userId}
                  onSelectAgent={(row) => {
                    setTeamAgent(row);
                    agentChat.clearSelection();
                  }}
                  websiteLabel={
                    scopeFilters.websiteOptions.find((w) => w.value === websiteIdScope)?.label
                  }
                />
              ) : null}
            </>
          ) : (
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
                hint="Your personal agent queue across scoped websites."
              />
            </DashboardCard>
          )}
        </>
      ) : null}
      <Box sx={chatOpsWorkspaceShell}>
        {teamView && teamAgent ? (
          <DashboardCard sx={{ flexShrink: 0, p: 1.25, mb: 1 }}>
            <Typography variant="body2">
              Viewing chats for <strong>{teamAgent.displayName}</strong>
              {teamAgent.email ? ` · ${teamAgent.email}` : null}
              {" · "}
              <Box
                component="button"
                type="button"
                onClick={() => setTeamAgent(null)}
                sx={{
                  border: "none",
                  bgcolor: "transparent",
                  color: "primary.main",
                  cursor: "pointer",
                  fontWeight: 600,
                  p: 0,
                }}
              >
                Clear agent
              </Box>
            </Typography>
          </DashboardCard>
        ) : null}
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
              readOnly={agentReadOnly}
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
                sendBlockedHint ??
                (availabilityHint && websiteIdEffective ? availabilityHint : null)
              }
              websiteId={websiteIdEffective || null}
              departmentId={departmentIdEffective}
              activeWhisper={agentChat.activeWhisper}
              onApplyWhisperToComposer={applyAiToComposer}
              onDismissWhisper={agentChat.dismissWhisper}
              distributionFormHref={distributionFormHref}
              distributionSubmitted={Boolean(wrapUpForSelected?.distributionSubmitted)}
              closeFormHref={closeFormHref}
              wrapUpSubmitted={Boolean(wrapUpForSelected?.wrapUpSubmitted)}
            />
          </Box>

          <Box data-chat-pane="details">
            <VisitorInfoPanel
              visitor={agentChat.visitorFromHistory}
              conversationId={agentChat.selectedConversationId}
              websiteId={websiteIdEffective || null}
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

      <AgentWrapUpModal
        open={searchParams.get("wrapUp") === "1" && Boolean(wrapUpForSelected?.requiresAgentWrapUp)}
        payload={wrapUpForSelected}
        onClose={agentChat.dismissWrapUp}
        onSubmitted={() => {
          agentChat.dismissWrapUp();
          void agentChat.refreshQueues();
        }}
      />
    </ChatLivePageShell>
  );
}
