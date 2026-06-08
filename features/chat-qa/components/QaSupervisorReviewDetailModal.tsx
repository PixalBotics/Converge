"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DataTable, FormModal, Typography } from "@/components/common";
import type { ChatMessage } from "@/services/chat/chat.types";
import type { QaReviewBundle, QaUserLabel } from "@/services/chat/qa.types";
import { qaUserLabel } from "../utils/qa-labels";
import {
  formatTs,
  qaUserDisplay,
  serviceChannelLabel,
  takeoverStatusLabel,
} from "../utils/qa-user-display";
import { QA_SESSION_CHECKLIST_KEYS } from "../utils/qa-session-review.shared";
import { useSupervisorQaReview } from "../hooks/useSupervisorQaReview";

type SlowRow = {
  id: string;
  delay: string;
  visitorMsg: string;
  agentMsg: string;
  visitorAt: string;
  agentAt: string;
};

type TakeoverRow = {
  id: string;
  status: string;
  requestedBy: string;
  targetAgent: string;
  approvedBy: string;
  at: string;
};

type TransferRow = {
  id: string;
  fromAgent: string;
  toAgent: string;
  at: string;
};

type TranscriptRow = {
  id: string;
  sender: string;
  content: string;
  at: string;
  lateTag: string;
};

function readUser(raw: unknown): QaUserLabel | null {
  if (!raw || typeof raw !== "object") return null;
  const u = raw as QaUserLabel;
  return u.id ? u : null;
}

interface QaSupervisorReviewDetailModalProps {
  open: boolean;
  conversationId: string | null;
  onClose: () => void;
}

