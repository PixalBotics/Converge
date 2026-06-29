"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { postAgentAiSuggestion, parseAgentSuggestResponse } from "@/api";
import { useAccessToken } from "@/lib/auth/use-access-token";
import type { AgentAiAction } from "@/api/ai/agent-suggest.api";
import { buildAgentCopilotInput, agentAiActionNeedsWebsite } from "@/lib/ai/agent-copilot-input";
import { useAuth, useResellerListScope } from "@/lib/auth";
import { DashboardCard, PermissionDeniedPanel, Typography } from "@/components/common";
import {
  needsChatScopeFilters,
  useChatApiGates,
} from "@/lib/permissions";
import { OP } from "@/lib/permissions/operational-keys";
import { PAGE } from "@/lib/permissions/permission-constants";
import { useAgentChat } from "@/lib/hooks/chat/useAgentChat";
import { setAgentChatFocusedConversation } from "@/lib/hooks/chat/agent-chat-focus-bus";
import { mergeSx } from "@/lib/mui/merge-sx";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import {
  ChatLiveHubScopeCard,
  ChatLivePageShell,
  ChatLiveViewSwitch,
  ChatScopeFiltersToolbar,
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
  chatLiveWorkstationToolbarRowSx,
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
import type { VisitorProfileField } from "@/services/chat/visitor-profile.types";
import { ChatConversationPanel } from "./ChatConversationPanel";
import { AgentChatSessionToolbar } from "./AgentChatSessionToolbar";
import { ChatQueueSidebar } from "./ChatQueueSidebar";
import { MarkSpamModal } from "./MarkSpamModal";
import { useAgentInboxFocusMode } from "@/lib/hooks/chat/useAgentInboxFocusMode";
import {
  CLOSED_CHAT_BUCKETS,
  buildDistributionFormHref,
  resolveClosedChatBucket,
} from "../utils/chat-close-outcome";
import type { SpamCategoryValue } from "../utils/chat-close-outcome";
import type { VisitorProfileCaptureSelection } from "./ChatMessageList";
import { useVisitorProfileCapture } from "../hooks/useVisitorProfileCapture";
import { VisitorInfoPanel } from "./VisitorInfoPanel";
import {
  chatOpsPageWrapper,
  chatOpsWorkspaceGrid,
  chatOpsWorkspaceFocusGridSx,
  chatOpsWorkspaceShell,
  chatOpsWorkspaceShellFocusSx,
} from "../styles/chat-operations.styles";

const chatOpsThreadPaneSx = {
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  width: "100%",
  display: "flex",
  flexDirection: "column",
} as const;

function needsWebsite(action: AgentAiAction): boolean {
  return agentAiActionNeedsWebsite(action);
}

function splitEndedChats(rows: ConversationSummary[]) {
  const pending: ConversationSummary[] = [];
  const completed: ConversationSummary[] = [];
  const spam: ConversationSummary[] = [];
  for (const row of rows) {
    const bucket = resolveClosedChatBucket(row);
    if (bucket === CLOSED_CHAT_BUCKETS.SPAM) spam.push(row);
    else if (bucket === CLOSED_CHAT_BUCKETS.PENDING) pending.push(row);
    else completed.push(row);
  }
  return { pending, completed, spam };
}

function isLiveQueueTab(tab: ChatQueueTab): boolean {
  return tab === "active";
}

export function ChatOperationsWorkspace() {
  const { user, hasOperational, hasPage, permissionsSyncing } = useAuth();
  const gates = useChatApiGates();
  const monitorApiEnabled = gates.monitor;
  const { canFilterByResellerId } = useResellerListScope();
  const searchParams = useSearchParams();
  const router = useRouter();
  const inboxAllowed = gates.agentInbox;
  const showScopeFilters = needsChatScopeFilters(hasOperational, canFilterByResellerId, {
    isPoolHead: user?.isPoolHead === true,
  });
  const accessToken = useAccessToken() ?? "";
  const scopeFilters = useChatScopeFilters(undefined, { apiEnabled: showScopeFilters });
  const conversationIdFromUrl = searchParams.get("conversationId")?.trim() ?? "";

  useEffect(() => {
    if (searchParams.get("wrapUp") !== "1" || !conversationIdFromUrl) return;
    router.replace(
      `/dashboard/chat-operations/distribution?conversationId=${encodeURIComponent(conversationIdFromUrl)}`,
    );
  }, [conversationIdFromUrl, router, searchParams]);

  const agentChat = useAgentChat({
    token: accessToken,
    agentId: user?.id,
    apiEnabled: inboxAllowed,
  });

  const [queueTab, setQueueTab] = useState<ChatQueueTab>("active");
  const [spamModalOpen, setSpamModalOpen] = useState(false);
  const [spamSubmitBusy, setSpamSubmitBusy] = useState(false);
  const [draftsByConversation, setDraftsByConversation] = useState<Record<string, string>>({});
  const [aiByConversation, setAiByConversation] = useState<
    Record<string, { messages: AiChatMessage[]; prompt: string; busy: boolean }>
  >({});
  const [fallbackWebsiteId, setFallbackWebsiteId] = useState("");
  const [availabilityHint, setAvailabilityHint] = useState<string | null>(null);
  const [teamAgent, setTeamAgent] = useState<ChatWebsiteAgentRow | null>(null);
  const [agentSearch, setAgentSearch] = useState("");
  const [teamView, setTeamView] = useState(showScopeFilters);
  const agentInboxFocusChrome = useAgentInboxFocusMode();

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
    const pick = supervisedActive;
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
  ]);

  useEffect(() => {
    setAgentChatFocusedConversation(agentChat.selectedConversationId);
    return () => setAgentChatFocusedConversation(null);
  }, [agentChat.selectedConversationId]);

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
  const closedSource = superviseAgent ? supervisedClosed : agentChat.closedChats;

  const activeFiltered = useMemo(
    () => (showScopeFilters && !superviseAgent ? filterByScope(activeSource) : activeSource),
    [activeSource, filterByScope, showScopeFilters, superviseAgent],
  );
  const closedFiltered = useMemo(
    () => (showScopeFilters && !superviseAgent ? filterByScope(closedSource) : closedSource),
    [closedSource, filterByScope, showScopeFilters, superviseAgent],
  );

  const { pending: pendingFiltered, completed: completedFiltered, spam: spamFiltered } =
    useMemo(() => splitEndedChats(closedFiltered), [closedFiltered]);

  const list: ConversationSummary[] =
    queueTab === "active"
      ? activeFiltered
      : queueTab === "pending"
        ? pendingFiltered
        : queueTab === "completed"
          ? completedFiltered
          : spamFiltered;

  const queuePool = superviseAgent
    ? [...supervisedActive, ...supervisedClosed]
    : [...agentChat.activeChats, ...agentChat.closedChats];

  const selectedSummary =
    queuePool.find((c) => c.id === agentChat.selectedConversationId) ??
    list.find((c) => c.id === agentChat.selectedConversationId);

  const visitorPresentation: AgentVisitorPresentation | null = selectedSummary
    ? extractVisitorPresentation(selectedSummary)
    : null;
  const viewingOtherAgent = Boolean(
    superviseAgent && teamAgent?.userId && teamAgent.userId !== user?.id,
  );
  const inboxFocusMode = agentInboxFocusChrome && !teamView && !viewingOtherAgent;
  const theme = useTheme();
  const isBelowLg = useMediaQuery(theme.breakpoints.down("lg"));
  const showInboxPane =
    inboxFocusMode || !isBelowLg || !agentChat.selectedConversationId;
  const showThreadPane =
    inboxFocusMode || !isBelowLg || Boolean(agentChat.selectedConversationId);
  const showBackToQueue =
    !inboxFocusMode && isBelowLg && Boolean(agentChat.selectedConversationId);
  const showAgentToolbar = !teamView && !viewingOtherAgent;
  const showAgentToolbarAboveGrid = showAgentToolbar && isBelowLg && !inboxFocusMode;
  const showAgentToolbarInThread = showAgentToolbar && !showAgentToolbarAboveGrid;

  const assignedAgentLabel =
    (viewingOtherAgent ? teamAgent?.displayName : null)?.trim() ||
    user?.displayName?.trim() ||
    user?.email?.trim() ||
    "You";
  const conversationMeta =
    selectedSummary && typeof selectedSummary === "object"
      ? ({
          ...(selectedSummary as Record<string, unknown>),
          ...(assignedAgentLabel
            ? { agentNameSnapshot: assignedAgentLabel, agentName: assignedAgentLabel }
            : {}),
        } as Record<string, unknown>)
      : null;
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
        const input = buildAgentCopilotInput({
          prompt,
          action,
          transcript: agentChat.messages,
          draftReply: draftContext,
        });

        const data = await postAgentAiSuggestion({
          action,
          input,
          conversationId,
          ...(websiteIdEffective.trim() ? { websiteId: websiteIdEffective.trim() } : {}),
          ...(action === "rewrite_tone" ? { tone: "professional" } : {}),
        });

        const parsed = parseAgentSuggestResponse(data);
        setAiByConversation((prev) => {
          const current = getConversationAiState(prev, conversationId);
          return patchConversationAiState(prev, conversationId, {
            busy: false,
            messages: current.messages.map((m) =>
              m.id === pendingId
                ? {
                    ...m,
                    content: parsed.reply,
                    sources: parsed.sources.length ? parsed.sources : undefined,
                    pending: false,
                  }
                : m,
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
    [accessToken, agentChat.messages, agentChat.selectedConversationId, draftsByConversation, websiteIdEffective],
  );

  const sendNow = async () => {
    const id = agentChat.selectedConversationId;
    if (!id || !composer.trim()) return;
    try {
      await agentChat.sendMessage(composer.trim());
      agentChat.dismissWhisper();
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
      readOnly: !isLiveQueueTab(queueTab) || viewingOtherAgent,
      assigneeAgentId,
    });
  };

  const handleDismissConversation = useCallback(() => {
    agentChat.clearSelection();
    if (conversationIdFromUrl) {
      router.replace("/dashboard/chat-operations");
    }
  }, [agentChat.clearSelection, conversationIdFromUrl, router]);

  const handleConfirmSpam = useCallback(
    async (input: { spamCategory: SpamCategoryValue; notes: string }) => {
      setSpamSubmitBusy(true);
      try {
        await agentChat.markSpamSelectedConversation(input);
        setSpamModalOpen(false);
        setQueueTab("spam");
        publishAppToast({ variant: "success", message: "Chat marked as spam." });
      } catch (err) {
        publishAppToast({
          variant: "error",
          message: extractApiErrorMessageForToast(err, "Could not mark chat as spam."),
        });
      } finally {
        setSpamSubmitBusy(false);
      }
    },
    [agentChat],
  );

  const canCaptureVisitorProfile = useMemo(() => {
    if (!inboxAllowed || !accessToken || !agentChat.selectedConversationId) return false;
    if (
      viewingOtherAgent ||
      agentChat.selectedIsClosed ||
      Boolean(agentChat.sendBlockedReason)
    ) {
      return false;
    }
    return (
      hasOperational(OP.chat.updateVisitorProfile) ||
      hasOperational(OP.chat.access) ||
      hasPage(PAGE.CHAT) ||
      hasPage(PAGE.CHAT_INBOX)
    );
  }, [
    accessToken,
    agentChat.selectedConversationId,
    agentChat.selectedIsClosed,
    agentChat.sendBlockedReason,
    hasOperational,
    hasPage,
    inboxAllowed,
    viewingOtherAgent,
  ]);

  const { captureField } = useVisitorProfileCapture({
    conversationId: agentChat.selectedConversationId,
    token: accessToken,
    enabled: canCaptureVisitorProfile,
    onApplied: (result) => {
      agentChat.applyVisitorProfileUpdate({
        conversationId: result.conversationId,
        visitorId: result.visitorId,
        name: result.name,
        email: result.email,
        phone: result.phone,
        visitorProfileComplete: result.visitorProfileComplete,
        visitorPresentation: result.visitorPresentation,
        displayName: result.visitorPresentation.displayName,
        inboxTitle: result.visitorPresentation.inboxTitle,
        subtitle: result.visitorPresentation.subtitle,
      });
    },
  });

  const [profileCaptureBusy, setProfileCaptureBusy] = useState(false);

  const handleCaptureField = useCallback(
    async (field: VisitorProfileField, selection: VisitorProfileCaptureSelection) => {
      setProfileCaptureBusy(true);
      try {
        await captureField(field, selection.text, {
          messageId: selection.messageId,
          sourceText: selection.text,
        });
      } finally {
        setProfileCaptureBusy(false);
      }
    },
    [captureField],
  );

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
          description="Supervisors and admins use Chat Monitor. Agents and pool heads need chat:bundle:agent or chat:bundle:pool-head on GET /auth/me. Sign out and back in after role changes."
        />
      </Box>
    );
  }

  const wrapUpForSelected =
    agentChat.pendingWrapUp &&
    agentChat.selectedConversationId &&
    agentChat.pendingWrapUp.conversationId === agentChat.selectedConversationId
      ? agentChat.pendingWrapUp
      : null;

  useEffect(() => {
    if (
      wrapUpForSelected?.requiresDistributionForm &&
      !wrapUpForSelected.distributionSubmitted
    ) {
      setQueueTab("pending");
    }
  }, [wrapUpForSelected]);

  const selectedCloseBucket = selectedSummary
    ? resolveClosedChatBucket(selectedSummary)
    : null;
  const selectedDistributionSubmitted = Boolean(
    selectedSummary &&
      typeof selectedSummary === "object" &&
      (selectedSummary as Record<string, unknown>).distributionSubmitted,
  );
  const selectedRequiresDistribution =
    selectedCloseBucket === CLOSED_CHAT_BUCKETS.PENDING ||
    Boolean(
      selectedSummary &&
        typeof selectedSummary === "object" &&
        (selectedSummary as Record<string, unknown>).requiresDistributionForm &&
        !selectedDistributionSubmitted,
    );

  const distributionFormHref =
    agentChat.selectedConversationId && selectedRequiresDistribution
      ? buildDistributionFormHref(
          agentChat.selectedConversationId,
          wrapUpForSelected?.distributionFormPath,
        )
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
    <>
    <ChatLivePageShell variant="workstation" sx={chatLiveAgentStackSx}>
      {showScopeFilters && !inboxFocusMode ? (
        <>
          <Box sx={chatLiveWorkstationToolbarRowSx}>
            <ChatLiveViewSwitch
              options={[
                { id: "team", label: "By website" },
                { id: "mine", label: "My queue" },
              ]}
              value={teamView ? "team" : "mine"}
              onChange={(id) => {
                setTeamView(id === "team");
                setTeamAgent(null);
              }}
              ariaLabel="Agent inbox view"
            />
            {!teamView ? (
              <ChatScopeFiltersToolbar
                filters={scopeFilters.filters}
                onPatch={scopeFilters.patchFilters}
                onReset={scopeFilters.resetFilters}
                canFilterByResellerId={scopeFilters.canFilterByResellerId}
                resellerOptions={scopeFilters.resellerOptions}
                parentCompanyOptions={scopeFilters.parentCompanyOptions}
                childCompanyOptions={scopeFilters.childCompanyOptions}
                websiteOptions={scopeFilters.websiteOptions}
                title="Queue filters"
                hint="Your personal agent queue across scoped websites."
              />
            ) : null}
          </Box>
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
          ) : null}
        </>
      ) : null}
      <Box sx={mergeSx(chatOpsWorkspaceShell, inboxFocusMode ? chatOpsWorkspaceShellFocusSx : undefined)}>
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
        {showAgentToolbarAboveGrid ? (
          <AgentChatSessionToolbar
            showBackToQueue={showBackToQueue}
            onBackToQueue={handleDismissConversation}
          />
        ) : null}
        <Box sx={inboxFocusMode ? chatOpsWorkspaceFocusGridSx : chatOpsWorkspaceGrid}>
          {showInboxPane ? (
            <Box data-chat-pane="inbox">
              <ChatQueueSidebar
                queueTab={queueTab}
                onQueueTabChange={setQueueTab}
                conversations={list}
                selectedConversationId={agentChat.selectedConversationId}
                onSelectConversation={handleSelectConversation}
                activeCount={activeFiltered.length}
                pendingCount={pendingFiltered.length}
                completedCount={completedFiltered.length}
                spamCount={spamFiltered.length}
                connected={agentChat.isConnected}
                hasToken={Boolean(accessToken)}
              />
            </Box>
          ) : null}

          {showThreadPane ? (
          <Box data-chat-pane="thread" sx={chatOpsThreadPaneSx}>
            {showAgentToolbarInThread ? (
              <AgentChatSessionToolbar
                showBackToQueue={showBackToQueue}
                onBackToQueue={handleDismissConversation}
              />
            ) : null}
            <ChatConversationPanel
              conversationId={agentChat.selectedConversationId}
              messages={agentChat.messages}
              visitor={agentChat.visitorFromHistory}
              conversationMeta={conversationMeta}
              visitorPresentation={visitorPresentation}
              readOnly={agentReadOnly}
              assignedAgentLabel={assignedAgentLabel}
              visitorTyping={agentChat.visitorTypingSelected && !agentChat.selectedIsClosed}
              visitorTypingDraft={agentChat.visitorTypingDraft}
              remoteTypingEntries={agentChat.remoteTypingEntries}
              composer={composer}
              onComposerChange={setComposer}
              onSend={() => void sendNow()}
              onTyping={agentChat.emitTyping}
              onStopTyping={agentChat.emitStopTyping}
              onInsertCanned={pushCannedToComposer}
              onDismissConversation={
                agentChat.selectedConversationId ? handleDismissConversation : undefined
              }
              onMarkSpam={
                agentChat.selectedIsClosed || viewingOtherAgent
                  ? undefined
                  : () => setSpamModalOpen(true)
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
              onApplyWhisperToComposer={pushCannedToComposer}
              onDismissWhisper={agentChat.dismissWhisper}
              distributionFormHref={distributionFormHref}
              requiresDistributionForm={selectedRequiresDistribution}
              distributionSubmitted={selectedDistributionSubmitted}
              hasOperational={hasOperational}
              profileCaptureEnabled={canCaptureVisitorProfile}
              onCaptureField={handleCaptureField}
              profileCaptureBusy={profileCaptureBusy}
            />
          </Box>
          ) : null}

          {!inboxFocusMode ? (
            <Box data-chat-pane="details">
              <VisitorInfoPanel
                visitor={agentChat.visitorFromHistory}
                conversationId={agentChat.selectedConversationId}
                websiteId={websiteIdEffective || null}
                conversationMeta={conversationMeta}
                visitorPresentation={visitorPresentation}
                assignedAgentLabel={assignedAgentLabel}
                assignedAgentId={assignedAgentId}
                currentUserId={user?.id}
                hasOperational={hasOperational}
                supervisorRefreshToken={agentChat.supervisorRefreshToken}
                onSupervisorActivity={(payload) => agentChat.onSupervisorActivity(payload)}
                supervisorReadOnly={agentChat.selectedIsClosed}
                showWebsiteFallback={Boolean(
                  agentChat.selectedConversationId && !selectedSummary?.websiteId,
                )}
                fallbackWebsiteId={fallbackWebsiteId}
                onFallbackWebsiteIdChange={setFallbackWebsiteId}
              />
            </Box>
          ) : null}
        </Box>
      </Box>

    </ChatLivePageShell>
    <MarkSpamModal
      open={spamModalOpen}
      busy={spamSubmitBusy}
      onClose={() => !spamSubmitBusy && setSpamModalOpen(false)}
      onConfirm={(input) => void handleConfirmSpam(input)}
    />
    </>
  );
}
