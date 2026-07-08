"use client";

import { useEffect, useMemo } from "react";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { useAuth } from "@/lib/auth";
import { PermissionDeniedPanel } from "@/components/common";
import { useChatApiGates } from "@/lib/permissions";
import { PAGE } from "@/lib/permissions/permission-constants";
import { OP } from "@/lib/permissions/operational-keys";
import { Button, Typography } from "@/components/common";
import { ChatLivePageShell } from "@/features/chat-shared";
import { chatLiveAgentStackSx } from "@/features/chat-shared/styles/chat-live.styles";
import { chatOpsWorkspaceShell } from "@/features/chat-operations/styles/chat-operations.styles";
import { MonitorTranscriptPanel } from "@/features/chat-monitor/components/MonitorTranscriptPanel";
import type { MonitorConversationRow } from "@/services/chat/monitor.types";
import type { TranscriptListItem } from "@/services/chat/transcript.types";
import { agentDisplayName } from "@/services/chat/monitor-normalizers";
import { extractVisitorPresentation } from "@/services/chat/visitor-presentation";
import { useChatTranscripts } from "../hooks/useChatTranscripts";
import type { TranscriptExportMeta } from "../utils/export-transcript";
import { TranscriptDownloadMenu } from "./TranscriptDownloadMenu";
import { TranscriptStatusChip } from "./TranscriptStatusChip";

function toMonitorRow(
  item: TranscriptListItem | null,
  conversationId: string,
  detail: ReturnType<typeof useChatTranscripts>["detail"],
): MonitorConversationRow | null {
  if (item) {
    return {
      id: item.id,
      websiteId: item.websiteId,
      visitorId: item.visitorId ?? "",
      agentId: item.agentId,
      status: item.status,
      routingKey: item.routingKey,
      serviceChannel: item.serviceChannel,
      visitorPresentation: item.visitorPresentation,
      childCompany: item.childCompany ?? null,
      parentCompany: item.parentCompany ?? null,
      agent: item.agent ?? null,
      department: item.department ?? null,
      pool: item.pool ?? null,
      startedAt: item.startedAt,
      endedAt: item.endedAt,
    };
  }
  if (!detail?.conversation) return null;
  const conv = detail.conversation as Record<string, unknown>;
  const tenant =
    conv.tenant && typeof conv.tenant === "object"
      ? (conv.tenant as Record<string, unknown>)
      : null;
  const pick = <T,>(key: string): T | null => {
    const fromTenant = tenant?.[key];
    const fromRoot = conv[key];
    const v =
      fromTenant && typeof fromTenant === "object"
        ? fromTenant
        : fromRoot && typeof fromRoot === "object"
          ? fromRoot
          : null;
    return v as T | null;
  };
  return {
    id: conversationId,
    websiteId: String(conv.websiteId ?? ""),
    visitorId: String(conv.visitorId ?? ""),
    agentId: (conv.agentId as string | null) ?? null,
    status: String(conv.status ?? ""),
    routingKey: (conv.routingKey as string | null) ?? null,
    serviceChannel: (conv.serviceChannel as string | null) ?? null,
    visitorPresentation: conv.visitorPresentation as MonitorConversationRow["visitorPresentation"],
    childCompany: pick<MonitorConversationRow["childCompany"]>("childCompany"),
    parentCompany: pick<MonitorConversationRow["parentCompany"]>("parentCompany"),
    agent: (conv.agent as MonitorConversationRow["agent"]) ?? null,
    department: (conv.department as MonitorConversationRow["department"]) ?? null,
    pool: (conv.pool as MonitorConversationRow["pool"]) ?? null,
    startedAt: conv.startedAt ? String(conv.startedAt) : undefined,
    endedAt: conv.endedAt ? String(conv.endedAt) : null,
  };
}

function readTenantName(
  conv: Record<string, unknown> | undefined,
  key: "reseller" | "parentCompany" | "childCompany" | "website",
  fallback?: TranscriptListItem | null,
): string {
  const tenant =
    conv?.tenant && typeof conv.tenant === "object"
      ? (conv.tenant as Record<string, unknown>)
      : null;
  const fromTenant = tenant?.[key];
  const fromRoot = conv?.[key];
  const source =
    (fromTenant && typeof fromTenant === "object" ? fromTenant : fromRoot) as
      | { name?: string; url?: string }
      | undefined;
  if (source?.name) return source.name;
  if (key === "website" && source?.url) return source.url;
  const fb = fallback?.[key];
  if (fb && typeof fb === "object") {
    if ("name" in fb && fb.name) return String(fb.name);
    if (key === "website" && "url" in fb && fb.url) return String(fb.url);
  }
  return "";
}

