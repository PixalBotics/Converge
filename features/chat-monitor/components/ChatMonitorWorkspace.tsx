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
  ChatLivePageHeader,
  ChatLivePageShell,
  ChatScopeFiltersPanel,
  ChatWebsiteAgentsTable,
  monitorRowMatchesScope,
  useChatScopeFilters,
  useChatWebsiteAgents,
  type ChatWebsiteAgentRow,
} from "@/features/chat-shared";
import { chatLiveQueueStatPillSx } from "@/features/chat-shared/styles/chat-live.styles";
import { useChatMonitor } from "../hooks/useChatMonitor";
import { MonitorQueueSidebar } from "./MonitorQueueSidebar";
import { MonitorTranscriptPanel } from "./MonitorTranscriptPanel";
import {
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
      departmentId: scopeFilters.filters.departmentId.trim() || undefined,
      poolId: scopeFilters.filters.poolId.trim() || undefined,
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
    if (!scopeFilters.filters.departmentId.trim() && row.departmentId) {
      scopeFilters.patchFilters({ departmentId: row.departmentId });
    }
  };

  const websiteLabel = scopeFilters.websiteOptions.find((w) => w.value === websiteId)?.label;

  return (
    <ChatLivePageShell variant="workstation">
      <ChatLivePageHeader
        title="Chat monitor"
        subtitle={
          monitorReadOnly
            ? "Read-only monitor — pick a website to see its queue, or narrow to one agent."
            : teamMode
              ? "Choose a website to load its chat queue. Optionally pick an agent to filter further."
              : "All live and closed chats in your monitor scope."
        }
        navPreset="triage"
        viewSwitch={{
          options: [
            { id: "team", label: "By website" },
            { id: "queue", label: "All chats" },
          ],
          value: viewMode,
          onChange: (id) => handleViewModeChange(id as MonitorViewMode),
          ariaLabel: "Monitor view",
        }}
        trailing={
          showMonitorPanels ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, justifyContent: "flex-end" }}>
              <Box sx={chatLiveQueueStatPillSx("active")}>Live {scopedLive.length}</Box>
              <Box sx={chatLiveQueueStatPillSx("closed")}>Closed {scopedClosed.length}</Box>
            </Box>
          ) : null
        }
      />

      {monitor.capabilitiesLoading ? (
        <Typography variant="caption" sx={{ color: "text.secondary", px: 0.5 }}>
          Loading monitor scope…
        </Typography>
      ) : null}

      {!monitor.capabilitiesLoading && !monitor.capabilities?.scopes?.length ? (
        <DashboardCard sx={{ p: 1.5, height: "auto", minHeight: 0, flexShrink: 0 }}>
          <Typography variant="caption" sx={{ color: "warning.main" }}>
            No monitor scope from the server yet. Assign pool/dept head, involvement users on Chat
            involvement, or monitor permissions.
          </Typography>
        </DashboardCard>
      ) : null}

      {teamMode && !websiteId ? (
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

      {teamMode && websiteId ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            flexShrink: 0,
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 13 }}>
            {websiteLabel ?? "Website"}
            {teamAgent
              ? ` · ${teamAgent.displayName}`
              : " · all agents on this site"}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {teamAgent ? (
              <Button type="button" variant="outlined" onClick={() => setTeamAgent(null)}>
                Clear agent filter
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
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

      {teamMode && websiteId ? (
        <ChatWebsiteAgentsTable
          rows={agentsQuery.rows}
          isLoading={agentsQuery.isLoading}
          isError={agentsQuery.isError}
          selectedAgentUserId={teamAgent?.userId}
          onSelectAgent={handlePickTeamAgent}
          websiteLabel={websiteLabel}
        />
      ) : null}

      {!teamMode && showScopeFilters ? (
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
            showDepartment
            showPool
            showStatus
            departmentOptions={departmentOptions}
            poolOptions={poolOptions}
            statusOptions={statusOptions}
            hint="Narrows the monitor queue. Department, pool, and status also sync to the server."
          />
        </DashboardCard>
      ) : null}

      {showMonitorPanels ? (
        <Box sx={chatMonitorWorkspaceShell}>
          {monitor.listsError ? (
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
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
            <Box data-monitor-pane="transcript">
              <MonitorTranscriptPanel
                conversation={monitor.selectedRow}
                messages={monitor.messages}
                visitor={monitor.visitorFromHistory}
                loading={monitor.transcriptLoading}
                currentUserId={user?.id ?? null}
                hasOperational={hasOperational}
                monitorReadOnly={monitorReadOnly}
                supervisorControlUserId={monitor.supervisorControlUserId}
                onSupervisorAction={() => {
                  if (monitor.selectedConversationId) {
                    void monitor.selectConversation(monitor.selectedConversationId);
                  }
                  void monitor.refreshLists();
                }}
                onMessageSent={() => {
                  if (monitor.selectedConversationId) {
                    void monitor.selectConversation(monitor.selectedConversationId);
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
      ) : teamMode && !websiteId ? (
        <Typography variant="body2" sx={{ color: "text.secondary", py: 1.5, fontSize: 14 }}>
          Select a website in Scope above to load its chat queue.
        </Typography>
      ) : null}
    </ChatLivePageShell>
  );
}