export function QaSupervisorReviewDetailModal({
  open,
  conversationId,
  onClose,
}: QaSupervisorReviewDetailModalProps) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;
  const query = useSupervisorQaReview(conversationId, { enabled: open });
  const bundle = query.data ?? null;

  const slowRows = useMemo((): SlowRow[] => {
    const list = bundle?.responseMetrics?.slowReplies ?? [];
    return list.map((sr, i) => ({
      id: `${sr.agentMessageId}-${i}`,
      delay: `${sr.gapSeconds}s`,
      visitorMsg: sr.visitorPreview?.trim() || "—",
      agentMsg: sr.agentPreview?.trim() || "—",
      visitorAt: formatTs(sr.visitorAt),
      agentAt: formatTs(sr.agentAt),
    }));
  }, [bundle?.responseMetrics?.slowReplies]);

  const takeoverRows = useMemo((): TakeoverRow[] => {
    const list = (bundle?.timeline.takeoverRequests ?? []) as Array<Record<string, unknown>>;
    return list.map((t, i) => ({
      id: String(t.id ?? i),
      status: takeoverStatusLabel(t.status as string),
      requestedBy: qaUserDisplay(readUser(t.requestedBy)),
      targetAgent: qaUserDisplay(readUser(t.targetAgent)),
      approvedBy: qaUserDisplay(readUser(t.respondedBy)),
      at: formatTs(t.createdAt as string),
    }));
  }, [bundle?.timeline.takeoverRequests]);

  const transferRows = useMemo((): TransferRow[] => {
    const list = (bundle?.timeline.transfers ?? []) as Array<Record<string, unknown>>;
    return list.map((t, i) => ({
      id: String(t.id ?? i),
      fromAgent: qaUserDisplay(readUser(t.fromUser)),
      toAgent: qaUserDisplay(readUser(t.toUser)),
      at: formatTs(t.createdAt as string),
    }));
  }, [bundle?.timeline.transfers]);

  const lateAgentMessageIds = useMemo(() => {
    const ids = new Map<string, number>();
    for (const sr of bundle?.responseMetrics?.slowReplies ?? []) {
      ids.set(sr.agentMessageId, sr.gapSeconds);
    }
    return ids;
  }, [bundle?.responseMetrics?.slowReplies]);

  const transcriptRows = useMemo((): TranscriptRow[] => {
    const messages = (bundle?.transcript?.messages ?? []) as ChatMessage[];
    return messages.map((m) => {
      const gap = lateAgentMessageIds.get(m.id);
      return {
        id: m.id,
        sender: String(m.senderType ?? m.role ?? "—"),
        content: String(m.content ?? "").slice(0, 320) || "—",
        at: formatTs(String(m.createdAt ?? "")),
        lateTag: gap != null ? `Late reply · ${gap}s` : "",
      };
    });
  }, [bundle?.transcript?.messages, lateAgentMessageIds]);

  const summary = bundle?.sessionSummary;
  const review = bundle?.review;
  const checklist = (review?.checklistJson ?? {}) as Record<string, unknown>;

  const description = summary
    ? [
        summary.website?.label,
        summary.primaryAgent ? qaUserDisplay(summary.primaryAgent) : null,
        summary.pool?.name ? `Pool: ${summary.pool.name}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "Full QA review for supervisors — no QA inbox required.";

  return (
    <FormModal
      open={open}
      title="QA review detail"
      description={description}
      onClose={onClose}
      onSave={onClose}
      primaryButtonLabel="Close"
      showCancelButton={false}
      maxWidth={920}
      fitContent
    >
      {query.isLoading ? (
        <Typography sx={{ color: d.textMuted, py: 2 }}>Loading QA review…</Typography>
      ) : query.isError ? (
        <Typography sx={{ color: theme.palette.error.main, py: 2 }}>
          Could not load this QA review. It may be outside your scope or not yet completed.
        </Typography>
      ) : bundle ? (
        <QaSupervisorReviewBody
          bundle={bundle}
          slowRows={slowRows}
          takeoverRows={takeoverRows}
          transferRows={transferRows}
          transcriptRows={transcriptRows}
          checklist={checklist}
          review={review}
          summary={summary}
        />
      ) : null}
    </FormModal>
  );
}

function QaSupervisorReviewBody({
  bundle,
  slowRows,
  takeoverRows,
  transferRows,
  transcriptRows,
  checklist,
  review,
  summary,
}: {
  bundle: QaReviewBundle;
  slowRows: SlowRow[];
  takeoverRows: TakeoverRow[];
  transferRows: TransferRow[];
  transcriptRows: TranscriptRow[];
  checklist: Record<string, unknown>;
  review: QaReviewBundle["review"];
  summary: QaReviewBundle["sessionSummary"];
}) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;
  const metrics = bundle.responseMetrics;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {summary ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {summary.department?.name ? (
            <Chip size="small" label={`Dept: ${summary.department.name}`} sx={{ fontSize: 11 }} />
          ) : null}
          <Chip
            size="small"
            label={`Channel: ${serviceChannelLabel(summary.serviceChannel)}`}
            sx={{ fontSize: 11 }}
          />
          {summary.routingKey?.trim() ? (
            <Chip size="small" label={`Topic: ${summary.routingKey.trim()}`} sx={{ fontSize: 11 }} />
          ) : null}
        </Box>
      ) : null}

      <Box
        sx={{
          p: 1.5,
          borderRadius: 1.5,
          border: `1px solid ${alpha(d.cardBorder, 0.5)}`,
          bgcolor: alpha(d.accentBlue, 0.06),
        }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>
          QA scores
        </Typography>
        <Typography variant="caption" sx={{ color: d.textMuted, display: "block", lineHeight: 1.6 }}>
          Overall score: <strong>{review?.overallScore ?? "—"}</strong>
          {" · "}
          Stars: <strong>{review?.starRating ?? "—"}</strong>
          {" · "}
          QA reviewer: <strong>{qaUserLabel(review?.assignedQa)}</strong>
          {review?.completedAt
            ? ` · Submitted ${formatTs(review.completedAt)}`
            : ""}
        </Typography>
        {review?.failureReason?.trim() ? (
          <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: d.accentOrange }}>
            Issue: {review.failureReason.trim()}
          </Typography>
        ) : null}
        {review?.summary?.trim() ? (
          <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
            Summary: {review.summary.trim()}
          </Typography>
        ) : null}
        {review?.coachingNotes?.trim() ? (
          <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
            Coaching: {review.coachingNotes.trim()}
          </Typography>
        ) : null}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
          {QA_SESSION_CHECKLIST_KEYS.map((item) => (
            <Chip
              key={item.key}
              size="small"
              label={item.label}
              sx={{
                fontSize: 10,
                height: 22,
                bgcolor: alpha(
                  checklist[item.key] === true ? d.accentBlue : d.accentOrange,
                  0.12,
                ),
                color: checklist[item.key] === true ? d.accentBlue : d.accentOrange,
              }}
            />
          ))}
        </Box>
      </Box>

      {metrics ? (
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.75 }}>
            Late agent replies ({metrics.slowReplyCount}) — threshold {metrics.thresholdSeconds}s
          </Typography>
          {slowRows.length > 0 ? (
            <DataTable<SlowRow>
              columns={[
                { id: "delay", label: "Delay" },
                { id: "visitorMsg", label: "Visitor message" },
                { id: "agentMsg", label: "Agent reply (late)" },
                { id: "visitorAt", label: "Visitor at", cellVariant: "muted" },
                { id: "agentAt", label: "Agent at", cellVariant: "muted" },
              ]}
              rows={slowRows}
              size="small"
              minWidth={760}
              scrollY={false}
            />
          ) : (
            <Typography variant="caption" sx={{ color: d.textMuted }}>
              No late replies in this chat.
            </Typography>
          )}
        </Box>
      ) : null}

      {takeoverRows.length > 0 ? (
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.75 }}>
            Takeovers
          </Typography>
          <DataTable<TakeoverRow>
            columns={[
              { id: "status", label: "Status" },
              { id: "requestedBy", label: "Requested by" },
              { id: "targetAgent", label: "Target agent" },
              { id: "approvedBy", label: "Responded by", cellVariant: "muted" },
              { id: "at", label: "When", cellVariant: "muted" },
            ]}
            rows={takeoverRows}
            size="small"
            minWidth={640}
            scrollY={false}
          />
        </Box>
      ) : null}

      {transferRows.length > 0 ? (
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.75 }}>
            Transfers
          </Typography>
          <DataTable<TransferRow>
            columns={[
              { id: "fromAgent", label: "From" },
              { id: "toAgent", label: "To" },
              { id: "at", label: "When", cellVariant: "muted" },
            ]}
            rows={transferRows}
            size="small"
            minWidth={420}
            scrollY={false}
          />
        </Box>
      ) : null}

      <Box>
        <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.75 }}>
          Transcript (late replies marked)
        </Typography>
        <DataTable<TranscriptRow>
          columns={[
            { id: "at", label: "Time", cellVariant: "muted" },
            { id: "sender", label: "From" },
            {
              id: "lateTag",
              label: "Late",
              render: (v) =>
                v ? (
                  <Chip
                    size="small"
                    label={String(v)}
                    sx={{
                      height: 20,
                      fontSize: 10,
                      bgcolor: alpha(theme.app.dashboard.accentOrange, 0.15),
                      color: theme.app.dashboard.accentOrange,
                    }}
                  />
                ) : (
                  "—"
                ),
            },
            { id: "content", label: "Message" },
          ]}
          rows={transcriptRows}
          size="small"
          minWidth={720}
          scrollY={false}
        />
      </Box>
    </Box>
  );
}
