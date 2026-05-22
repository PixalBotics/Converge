"use client";

import { useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { PermissionDeniedPanel } from "@/components/common";
import { buildChatLiveNavItems, useChatApiGates } from "@/lib/permissions";
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
  chatMonitorPageWrapper,
  chatMonitorWorkspaceGrid,
  chatMonitorWorkspaceShell,
} from "../styles/chat-monitor.styles";

export function ChatMonitorWorkspace({
  initialConversationId = null,
}: {
  initialConversationId?: string | null;
}) {
  const router = useRouter();
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

  const monitor = useChatMonitor(initialConversationId, { apiEnabled: monitorApiEnabled });

  const hasMonitorScope = (monitor.capabilities?.scopes?.length ?? 0) > 0;

  useEffect(() => {
    if (!monitorApiEnabled) return;
    monitor.setFilters({
      websiteId: scopeFilters.filters.websiteId.trim() || undefined,
      departmentId: scopeFilters.filters.departmentId.trim() || undefined,
      poolId: scopeFilters.filters.poolId.trim() || undefined,
      status: scopeFilters.filters.status.trim() || undefined,
    });
  }, [
    monitorApiEnabled,
    scopeFilters.filters.departmentId,
    scopeFilters.filters.poolId,
    scopeFilters.filters.status,
    scopeFilters.filters.websiteId,
    monitor.setFilters,
  ]);

  const matchScope = useMemo(
    () => (row: (typeof monitor.liveList)[number]) =>
      monitorRowMatchesScope(row, scopeFilters.filters, scopeFilters.websiteIdsInScope),
    [scopeFilters.filters, scopeFilters.websiteIdsInScope],
  );

  const scopedLive = useMemo(
    () => monitor.liveList.filter(matchScope),
    [matchScope, monitor.liveList],
  );
  const scopedClosed = useMemo(
    () => monitor.closedList.filter(matchScope),
    [matchScope, monitor.closedList],
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

  return (
    <Box sx={[chatMonitorPageWrapper, chatLivePageStackSx]}>
      <ChatLivePageHeader
        title="Chat monitor"
        subtitle="Scoped live and closed chats — pool/dept head, involvement roster, or platform monitor. Whisper or take direct control below."
        navItems={chatNavItems}
        trailing={
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, justifyContent: "flex-end" }}>
            <Box sx={chatLiveQueueStatPillSx("active")}>Live {scopedLive.length}</Box>
            <Box sx={chatLiveQueueStatPillSx("closed")}>Closed {scopedClosed.length}</Box>
          </Box>
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
            No monitor scope from the server yet. Assign pool/dept head, involvement supervisors on Chat involvement, or monitor permissions.
          </Typography>
        </DashboardCard>
      ) : null}
      {monitor.capabilities?.scopes?.length ? (
        <DashboardCard sx={{ p: 1.25, height: "auto", minHeight: 0, flexShrink: 0 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.75 }}>
            Your monitor scopes
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {monitor.capabilities.scopes.map((scope) => (
              <Typography
                key={`${scope.kind}-${(scope.departmentIds ?? scope.poolIds ?? scope.parentCompanyIds ?? []).join(",")}`}
                component="span"
                variant="caption"
                sx={chatLiveScopeChipSx}
              >
                {scope.kind}
              </Typography>
            ))}
          </Box>
        </DashboardCard>
      ) : null}
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
          hint="Reseller → parent → child → website narrows the monitor queue. Department, pool, and status sync to the server."
        />
      </DashboardCard>
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
    </Box>
  );
}