export function ChatTranscriptDetailWorkspace({
  conversationId,
}: {
  conversationId: string;
}) {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { user, hasOperational, hasPage, permissionsSyncing } = useAuth();
  const gates = useChatApiGates();
  const hasPageAccess =
    hasPage(PAGE.CHAT_TRANSCRIPTS) ||
    gates.monitor ||
    hasOperational(OP.qa.chatReview);
  const apiEnabled = gates.ready && hasPageAccess;

  const transcripts = useChatTranscripts(conversationId, { apiEnabled });

  useEffect(() => {
    if (conversationId) transcripts.selectConversation(conversationId);
  }, [conversationId, transcripts.selectConversation]);

  const monitorRow = useMemo(
    () => toMonitorRow(transcripts.selectedRow, conversationId, transcripts.detail),
    [conversationId, transcripts.detail, transcripts.selectedRow],
  );

  const visitorRecord =
    transcripts.detail?.visitor && typeof transcripts.detail.visitor === "object"
      ? (transcripts.detail.visitor as Record<string, unknown>)
      : null;

  const conv = transcripts.detail?.conversation as Record<string, unknown> | undefined;
  const vp = monitorRow ? extractVisitorPresentation(monitorRow) : null;
  const pageTitle =
    vp?.inboxTitle ||
    vp?.displayName ||
    transcripts.selectedRow?.visitorPresentation?.displayName ||
    "Conversation transcript";

  const tenantChips = [
    { label: "Reseller", value: readTenantName(conv, "reseller", transcripts.selectedRow) },
    { label: "Parent", value: readTenantName(conv, "parentCompany", transcripts.selectedRow) },
    { label: "Child", value: readTenantName(conv, "childCompany", transcripts.selectedRow) },
    { label: "Website", value: readTenantName(conv, "website", transcripts.selectedRow) },
  ].filter((item) => item.value);

  const resolvedAgentLabel =
    typeof conv?.resolvedAgentLabel === "string" && conv.resolvedAgentLabel.trim()
      ? conv.resolvedAgentLabel.trim()
      : transcripts.selectedRow?.resolvedAgentLabel?.trim() || null;

  const transcriptStatusRow = useMemo((): Pick<
    TranscriptListItem,
    | "transcriptStatus"
    | "status"
    | "closeBucket"
    | "closeOutcome"
    | "spamCategory"
    | "requiresDistributionForm"
    | "requiresDistributionSetup"
    | "distributionSubmitted"
    | "isMeaningfulChat"
  > => {
    const src = conv ?? transcripts.selectedRow;
    const str = (key: keyof TranscriptListItem): string | null =>
      typeof src?.[key] === "string" ? String(src[key]) : null;
    return {
      status: String(conv?.status ?? transcripts.selectedRow?.status ?? ""),
      transcriptStatus:
        str("transcriptStatus") ?? transcripts.selectedRow?.transcriptStatus ?? null,
      closeBucket: str("closeBucket") ?? transcripts.selectedRow?.closeBucket ?? null,
      closeOutcome: str("closeOutcome") ?? transcripts.selectedRow?.closeOutcome ?? null,
      spamCategory: str("spamCategory") ?? transcripts.selectedRow?.spamCategory ?? null,
      requiresDistributionForm: Boolean(
        conv?.requiresDistributionForm ?? transcripts.selectedRow?.requiresDistributionForm,
      ),
      requiresDistributionSetup: Boolean(
        conv?.requiresDistributionSetup ?? transcripts.selectedRow?.requiresDistributionSetup,
      ),
      distributionSubmitted: Boolean(
        conv?.distributionSubmitted ?? transcripts.selectedRow?.distributionSubmitted,
      ),
      isMeaningfulChat: Boolean(
        conv?.isMeaningfulChat ?? transcripts.selectedRow?.isMeaningfulChat,
      ),
    };
  }, [conv, transcripts.selectedRow]);

  const exportMeta = useMemo((): TranscriptExportMeta => {
    const agentLabel = monitorRow?.agent
      ? agentDisplayName(monitorRow.agent)
      : resolvedAgentLabel ?? undefined;
    return {
      title: pageTitle,
      conversationId,
      agent: agentLabel,
      website: readTenantName(conv, "website", transcripts.selectedRow) || undefined,
      status:
        transcriptStatusRow.transcriptStatus?.trim() ||
        transcriptStatusRow.status ||
        undefined,
      startedAt:
        monitorRow?.startedAt ??
        (typeof conv?.startedAt === "string" ? conv.startedAt : undefined),
      endedAt:
        monitorRow?.endedAt ??
        (typeof conv?.endedAt === "string" ? conv.endedAt : undefined) ??
        undefined,
      reseller: readTenantName(conv, "reseller", transcripts.selectedRow) || undefined,
      parentCompany:
        readTenantName(conv, "parentCompany", transcripts.selectedRow) || undefined,
      childCompany: readTenantName(conv, "childCompany", transcripts.selectedRow) || undefined,
    };
  }, [
    conv,
    conversationId,
    monitorRow,
    pageTitle,
    resolvedAgentLabel,
    transcriptStatusRow.status,
    transcriptStatusRow.transcriptStatus,
    transcripts.selectedRow,
  ]);

  if (!permissionsSyncing && !hasPageAccess) {
    return (
      <PermissionDeniedPanel
        title="Chat transcript"
        description="Requires page:chat-monitor, page:chat-qa, or chat monitor / QA permissions."
      />
    );
  }

  return (
    <ChatLivePageShell variant="workstation" sx={chatLiveAgentStackSx}>
      <Box
        sx={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 1,
          px: { xs: 1, md: 1.5 },
          pt: { xs: 0.5, md: 0.75 },
          pb: 1,
        }}
      >
        <Button
          type="button"
          variant="secondary"
          size="compact"
          startIcon={<ArrowBackRounded sx={{ fontSize: 18 }} />}
          onClick={() => router.push("/dashboard/chat-transcripts")}
        >
          Back
        </Button>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1.25,
            width: "100%",
            minWidth: 0,
          }}
        >
          <Box sx={{ minWidth: 0, flex: "1 1 200px" }}>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.25 }}>
              {pageTitle}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              Archived conversation · {conversationId.slice(0, 8)}…
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexShrink: 0, flexWrap: "wrap", gap: 1, justifyContent: "flex-end" }}>
            {monitorRow?.agent ? (
              <Chip
                size="small"
                label={`Agent: ${agentDisplayName(monitorRow.agent)}`}
                sx={{ fontWeight: 600 }}
              />
            ) : resolvedAgentLabel ? (
              <Chip
                size="small"
                label={`Agent: ${resolvedAgentLabel}`}
                sx={{ fontWeight: 600 }}
              />
            ) : null}
            <TranscriptStatusChip row={transcriptStatusRow} />
            <TranscriptDownloadMenu
              messages={transcripts.detail?.messages ?? []}
              meta={exportMeta}
              disabled={transcripts.detailLoading || Boolean(transcripts.detailError)}
            />
          </Box>
        </Box>
      </Box>

      {(tenantChips.length > 0 || transcripts.detail?.participants?.length) ? (
        <Box
          sx={{
            flexShrink: 0,
            px: { xs: 1, md: 1.5 },
            pb: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: 0.75,
            alignItems: "center",
          }}
        >
          {tenantChips.map((item) => (
            <Chip
              key={item.label}
              size="small"
              variant="outlined"
              label={`${item.label}: ${item.value}`}
              sx={{ maxWidth: "100%" }}
            />
          ))}
          {transcripts.detail?.participants?.map((p) => (
            <Chip
              key={`${p.role}-${p.userId ?? p.label}`}
              size="small"
              variant="outlined"
              label={
                p.messageCount != null && p.messageCount > 0
                  ? `${p.label} · ${p.messageCount} msgs`
                  : `${p.label} (${p.role})`
              }
            />
          ))}
        </Box>
      ) : null}

      <Box sx={chatOpsWorkspaceShell}>
        <MonitorTranscriptPanel
          layout="archive"
          conversation={monitorRow}
          messages={transcripts.detail?.messages ?? []}
          visitor={visitorRecord}
          loading={transcripts.detailLoading}
          loadError={
            transcripts.detailError
              ? "Could not load transcript detail."
              : !transcripts.detailLoading && !transcripts.detail
                ? "Transcript not found or access denied."
                : null
          }
          currentUserId={user?.id ?? null}
          hasOperational={hasOperational}
          monitorReadOnly
        />
      </Box>
    </ChatLivePageShell>
  );
}
