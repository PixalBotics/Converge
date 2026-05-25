"use client";

import Box from "@mui/material/Box";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { chatOpsAlertBannerSx } from "../styles/chat-operations.styles";

export function ChatDistributionLinkBanner({
  href,
  submitted,
  embedded = false,
  hint = "Chat closed — open the distribution form to send the transcript to a department.",
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
  const router = useRouter();

  if (submitted) {
    return (
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 12 }}>
        {submittedHint}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        ...(embedded
          ? {
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }
          : {
              ...chatOpsAlertBannerSx("info"),
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }),
      }}
    >
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 11 }}>
        {hint}
      </Typography>
      <Button
        type="button"
        variant="primary"
        size="small"
        sx={{ ...gradientPrimaryButtonSx, py: 0.5, px: 1.5, fontSize: 12 }}
        onClick={() => router.push(href)}
      >
        {buttonLabel}
      </Button>
    </Box>
  );
}
