"use client";

import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  CLOSED_CHAT_BUCKETS,
  isSpamCloseOutcome,
  resolveClosedChatBucket,
} from "../utils/chat-close-outcome";

type Props = {
  conversationMeta?: Record<string, unknown> | null;
  readOnly?: boolean;
  visitorTyping?: boolean;
};

export function resolveLiveStatusChipLabel(input: {
  readOnly?: boolean;
  visitorTyping?: boolean;
  conversationMeta?: Record<string, unknown> | null;
}): string {
  if (!input.readOnly) {
    return input.visitorTyping ? "Typing" : "Online";
  }
  const bucket = resolveClosedChatBucket({
    closeBucket:
      typeof input.conversationMeta?.closeBucket === "string"
        ? input.conversationMeta.closeBucket
        : null,
    closeOutcome:
      typeof input.conversationMeta?.closeOutcome === "string"
        ? input.conversationMeta.closeOutcome
        : null,
    requiresDistributionForm: Boolean(input.conversationMeta?.requiresDistributionForm),
    distributionSubmitted: Boolean(input.conversationMeta?.distributionSubmitted),
  });
  if (bucket === CLOSED_CHAT_BUCKETS.SPAM) return "Spam";
  if (bucket === CLOSED_CHAT_BUCKETS.PENDING) return "Pending form";
  if (bucket === CLOSED_CHAT_BUCKETS.COMPLETED) return "Completed";
  return "Closed";
}

export function ChatTranscriptStatusChip({
  conversationMeta,
  readOnly = false,
  visitorTyping = false,
}: Props) {
  const theme = useTheme() as AppTheme;
  const label = resolveLiveStatusChipLabel({ readOnly, visitorTyping, conversationMeta });

  const isLive = !readOnly;
  const isSpam =
    readOnly &&
    (isSpamCloseOutcome(
      typeof conversationMeta?.closeOutcome === "string"
        ? conversationMeta.closeOutcome
        : null,
    ) ||
      resolveClosedChatBucket({
        closeBucket:
          typeof conversationMeta?.closeBucket === "string"
            ? conversationMeta.closeBucket
            : null,
        closeOutcome:
          typeof conversationMeta?.closeOutcome === "string"
            ? conversationMeta.closeOutcome
            : null,
        requiresDistributionForm: Boolean(conversationMeta?.requiresDistributionForm),
        distributionSubmitted: Boolean(conversationMeta?.distributionSubmitted),
      }) === CLOSED_CHAT_BUCKETS.SPAM);

  const bucket = readOnly
    ? resolveClosedChatBucket({
        closeBucket:
          typeof conversationMeta?.closeBucket === "string"
            ? conversationMeta.closeBucket
            : null,
        closeOutcome:
          typeof conversationMeta?.closeOutcome === "string"
            ? conversationMeta.closeOutcome
            : null,
        requiresDistributionForm: Boolean(conversationMeta?.requiresDistributionForm),
        distributionSubmitted: Boolean(conversationMeta?.distributionSubmitted),
      })
    : null;

  const dotColor = isLive
    ? visitorTyping
      ? theme.app.dashboard.accentCyan
      : theme.palette.success.main
    : isSpam
      ? theme.palette.warning.main
      : bucket === CLOSED_CHAT_BUCKETS.PENDING
        ? theme.palette.info.main
        : bucket === CLOSED_CHAT_BUCKETS.COMPLETED
          ? theme.palette.success.main
          : theme.app.dashboard.textMuted;

  const textColor = isLive
    ? visitorTyping
      ? theme.app.dashboard.accentCyan
      : theme.palette.success.light
    : isSpam
      ? theme.palette.warning.light
      : bucket === CLOSED_CHAT_BUCKETS.PENDING
        ? theme.palette.info.light
        : bucket === CLOSED_CHAT_BUCKETS.COMPLETED
          ? theme.palette.success.light
          : theme.app.dashboard.textMuted;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 0.5,
        mt: 0.15,
        height: 22,
        boxSizing: "border-box",
        px: 1,
        py: 0,
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        color: textColor,
        bgcolor: alpha(dotColor, 0.14),
        border: `1px solid ${alpha(dotColor, 0.28)}`,
      }}
    >
      <Box
        component="span"
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: dotColor,
          flexShrink: 0,
        }}
      />
      {label}
    </Box>
  );
}
