"use client";

import { useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { PermissionDeniedPanel } from "@/components/common";
import {
  canAnnotateQaMessage,
  canAssignQaReview,
  canReviewQaSession,
  useChatApiGates,
} from "@/lib/permissions";
import { Button, DashboardCard, Typography } from "@/components/common";
import {
  ChatLivePageHeader,
  ChatLivePageShell,
  ChatScopeFiltersPanel,
  qaRowMatchesScope,
  useChatScopeFilters,
} from "@/features/chat-shared";
import { chatLiveQueueStatPillSx } from "@/features/chat-shared/styles/chat-live.styles";
import { useChatQa } from "../hooks/useChatQa";
import { QaQueueSidebar } from "./QaQueueSidebar";
import { QaAnnotatedTranscript } from "./QaAnnotatedTranscript";
import { QaSessionReviewPanel } from "./QaSessionReviewPanel";
import { QaSessionContextPanel } from "./QaSessionContextPanel";
import { useQaRosterQuery } from "@/features/chat-settings/hooks/useChatSettings";
import { chatQaWorkspaceGrid, chatQaWorkspaceShell } from "../styles/chat-qa.styles";
import { QA_HUB_BASE } from "@/features/chat-qa/constants/qa-nav";

export function ChatQaWorkspace({
  initialConversationId = null,
}: {
  initialConversationId?: string | null;
}) {
  const router = useRouter();
  const { hasOperational, permissionsSyncing, user } = useAuth();
  const gates = useChatApiGates();
  const allowed = gates.qa;
  const scopeFilters = useChatScopeFilters(undefined, { apiEnabled: allowed });

  const qa = useChatQa(initialConversationId, { apiEnabled: allowed });

  useEffect(() => {
    if (!permissionsSyncing && !allowed) {
      router.replace("/dashboard/chat-operations");
    }
  }, [allowed, permissionsSyncing, router]);

  useEffect(() => {
    qa.setFilters((prev) => ({
      ...prev,
      websiteId: scopeFilters.filters.websiteId.trim() || undefined,
    }));
  }, [scopeFilters.filters.websiteId, qa.setFilters]);

  const scopedQueue = useMemo(
    () =>
      qa.queue.filter((row) =>
        qaRowMatchesScope(row, scopeFilters.filters, scopeFilters.websiteIdsInScope),
      ),
    [qa.queue, scopeFilters.filters, scopeFilters.websiteIdsInScope],
  );

  if (!permissionsSyncing && !allowed) {
    return (
      <PermissionDeniedPanel
        title="QA inbox not available"
        description="Requires page:chat and qa:chat:review (or related QA codes) from /auth/me."
      />
    );
  }

  if (permissionsSyncing || !allowed) {
    return <Typography sx={{ py: 4 }}>Loading permissions…</Typography>;
  }

  if (!qa.token) {
    return <Typography sx={{ py: 4 }}>Sign in to open the QA inbox.</Typography>;
  }

  const rosterWebsiteId = useMemo(() => {
    const fromReview = qa.bundle?.review?.websiteId?.trim();
    if (fromReview) return fromReview;
    const row = qa.queue.find((r) => r.conversationId === qa.selectedConversationId);
    if (row?.websiteId?.trim()) return row.websiteId.trim();
    const transcript = qa.bundle?.transcript as { websiteId?: string } | undefined;
    return transcript?.websiteId?.trim() ?? "";
  }, [qa.bundle?.review?.websiteId, qa.bundle?.transcript, qa.queue, qa.selectedConversationId]);

  const rosterQuery = useQaRosterQuery(
    rosterWebsiteId,
    Boolean(rosterWebsiteId) && canAssignQaReview(hasOperational),
  );

  const rosterAssignOptions = useMemo(() => {
    const channel = String(qa.bundle?.review?.serviceChannel ?? qa.bundle?.transcript?.serviceChannel ?? "internal")
      .toLowerCase();
    const list = channel === "external" ? rosterQuery.data?.external : rosterQuery.data?.internal;
    return (list ?? []).map((r) => ({
      id: r.userId,
      label: [r.user?.firstName, r.user?.lastName].filter(Boolean).join(" ").trim() || r.user?.email || r.userId.slice(0, 8),
    }));
  }, [qa.bundle?.review?.serviceChannel, qa.bundle?.transcript, rosterQuery.data]);

  const handleSelect = (id: string) => {
    qa.selectConversation(id);
    router.replace(`${QA_HUB_BASE}/inbox/${encodeURIComponent(id)}`, { scroll: false });
  };

  return (
    <ChatLivePageShell variant="workstation">
      <ChatLivePageHeader
        title="QA inbox"
        subtitle="Closed chats land in your queue. Read the transcript, score the session, then submit the QA report."
        navPreset="triage"
        trailing={
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, justifyContent: "flex-end" }}>
            <Box sx={chatLiveQueueStatPillSx("waiting")}>
              Pending {qa.statusCounts.pending}
            </Box>
            <Box sx={chatLiveQueueStatPillSx("active")}>
              In progress {qa.statusCounts.in_progress}
            </Box>
            <Box sx={chatLiveQueueStatPillSx("closed")}>
              Done {qa.statusCounts.completed}
            </Box>
          </Box>
        }
      />
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
          hint="Filter reviews by organization and website. Status tabs apply on top of these filters."
        />
      </DashboardCard>
      <Box sx={chatQaWorkspaceShell}>
        {qa.queueError ? (
          <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <Typography color="error">Could not load QA queue.</Typography>
            <Button type="button" variant="outlined" onClick={() => void qa.refreshQueue()}>
              Retry
            </Button>
          </Box>
        ) : null}
        <Box sx={chatQaWorkspaceGrid}>
          <Box data-qa-pane="queue">
            <QaQueueSidebar
              statusTab={qa.statusTab}
              onStatusTabChange={qa.setStatusTab}
              queue={scopedQueue}
              selectedConversationId={qa.selectedConversationId}
              onSelectConversation={handleSelect}
              loading={qa.queueLoading}
              filters={qa.filters}
              onFiltersChange={qa.setFilters}
              statusCounts={qa.statusCounts}
            />
          </Box>

          <Box data-qa-pane="transcript">
            <QaAnnotatedTranscript
              bundle={qa.bundle}
              messages={qa.messages}
              visitor={qa.visitorFromHistory}
              loading={qa.bundleLoading}
              canAnnotate={canAnnotateQaMessage(hasOperational)}
              annotationsByMessageId={qa.annotationsByMessageId}
              onSaveAnnotation={qa.saveMessageAnnotation}
              saving={qa.bundleLoading}
            />
          </Box>

          <Box
            data-qa-pane="review"
            sx={{ display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0, height: "100%" }}
          >
            <QaSessionReviewPanel
              bundle={qa.bundle}
              canEdit={canReviewQaSession(hasOperational)}
              canAssign={canAssignQaReview(hasOperational)}
              currentUserId={user?.id ?? null}
              rosterAssignOptions={rosterAssignOptions}
              onSave={qa.saveSessionReview}
              onClaim={qa.claimReview}
              onAssignTo={qa.assignReviewTo}
              saving={qa.bundleLoading}
            />
            <QaSessionContextPanel bundle={qa.bundle} />
          </Box>
        </Box>
      </Box>
    </ChatLivePageShell>
  );
}
