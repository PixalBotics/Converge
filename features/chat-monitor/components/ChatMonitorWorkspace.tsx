"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import type { AppTheme } from "@/theme/theme";
import { useAuth } from "@/lib/auth";
import { PermissionDeniedPanel } from "@/components/common";
import {
  needsChatScopeFilters,
  useChatApiGates,
} from "@/lib/permissions";
import { PAGE } from "@/lib/permissions/permission-constants";
import { OP } from "@/lib/permissions/operational-keys";
import { Button, DashboardCard, Typography } from "@/components/common";
import {
  ChatLiveHubScopeCard,
  ChatLivePageShell,
  ChatLiveViewSwitch,
  ChatScopeFiltersToolbar,
  ChatWebsiteAgentsTable,
  monitorRowMatchesScope,
  useChatScopeFilters,
  useChatWebsiteAgents,
  type ChatWebsiteAgentRow,
} from "@/features/chat-shared";
import {
  chatLiveAgentStackSx,
  chatLiveQueueStatPillSx,
} from "@/features/chat-shared/styles/chat-live.styles";
import { useChatMonitor } from "../hooks/useChatMonitor";
import { MonitorQueueSidebar } from "./MonitorQueueSidebar";
import { VisitorInfoPanel } from "@/features/chat-operations/components/VisitorInfoPanel";
import { MonitorSupervisorSidePanel } from "./MonitorSupervisorSidePanel";
import { MonitorTranscriptPanel } from "./MonitorTranscriptPanel";
import { extractVisitorPresentation } from "@/services/chat/visitor-presentation";
import { agentDisplayName } from "@/services/chat/monitor-normalizers";
import {
  chatMonitorAgentTableWrapSx,
  chatMonitorToolbarRowSx,
  chatMonitorWorkspaceGrid,
  chatMonitorWorkspaceShell,
} from "../styles/chat-monitor.styles";

type MonitorViewMode = "team" | "queue";

