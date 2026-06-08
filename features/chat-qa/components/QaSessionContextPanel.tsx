"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DataTable, Typography } from "@/components/common";
import type { QaReviewBundle, QaUserLabel } from "@/services/chat/qa.types";
import { ScrollRegion } from "@/features/chat-operations/styles/chat-operations.styled";
import {
  formatTs,
  qaUserDisplay,
  serviceChannelLabel,
  takeoverStatusLabel,
} from "../utils/qa-user-display";
import { QaSlowRepliesModal } from "./QaSlowRepliesModal";

type TakeoverRow = {
  id: string;
  status: string;
  requestedBy: string;
  targetAgent: string;
  approvedBy: string;
  requestedAt: string;
  respondedAt: string;
};

type TransferRow = {
  id: string;
  fromAgent: string;
  toAgent: string;
  transferredAt: string;
};

type AssignmentRow = {
  id: string;
  agent: string;
  rank: string;
  status: string;
  assignedAt: string;
};

function readUser(raw: unknown): QaUserLabel | null {
  if (!raw || typeof raw !== "object") return null;
  const u = raw as QaUserLabel;
  return u.id ? u : null;
}

interface QaSessionContextPanelProps {
  bundle: QaReviewBundle | null;
}

export function QaSessionContextPanel({ bundle }: QaSessionContextPanelProps) {
  const theme = useTheme() as AppTheme;
  const [slowOpen, setSlowOpen] = useState(false);

  const summary = bundle?.sessionSummary ?? null;
  const metrics = bundle?.responseMetrics ?? null;

  const takeoverRows = useMemo((): TakeoverRow[] => {
    const list = (bundle?.timeline.takeoverRequests ?? []) as Array<Record<string, unknown>>;
    return list.map((t, i) => ({
      id: String(t.id ?? i),
      status: takeoverStatusLabel(t.status as string),
      requestedBy: qaUserDisplay(readUser(t.requestedBy)),
      targetAgent: qaUserDisplay(readUser(t.targetAgent)),
      approvedBy: qaUserDisplay(readUser(t.respondedBy)),
      requestedAt: formatTs(t.createdAt as string),
      respondedAt: formatTs(t.respondedAt as string),
    }));
  }, [bundle?.timeline.takeoverRequests]);

  const transferRows = useMemo((): TransferRow[] => {
    const list = (bundle?.timeline.transfers ?? []) as Array<Record<string, unknown>>;
    return list.map((t, i) => ({
      id: String(t.id ?? i),
      fromAgent: qaUserDisplay(readUser(t.fromUser)),
      toAgent: qaUserDisplay(readUser(t.toUser)),
      transferredAt: formatTs(t.createdAt as string),
    }));
  }, [bundle?.timeline.transfers]);

  const assignmentRows = useMemo((): AssignmentRow[] => {
    const list = (bundle?.timeline.assignments ?? []) as Array<Record<string, unknown>>;
    return list.map((a, i) => ({
      id: String(a.id ?? i),
      agent: qaUserDisplay(readUser(a.agent)),
      rank: String(a.rank ?? "—"),
      status: String(a.status ?? "—"),
      assignedAt: formatTs(a.assignedAt as string),
    }));
  }, [bundle?.timeline.assignments]);

  if (!bundle) return null;

  const d = theme.app.dashboard;
  const hasSlow = (metrics?.slowReplyCount ?? 0) > 0;

  return (
    <>
      <ScrollRegion
        sx={{
          flexShrink: 0,
          maxHeight: "42vh",
          px: 2,
          py: 1.5,
          borderTop: `1px solid ${alpha(d.cardBorder, 0.35)}`,
        }}
      >
        <Typography fontWeight={700} sx={{ fontSize: 13, mb: 1 }}>
          Session context
        </Typography>

        {summary ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
            {summary.website?.label ? (
              <Chip size="small" label={`Site: ${summary.website.label}`} sx={{ fontSize: 11 }} />
            ) : null}
            {summary.pool?.name ? (
              <Chip size="small" label={`Pool: ${summary.pool.name}`} sx={{ fontSize: 11 }} />
            ) : null}
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
            {summary.primaryAgent ? (
              <Chip
                size="small"
                label={`Agent: ${qaUserDisplay(summary.primaryAgent)}`}
                sx={{ fontSize: 11 }}
              />
            ) : null}
          </Box>
        ) : null}

        {metrics ? (
          <Box
            sx={{
              mb: 1.5,
              p: 1.25,
              borderRadius: 1.5,
              bgcolor: alpha(hasSlow ? d.accentOrange : d.accentBlue, 0.08),
              border: `1px solid ${alpha(hasSlow ? d.accentOrange : d.accentBlue, 0.25)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, display: "block" }}>
                Response timing
              </Typography>
              <Typography variant="caption" sx={{ color: d.textMuted, lineHeight: 1.55 }}>
                Avg {metrics.avgReplySeconds ?? "—"}s · Max {metrics.maxReplySeconds ?? "—"}s · Slow (
                {">"}
                {metrics.thresholdSeconds}s): <strong>{metrics.slowReplyCount}</strong>
              </Typography>
            </Box>
            {hasSlow ? (
              <Button type="button" variant="outlined" size="small" onClick={() => setSlowOpen(true)}>
                View late replies
              </Button>
            ) : null}
          </Box>
        ) : null}

        {takeoverRows.length > 0 ? (
          <Box sx={{ mb: 1.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.75 }}>
              Takeovers ({takeoverRows.length})
            </Typography>
            <DataTable<TakeoverRow>
              columns={[
                { id: "status", label: "Status" },
                { id: "requestedBy", label: "Requested by" },
                { id: "targetAgent", label: "Target agent" },
                { id: "approvedBy", label: "Approved / rejected by", cellVariant: "muted" },
                { id: "requestedAt", label: "Requested", cellVariant: "muted" },
              ]}
              rows={takeoverRows}
              size="small"
              minWidth={640}
            />
          </Box>
        ) : null}

        {transferRows.length > 0 ? (
          <Box sx={{ mb: 1.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.75 }}>
              Transfers ({transferRows.length})
            </Typography>
            <DataTable<TransferRow>
              columns={[
                { id: "fromAgent", label: "From" },
                { id: "toAgent", label: "To" },
                { id: "transferredAt", label: "When", cellVariant: "muted" },
              ]}
              rows={transferRows}
              size="small"
              minWidth={420}
            />
          </Box>
        ) : null}

        {assignmentRows.length > 0 ? (
          <Box sx={{ mb: 1.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.75 }}>
              Agent assignments ({assignmentRows.length})
            </Typography>
            <DataTable<AssignmentRow>
              columns={[
                { id: "agent", label: "Agent" },
                { id: "rank", label: "Rank" },
                { id: "status", label: "Status", cellVariant: "muted" },
                { id: "assignedAt", label: "Assigned", cellVariant: "muted" },
              ]}
              rows={assignmentRows}
              size="small"
              minWidth={480}
            />
          </Box>
        ) : null}

        {bundle.segments?.segments?.length ? (
          <Box sx={{ mb: 1 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.5 }}>
              Takeover segments
            </Typography>
            {bundle.segments.takeoverBoundaryAt ? (
              <Typography variant="caption" sx={{ color: d.textMuted, display: "block", mb: 0.5 }}>
                Boundary: {formatTs(bundle.segments.takeoverBoundaryAt)}
              </Typography>
            ) : null}
            {bundle.segments.segments.map((seg) => (
              <Typography key={seg.key} variant="caption" sx={{ display: "block", mb: 0.35 }}>
                {seg.label} — {seg.messageCount} messages
              </Typography>
            ))}
          </Box>
        ) : null}

        {!takeoverRows.length && !transferRows.length && !assignmentRows.length && !summary ? (
          <Typography variant="caption" sx={{ color: d.textMuted }}>
            No takeover, transfer, or assignment history for this chat.
          </Typography>
        ) : null}
      </ScrollRegion>

      {metrics && hasSlow ? (
        <QaSlowRepliesModal
          open={slowOpen}
          onClose={() => setSlowOpen(false)}
          metrics={metrics}
          sessionSummary={summary}
        />
      ) : null}
    </>
  );
}
