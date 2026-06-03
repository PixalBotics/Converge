"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { chatOpsAlertBannerSx } from "../styles/chat-operations.styles";
import { ChatMessageAttachmentCard } from "./ChatMessageAttachmentCard";

export function ChatDistributionLinkBanner({
  href,
  submitted,
  embedded = false,
  hint = "Chat closed. Open the distribution form to send the transcript to a department.",
  buttonLabel = "Open distribution form",
  submittedHint = "Distribution already submitted for this chat.",
}: {
  href: string;
  submitted?: boolean;
  embedded?: boolean;
  hint?: string;
  buttonLabel?: string;
  submittedHint?: string;
}) {
  const theme = useTheme() as AppTheme;
  const formKind =
    buttonLabel.toLowerCase().includes("wrap") || hint.toLowerCase().includes("wrap-up")
      ? "close"
      : "distribution";

  if (submitted) {
    return (
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 12 }}>
        {submittedHint}
      </Typography>
    );
  }

  if (embedded) {
    return (
      <ChatMessageAttachmentCard
        href={href}
        title={buttonLabel}
        subtitle={hint}
        formKind={formKind}
      />
    );
  }

  return (
    <Box sx={{ ...chatOpsAlertBannerSx("info"), p: 1.25 }}>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 11, mb: 0.75 }}>
        {hint}
      </Typography>
      <ChatMessageAttachmentCard
        href={href}
        title={buttonLabel}
        formKind={formKind}
      />
    </Box>
  );
}
