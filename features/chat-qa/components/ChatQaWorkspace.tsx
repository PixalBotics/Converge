"use client";

import { useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  canAccessChatQa,
  canAnnotateQaMessage,
  canAssignQaReview,
  canReviewQaSession,
} from "@/lib/permissions/chat-access";
import { Button, Typography } from "@/components/common";
import {
  ChatLivePageHeader,
  ChatScopeFiltersPanel,
  qaRowMatchesScope,
  useChatScopeFilters,
} from "@/features/chat-shared";
import { chatLiveFilterCardSx, chatLivePageStackSx } from "@/features/chat-shared/styles/chat-live.styles";
import { useChatQa } from "../hooks/useChatQa";
import { QaQueueSidebar } from "./QaQueueSidebar";
import { QaAnnotatedTranscript } from "./QaAnnotatedTranscript";
import { QaSessionReviewPanel } from "./QaSessionReviewPanel";
import { QaTimelinePanel } from "./QaTimelinePanel";
import {
  chatQaPageWrapper,
  chatQaWorkspaceGrid,
  chatQaWorkspaceShell,
} from "../styles/chat-qa.styles";

export function ChatQaWorkspace({
  initialConversationId = null,
}: {
  initialConversationId?: string | null;
}) {
  const router = useRouter();
  const { hasOperational } = useAuth();
  const allowed = canAccessChatQa(hasOperational);
  const scopeFilters = useChatScopeFilters();

  const qa = useChatQa(initialConversationId);

  useEffect(() => {
    if (!allowed) {
      router.replace("/dashboard/chat-operations");
    }
  }, [allowed, router]);

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

  if (!allowed) {
    return (
      <Typography sx={{ py: 4 }}>You do not have QA permissions. Redirecting…</Typography>
    );
  }

  if (!qa.token) {
    return <Typography sx={{ py: 4 }}>Sign in to open the QA inbox.</Typography>;
  }

  const handleSelect = (id: string) => {
    qa.selectConversation(id);
    router.replace(`/dashboard/chat-qa/${encodeURIComponent(id)}`, { scroll: false });
  };

  return (
    <Box sx={[chatQaPageWrapper, chatLivePageStackSx]}>
      <ChatLivePageHeader
        title="QA inbox"
        subtitle="Review closed conversations, annotate messages, and score sessions."
      />
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
          hint="Filter reviews by organization and website. Status tabs apply on top of these filters."
        />
      </Box>
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

          <Box data-qa-pane="review" sx={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <QaSessionReviewPanel
              bundle={qa.bundle}
              canEdit={canReviewQaSession(hasOperational)}
              canAssign={canAssignQaReview(hasOperational)}
              onSave={qa.saveSessionReview}
              onClaim={qa.claimReview}
              saving={qa.bundleLoading}
            />
            <QaTimelinePanel bundle={qa.bundle} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
