"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import type { AppTheme } from "@/theme/theme";
import { useAuth } from "@/lib/auth";
import { PermissionDeniedPanel } from "@/components/common";
import {
  buildChatLiveNavItems,
  needsChatScopeFilters,
  useChatApiGates,
} from "@/lib/permissions";
import { PAGE } from "@/lib/permissions/permission-constants";
import { OP } from "@/lib/permissions/operational-keys";
import { Button, DashboardCard, Typography } from "@/components/common";
import {
  ChatLivePageHeader,
  ChatScopeFiltersPanel,
  monitorRowMatchesScope,
  useChatScopeFilters,
} from "@/features/chat-shared";
import {
  chatLivePageStackSx,
  chatLiveQueueStatPillSx,
  chatLiveScopeChipSx,
} from "@/features/chat-shared/styles/chat-live.styles";
import { useChatMonitor } from "../hooks/useChatMonitor";
import { MonitorQueueSidebar } from "./MonitorQueueSidebar";
import { MonitorTranscriptPanel } from "./MonitorTranscriptPanel";
import {
  MonitorDirectoryNavigator,
  type MonitorDirectorySelection,
} from "./MonitorDirectoryNavigator";
import {
  chatMonitorInboxTabSx,
  chatMonitorInboxTabsRow,
  chatMonitorPageWrapper,
  chatMonitorWorkspaceGrid,
  chatMonitorWorkspaceShell,
} from "../styles/chat-monitor.styles";

type MonitorViewMode = "queue" | "by_agent";

export function ChatMonitorWorkspace({
  initialConversationId = null,
}: {
  initialConversationId?: string | null;
}) {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { user, hasOperational, hasPage, permissionsSyncing } = useAuth();
  const gates = useChatApiGates();
  const hasChatPage = hasPage(PAGE.CHAT);
  const hasMonitorPerm =
    gates.monitor ||
    hasOperational(OP.chat.monitorInvolvement) ||
    hasOperational(OP.chat.monitorPool) ||
    hasOperational(OP.chat.monitorDepartment) ||
    hasOperational(OP.chat.monitorParentCompany);
  const chatNavItems = useMemo(
    () => buildChatLiveNavItems(hasPage, hasOperational),
    [hasPage, hasOperational],
  );
  const monitorApiEnabled = gates.ready && hasChatPage;
  const scopeFilters = useChatScopeFilters(undefined, { apiEnabled: monitorApiEnabled });
  const showScopeFilters = needsChatScopeFilters(
    hasOperational,
    scopeFilters.canFilterByResellerId,
  );

  const [viewMode, setViewMode] = useState<MonitorViewMode>("queue");
  const [directorySelection, setDirectorySelection] =
    useState<MonitorDirectorySelection | null>(null);

  const monitor = useChatMonitor(initialConversationId, { apiEnabled: monitorApiEnabled });

  const hasMonitorScope = (monitor.capabilities?.scopes?.length ?? 0) > 0;
  const monitorReadOnly = monitor.capabilities?.readOnly ?? false;
  const byAgentMode = viewMode === "by_agent";
  const agentFilterActive = byAgentMode && Boolean(directorySelection?.agentUserId);

  useEffect(() => {
    if (initialConversationId) setViewMode("queue");
  }, [initialConversationId]);

  useEffect(() => {
    if (!monitorApiEnabled) return;
    monitor.setFilters({
      websiteId: byAgentMode
        ? directorySelection?.websiteId ||
          scopeFilters.filters.websiteId.trim() ||
          undefined
        : scopeFilters.filters.websiteId.trim() || undefined,
      departmentId: byAgentMode
        ? directorySelection?.departmentId ||
          scopeFilters.filters.departmentId.trim() ||
          undefined
        : scopeFilters.filters.departmentId.trim() || undefined,
      poolId: byAgentMode
        ? directorySelection?.poolId || scopeFilters.filters.poolId.trim() || undefined
        : scopeFilters.filters.poolId.trim() || undefined,
      status: scopeFilters.filters.status.trim() || undefined,
      agentId: agentFilterActive ? directorySelection?.agentUserId : undefined,
    });
  }, [
    monitorApiEnabled,
    byAgentMode,
    agentFilterActive,
    directorySelection?.agentUserId,
    directorySelection?.websiteId,
    directorySelection?.departmentId,
    directorySelection?.poolId,
    scopeFilters.filters.departmentId,
    scopeFilters.filters.poolId,
    scopeFilters.filters.status,
    scopeFilters.filters.websiteId,
    monitor.setFilters,
  ]);

  const applyClientScopeFilter = !byAgentMode && showScopeFilters;

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
    Boolean(directorySelection?.agentUserId);

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
      setDirectorySelection(null);
    }
  };

  return (
    <Box sx={[chatMonitorPageWrapper, chatLivePageStackSx]}>
      <ChatLivePageHeader
        title="Chat monitor"
        subtitle={
          monitorReadOnly
            ? "Read-only monitor — view live and closed chats in your scope."
            : byAgentMode
              ? "Pick an agent in the directory, then open their chats. Switch to Live queue for all scoped chats."
              : "All live and closed chats in your scope. Use By agent to drill into one user."
        }
        navItems={chatNavItems}
        trailing={
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, justifyContent: "flex-end" }}>
            <Box sx={chatLiveQueueStatPillSx("active")}>Live {scopedLive.length}</Box>
            <Box sx={chatLiveQueueStatPillSx("closed")}>Closed {scopedClosed.length}</Box>
          </Box>
        }
      />

      <DashboardCard sx={{ flexShrink: 0, p: { xs: 1, md: 1.25 }, height: "auto", minHeight: 0 }}>
        <Box sx={chatMonitorInboxTabsRow}>
          <Box
            component="button"
            type="button"
            onClick={() => handleViewModeChange("queue")}
            sx={chatMonitorInboxTabSx(theme, viewMode === "queue")}
          >
            Live queue
          </Box>
          <Box
            component="button"
            type="button"
            onClick={() => handleViewModeChange("by_agent")}
            sx={chatMonitorInboxTabSx(theme, viewMode === "by_agent")}
          >
            By agent
          </Box>
        </Box>
      </DashboardCard>

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

      {viewMode === "queue" && showScopeFilters ? (
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

      {byAgentMode ? (
        <MonitorDirectoryNavigator
          capabilities={monitor.capabilities}
          apiEnabled={monitorApiEnabled && capabilitiesReady(monitor)}
          selection={directorySelection}
          onSelectAgent={setDirectorySelection}
        />
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
                  agentFilterActive && directorySelection
                    ? `${directorySelection.agentDisplayName} · ${directorySelection.agentEmail}`
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
      ) : (
        <DashboardCard sx={{ p: 2, height: "auto", minHeight: 0 }}>
          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
            Select an agent in the directory above to load their chats, or switch to{" "}
            <strong>Live queue</strong> to see all conversations in your scope.
          </Typography>
        </DashboardCard>
      )}
    </Box>
  );
}

function capabilitiesReady(monitor: ReturnType<typeof useChatMonitor>): boolean {
  return Boolean(monitor.capabilities && !monitor.capabilitiesLoading);
}
