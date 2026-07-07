"use client";

import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { TranscriptListItem } from "@/services/chat/transcript.types";
import {
  CLOSED_CHAT_BUCKETS,
  isMeaningfulClosedChat,
  isSpamCloseOutcome,
  resolveClosedChatBucket,
  spamCategoryLabel,
} from "@/features/chat-operations/utils/chat-close-outcome";

function resolveLabel(
  row: Pick<
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
  >,
): string {
  const fromApi = row.transcriptStatus?.trim();
  if (fromApi) {
    if (fromApi.toLowerCase() === "live") {
      const s = row.status?.toLowerCase();
      if (s === "assigned") return "Assigned";
      if (s === "waiting") return "Waiting";
      if (s === "active") return "Active";
    }
    return fromApi;
  }

  const status = row.status?.trim().toLowerCase();
  if (status && status !== "closed") {
    if (status === "assigned") return "Assigned";
    if (status === "waiting") return "Waiting";
    if (status === "active") return "Active";
    return row.status?.trim() || "—";
  }

  if (status === "closed") {
    const bucket = resolveClosedChatBucket({
      closeBucket: row.closeBucket,
      closeOutcome: row.closeOutcome,
      requiresDistributionForm: Boolean(row.requiresDistributionForm),
      requiresDistributionSetup: Boolean(row.requiresDistributionSetup),
      distributionSubmitted: Boolean(row.distributionSubmitted),
      isMeaningfulChat: Boolean(row.isMeaningfulChat),
    });
    if (bucket === CLOSED_CHAT_BUCKETS.SPAM) {
      const cat = spamCategoryLabel(row.spamCategory);
      return cat && cat !== "Spam" ? `Spam · ${cat}` : "Spam";
    }
    if (bucket === CLOSED_CHAT_BUCKETS.PENDING) return "Form pending";
    if (bucket === CLOSED_CHAT_BUCKETS.COMPLETED) {
      return isMeaningfulClosedChat(row) ? "Meaningful chat" : "Closed";
    }
    if (isSpamCloseOutcome(row.closeOutcome)) return "Spam";
    return "Closed";
  }

  return row.status?.trim() || "—";
}

function chipColors(
  label: string,
  status: string,
  theme: AppTheme,
): { color: string; bgcolor: string; border: string } {
  const hay = label.toLowerCase();
  if (hay.startsWith("spam")) {
    return {
      color: theme.palette.warning.light,
      bgcolor: alpha(theme.palette.warning.main, 0.14),
      border: `1px solid ${alpha(theme.palette.warning.main, 0.28)}`,
    };
  }
  if (hay.includes("form pending") || hay === "pending") {
    return {
      color: theme.palette.info.light,
      bgcolor: alpha(theme.palette.info.main, 0.14),
      border: `1px solid ${alpha(theme.palette.info.main, 0.28)}`,
    };
  }
  if (hay.includes("meaningful") || hay === "complete" || hay.includes("form complete")) {
    return {
      color: theme.palette.success.light,
      bgcolor: alpha(theme.palette.success.main, 0.14),
      border: `1px solid ${alpha(theme.palette.success.main, 0.28)}`,
    };
  }
  const s = status.toLowerCase();
  if (s === "active" || s === "assigned") {
    return {
      color: theme.app.dashboard.accentGreenLight,
      bgcolor: "rgba(34, 197, 94, 0.12)",
      border: "1px solid rgba(34, 197, 94, 0.28)",
    };
  }
  if (s === "waiting") {
    return {
      color: theme.app.dashboard.accentCyan,
      bgcolor: "rgba(34, 211, 238, 0.12)",
      border: "1px solid rgba(34, 211, 238, 0.28)",
    };
  }
  if (s === "closed") {
    return {
      color: theme.app.dashboard.textMuted,
      bgcolor: "rgba(148, 163, 184, 0.12)",
      border: "1px solid rgba(148, 163, 184, 0.28)",
    };
  }
  return {
    color: theme.palette.primary.light,
    bgcolor: "rgba(88, 101, 242, 0.12)",
    border: "1px solid rgba(88, 101, 242, 0.28)",
  };
}

type Props = {
  row: Pick<
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
  >;
};

export function TranscriptStatusChip({ row }: Props) {
  const theme = useTheme() as AppTheme;
  const label = resolveLabel(row);
  const chip = chipColors(label, row.status ?? "", theme);

  return (
    <Chip
      size="small"
      label={label}
      sx={{
        height: 22,
        fontSize: 11,
        fontWeight: 600,
        color: chip.color,
        bgcolor: chip.bgcolor,
        border: chip.border,
      }}
    />
  );
}
