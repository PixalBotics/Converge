"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DataTable, FormModal, Typography } from "@/components/common";
import type { QaResponseMetrics, QaSessionSummary } from "@/services/chat/qa.types";
import { qaUserLabel } from "../utils/qa-labels";
import { formatTs } from "../utils/qa-user-display";

type SlowReplyRow = {
  id: string;
  gapSeconds: number;
  visitorAt: string;
  agentAt: string;
};

interface QaSlowRepliesModalProps {
  open: boolean;
  onClose: () => void;
  metrics: QaResponseMetrics;
  sessionSummary?: QaSessionSummary | null;
}

export function QaSlowRepliesModal({
  open,
  onClose,
  metrics,
  sessionSummary,
}: QaSlowRepliesModalProps) {
  const theme = useTheme() as AppTheme;
  const agent = sessionSummary?.primaryAgent;
  const agentId = agent?.id ?? "";
  const agentName = qaUserLabel(agent);
  const websiteLabel = sessionSummary?.website?.label ?? "—";
  const websiteId = sessionSummary?.website?.id ?? "";

  const rows: SlowReplyRow[] = metrics.slowReplies.map((r, i) => ({
    id: `${r.visitorMessageId}-${i}`,
    gapSeconds: r.gapSeconds,
    visitorAt: r.visitorAt,
    agentAt: r.agentAt,
  }));

  const reportHref =
    agentId || websiteId
      ? `/dashboard/qa/team-quality?${[
          agentId ? `agentId=${encodeURIComponent(agentId)}` : "",
          websiteId ? `websiteId=${encodeURIComponent(websiteId)}` : "",
        ]
          .filter(Boolean)
          .join("&")}`
      : "/dashboard/qa/team-quality";

  return (
    <FormModal
      open={open}
      title="Late agent replies"
      description={`Replies slower than ${metrics.thresholdSeconds}s for this chat.`}
      onClose={onClose}
      onSave={onClose}
      primaryButtonLabel="Close"
      showCancelButton={false}
      maxWidth={720}
      fitContent
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.5 }}>
          Website
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{websiteLabel}</Typography>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mt: 1.25, mb: 0.5 }}>
          Agent
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{agentName}</Typography>
      </Box>

      <DataTable<SlowReplyRow>
        columns={[
          {
            id: "gapSeconds",
            label: "Delay",
            render: (v) => `${v}s`,
          },
          {
            id: "visitorAt",
            label: "Visitor message",
            cellVariant: "muted",
            render: (v) => formatTs(String(v)),
          },
          {
            id: "agentAt",
            label: "Agent reply",
            cellVariant: "muted",
            render: (v) => formatTs(String(v)),
          },
        ]}
        rows={rows}
        minWidth={520}
        scrollY={false}
        emptyState={{
          title: "No slow replies",
          description: "All agent replies were within the threshold.",
        }}
      />

      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button component={Link} href={reportHref} variant="outlined" size="small">
          Open team QA report for {agentName}
        </Button>
      </Box>
    </FormModal>
  );
}