export function ChatMonitorWorkspace({
  initialConversationId = null,
}: {
  initialConversationId?: string | null;
}) {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { user, hasOperational, hasPage, permissionsSyncing } = useAuth();
  const gates = useChatApiGates();
  const hasChatPage = hasPage(PAGE.CHAT_MONITOR) || hasPage(PAGE.CHAT);
  const hasMonitorPerm =
    gates.monitor ||
    hasOperational(OP.chat.monitorInvolvement) ||
    hasOperational(OP.chat.monitorPool) ||
    hasOperational(OP.chat.monitorDepartment) ||
    hasOperational(OP.chat.monitorParentCompany);
  const monitorApiEnabled = gates.ready && hasChatPage;
  const scopeFilters = useChatScopeFilters(undefined, { apiEnabled: monitorApiEnabled });
  const showScopeFilters = needsChatScopeFilters(
    hasOperational,
    scopeFilters.canFilterByResellerId,
  );

  const [viewMode, setViewMode] = useState<MonitorViewMode>("team");
  const [teamAgent, setTeamAgent] = useState<ChatWebsiteAgentRow | null>(null);
  const [agentSearch, setAgentSearch] = useState("");

  const monitor = useChatMonitor(initialConversationId, { apiEnabled: monitorApiEnabled });

  const hasMonitorScope = (monitor.capabilities?.scopes?.length ?? 0) > 0;
  const monitorReadOnly = monitor.capabilities?.readOnly ?? false;
  const teamMode = viewMode === "team";
  const websiteId = scopeFilters.filters.websiteId.trim();
  const agentsQuery = useChatWebsiteAgents(
    websiteId,
    scopeFilters.filters.parentCompanyId,
    {
      departmentId: scopeFilters.filters.departmentId,
      poolId: scopeFilters.filters.poolId,
      search: agentSearch,
    },
    { enabled: monitorApiEnabled && teamMode && Boolean(websiteId) },
  );
  const agentFilterActive = teamMode && Boolean(teamAgent?.userId);

  useEffect(() => {
    if (initialConversationId) setViewMode("queue");
  }, [initialConversationId]);

  useEffect(() => {
    if (!monitorApiEnabled) return;
    monitor.setFilters({
      websiteId: websiteId || undefined,
      departmentId: agentFilterActive
        ? undefined
        : scopeFilters.filters.departmentId.trim() || undefined,
      poolId: agentFilterActive
        ? undefined
        : scopeFilters.filters.poolId.trim() || undefined,
      status: scopeFilters.filters.status.trim() || undefined,
      agentId: agentFilterActive ? teamAgent?.userId : undefined,
    });
  }, [
    monitorApiEnabled,
    agentFilterActive,
    teamAgent?.userId,
    scopeFilters.filters.departmentId,
    scopeFilters.filters.poolId,
    scopeFilters.filters.status,
    websiteId,
    monitor.setFilters,
  ]);

  const applyClientScopeFilter = !teamMode && showScopeFilters;

  const matchScope = useMemo(
    () => (row: (typeof monitor.liveList)[number]) =>
      monitorRowMatchesScope(row, scopeFilters.filters, scopeFilters.websiteIdsInScope),
    [scopeFilters.filters, scopeFilters.websiteIdsInScope],
  );

  const scopedLive = useMemo(
    () => (applyClientScopeFilter ? monitor.liveList.filter(matchScope) : monitor.liveList),
    [applyClientScopeFilter, matchScope, monitor.liveList],
  );
  const scopedClosed = useMemo(
    () => (applyClientScopeFilter ? monitor.closedList.filter(matchScope) : monitor.closedList),
    [applyClientScopeFilter, matchScope, monitor.closedList],
  );

  const scopedList = monitor.listTab === "live" ? scopedLive : scopedClosed;

  const departmentOptions = useMemo(
    () => [
      { value: "", label: "All departments" },
      ...monitor.filterOptions.departments.map((d) => ({ value: d.id, label: d.label })),
    ],
    [monitor.filterOptions.departments],
  );

  const poolOptions = useMemo(
    () => [
      { value: "", label: "All pools" },
      ...monitor.filterOptions.pools.map((p) => ({ value: p.id, label: p.label })),
    ],
    [monitor.filterOptions.pools],
  );

  const statusOptions = useMemo(
    () => [
      { value: "", label: "All statuses" },
      ...monitor.filterOptions.statuses.map((s) => ({ value: s, label: s })),
    ],
    [monitor.filterOptions.statuses],
  );

  const showMonitorPanels =
    viewMode === "queue" ||
    Boolean(initialConversationId) ||
    (teamMode && Boolean(websiteId));

  if (permissionsSyncing) {
    return <Typography sx={{ py: 4 }}>Loading permissions…</Typography>;
  }

  if (!hasChatPage) {
    return (
      <PermissionDeniedPanel
        title="Chat monitor not available"
        description="Requires page:chat."
      />
    );
  }

  if (
    !permissionsSyncing &&
    gates.ready &&
    !monitor.capabilitiesLoading &&
    !hasMonitorPerm &&
    !hasMonitorScope
  ) {
    return (
      <PermissionDeniedPanel
        title="No monitor scope"
        description="Assign pool/department head roles, add yourself on Chat involvement (Involvement users), or grant chat:monitor:involvement / chat:bundle:involvement-supervisor."
      />
    );
  }

  if (!monitor.token) {
    return <Typography sx={{ py: 4 }}>Sign in to use chat monitor.</Typography>;
  }

  const handleSelect = (id: string) => {
    void monitor.selectConversation(id);
    router.replace(`/dashboard/chat-monitor/${encodeURIComponent(id)}`, { scroll: false });
  };

  const handleViewModeChange = (mode: MonitorViewMode) => {
    setViewMode(mode);
    if (mode === "queue") {
      setTeamAgent(null);
    }
  };

  const handlePickTeamAgent = (row: ChatWebsiteAgentRow) => {
    setTeamAgent(row);
    monitor.clearSelection();
  };

  useEffect(() => {
    if (!monitorApiEnabled || !agentFilterActive || monitor.selectedConversationId) return;
    const pickFrom = monitor.listTab === "live" ? scopedLive : scopedClosed;
    if (pickFrom.length !== 1) return;
    const id = pickFrom[0]?.id;
    if (!id) return;
    void monitor.selectConversation(id);
    router.replace(`/dashboard/chat-monitor/${encodeURIComponent(id)}`, { scroll: false });
  }, [
    agentFilterActive,
    monitor.listTab,
    monitor.selectedConversationId,
    monitor.selectConversation,
    monitorApiEnabled,
    router,
    scopedClosed,
    scopedLive,
  ]);

  const websiteLabel = scopeFilters.websiteOptions.find((w) => w.value === websiteId)?.label;

  const hasScopes = (monitor.capabilities?.scopes?.length ?? 0) > 0;

  return (
    <ChatLivePageShell variant="workstation" sx={chatLiveAgentStackSx}>
      {hasScopes ? (
        <Box sx={chatMonitorToolbarRowSx}>
          <ChatLiveViewSwitch
            options={[
              { id: "team", label: "By website" },
              { id: "queue", label: "All chats" },
            ]}
            value={viewMode}
            onChange={(id) => handleViewModeChange(id as MonitorViewMode)}
            ariaLabel="Monitor view"
          />
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 0.75,
              ml: "auto",
            }}
          >
            {showScopeFilters && !teamMode ? (
              <ChatScopeFiltersToolbar
                filters={scopeFilters.filters}
                onPatch={scopeFilters.patchFilters}
                onReset={scopeFilters.resetFilters}
                canFilterByResellerId={scopeFilters.canFilterByResellerId}
                resellerOptions={scopeFilters.resellerOptions}
                parentCompanyOptions={scopeFilters.parentCompanyOptions}
                childCompanyOptions={scopeFilters.childCompanyOptions}
                websiteOptions={scopeFilters.websiteOptions}
                showDepartment
                showPool
                showStatus
                departmentOptions={departmentOptions}
                poolOptions={poolOptions}
                statusOptions={statusOptions}
                title="Monitor filters"
                hint="Narrows the monitor queue. Department, pool, and status sync to the server."
              />
            ) : null}
            {showMonitorPanels ? (
              <>
                <Box sx={chatLiveQueueStatPillSx("active")}>Live {scopedLive.length}</Box>
                <Box sx={chatLiveQueueStatPillSx("closed")}>Closed {scopedClosed.length}</Box>
              </>
            ) : null}
          </Box>
        </Box>
      ) : null}

      {monitor.capabilitiesLoading ? (
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", px: 1, flexShrink: 0, fontSize: 11 }}
        >
          Loading monitor scope…
        </Typography>
      ) : null}

      {!monitor.capabilitiesLoading && !hasScopes ? (
        <DashboardCard sx={{ p: 1.25, height: "auto", minHeight: 0, flexShrink: 0, mx: { xs: 0.5, md: 1 } }}>
          <Typography variant="caption" sx={{ color: "warning.main" }}>
            No monitor scope from the server yet. Assign pool/dept head, involvement users on Chat
            involvement, or monitor permissions.
          </Typography>
        </DashboardCard>
      ) : null}

      {monitorReadOnly && showMonitorPanels ? (
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", px: 1, flexShrink: 0, fontSize: 11 }}
        >
          Read-only monitor — view chats only; whisper and take-over are disabled.
        </Typography>
      ) : null}

      {!showMonitorPanels && teamMode && !websiteId ? (
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
          departmentOptions={departmentOptions}
          poolOptions={poolOptions}
          statusOptions={statusOptions}
          agentSearch={agentSearch}
          onAgentSearchChange={setAgentSearch}
        />
      ) : null}

      {showMonitorPanels && teamMode && websiteId ? (
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            px: { xs: 0.5, md: 1 },
            pb: 0.25,
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 13 }}>
            {websiteLabel ?? "Website"}
            {teamAgent ? ` · ${teamAgent.displayName}` : " · all agents"}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {teamAgent ? (
              <Button type="button" variant="outlined" size="small" onClick={() => setTeamAgent(null)}>
                Clear agent
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() => {
                scopeFilters.patchFilters({ websiteId: "" });
                setTeamAgent(null);
              }}
            >
              Change website
            </Button>
          </Box>
        </Box>
      ) : null}

      {showMonitorPanels && teamMode && websiteId ? (
        <Box sx={{ ...chatMonitorAgentTableWrapSx, px: { xs: 0.5, md: 1 } }}>
          <ChatWebsiteAgentsTable
            rows={agentsQuery.rows}
            isLoading={agentsQuery.isLoading}
            isError={agentsQuery.isError}
            selectedAgentUserId={teamAgent?.userId}
            onSelectAgent={handlePickTeamAgent}
            websiteLabel={websiteLabel}
          />
        </Box>
      ) : null}

      {showMonitorPanels ? (
        <Box sx={chatMonitorWorkspaceShell}>
          {monitor.listsError ? (
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
              <Typography color="error">Could not load monitor lists.</Typography>
              <Button type="button" variant="outlined" onClick={() => void monitor.refreshLists()}>
                Retry
              </Button>
            </Box>
          ) : null}
          <Box sx={chatMonitorWorkspaceGrid}>
            <Box data-monitor-pane="inbox">
              <MonitorQueueSidebar
                listTab={monitor.listTab}
                onListTabChange={monitor.setListTab}
                conversations={scopedList}
                selectedConversationId={monitor.selectedConversationId}
                onSelectConversation={handleSelect}
                liveCount={scopedLive.length}
                closedCount={scopedClosed.length}
                connected={monitor.isConnected}
                hasToken={Boolean(monitor.token)}
                loading={monitor.listsLoading}
                agentLabel={
                  agentFilterActive && teamAgent
                    ? `${teamAgent.displayName}${teamAgent.email ? ` · ${teamAgent.email}` : ""}`
                    : null
                }
              />
            </Box>
            <Box data-monitor-pane="thread">
              <MonitorTranscriptPanel
                conversation={monitor.selectedRow}
                messages={monitor.messages}
                visitor={monitor.visitorFromHistory}
                loading={monitor.transcriptLoading}
                loadError={monitor.transcriptError}
                currentUserId={user?.id ?? null}
                hasOperational={hasOperational}
                monitorReadOnly={monitorReadOnly}
                supervisorControlUserId={monitor.supervisorControlUserId}
                visitorTyping={monitor.visitorTyping}
                onSupervisorAction={() => {
                  monitor.updateSupervisorControl(
                    monitor.supervisorControlUserId ?? null,
                  );
                }}
                onMessageSent={() => {}}
              />
            </Box>
            <Box data-monitor-pane="details">
              <VisitorInfoPanel
                visitor={monitor.visitorFromHistory}
                conversationId={monitor.selectedConversationId}
                websiteId={monitor.selectedRow?.websiteId ?? null}
                conversationMeta={
                  monitor.selectedRow
                    ? (monitor.selectedRow as unknown as Record<string, unknown>)
                    : null
                }
                visitorPresentation={
                  monitor.selectedRow
                    ? extractVisitorPresentation(monitor.selectedRow)
                    : null
                }
                assignedAgentLabel={
                  monitor.selectedRow
                    ? agentDisplayName(monitor.selectedRow.agent ?? null)
                    : null
                }
                assignedAgentId={
                  monitor.selectedRow?.agent?.id ?? monitor.selectedRow?.agentId ?? null
                }
                currentUserId={user?.id}
                hasOperational={hasOperational}
                supervisorReadOnly={monitorReadOnly || monitor.selectedRow?.status === "closed"}
                hideSupervisorTools
                onSupervisorActivity={() => {
                  /* socket updates lists + transcript */
                }}
              />
              {monitor.selectedRow?.status !== "closed" ? (
                <MonitorSupervisorSidePanel
                  conversationId={monitor.selectedConversationId}
                  assignedAgentId={
                    monitor.selectedRow?.agent?.id ?? monitor.selectedRow?.agentId ?? null
                  }
                  supervisorControlUserId={monitor.supervisorControlUserId}
                  currentUserId={user?.id ?? null}
                  hasOperational={hasOperational}
                  readOnly={monitorReadOnly}
                  onActionComplete={(payload) => {
                    if (
                      payload &&
                      typeof payload === "object" &&
                      "supervisorControlUserId" in payload
                    ) {
                      const sc = (payload as { supervisorControlUserId?: string | null })
                        .supervisorControlUserId;
                      if (sc !== undefined) {
                        monitor.updateSupervisorControl(sc ?? null);
                      }
                    }
                  }}
                />
              ) : null}
            </Box>
          </Box>
        </Box>
      ) : teamMode && !websiteId ? (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", py: 1.5, fontSize: 14, px: { xs: 0.5, md: 1 } }}
        >
          Select a website in Scope above to load its chat queue.
        </Typography>
      ) : null}
    </ChatLivePageShell>
  );
}
