"use client";

import { useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { canAccessChatMonitor } from "@/lib/permissions/chat-access";
import { Button, Typography } from "@/components/common";
import {
  ChatLivePageHeader,
  ChatScopeFiltersPanel,
  monitorRowMatchesScope,
  useChatScopeFilters,
} from "@/features/chat-shared";
import { chatLiveFilterCardSx, chatLivePageStackSx } from "@/features/chat-shared/styles/chat-live.styles";
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
  const { hasOperational } = useAuth();
  const allowed = canAccessChatMonitor(hasOperational);
  const scopeFilters = useChatScopeFilters();

  const monitor = useChatMonitor(initialConversationId);

  useEffect(() => {
    if (!allowed) {
      router.replace("/dashboard/chat-operations");
    }
  }, [allowed, router]);

  useEffect(() => {
    monitor.setFilters({
      websiteId: scopeFilters.filters.websiteId.trim() || undefined,
      departmentId: scopeFilters.filters.departmentId.trim() || undefined,
      poolId: scopeFilters.filters.poolId.trim() || undefined,
      status: scopeFilters.filters.status.trim() || undefined,
    });
  }, [
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

  if (!allowed) {
    return (
      <Typography sx={{ py: 4 }}>
        You do not have monitor permissions. Redirecting to inbox…
      </Typography>
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
        subtitle="Read-only view of live and closed conversations across your assigned scope."
      />
      {monitor.capabilities?.scopes?.length ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, px: 0.5 }}>
          {monitor.capabilities.scopes.map((scope) => (
            <Typography
              key={`${scope.kind}-${(scope.departmentIds ?? scope.poolIds ?? scope.parentCompanyIds ?? []).join(",")}`}
              variant="caption"
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 1,
                bgcolor: "rgba(96,165,250,0.12)",
                color: "primary.main",
                fontSize: 11,
              }}
            >
              {scope.kind}
            </Typography>
          ))}
        </Box>
      ) : null}
      <Box sx={chatLiveFilterCardSx}>
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
      </Box>
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
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
