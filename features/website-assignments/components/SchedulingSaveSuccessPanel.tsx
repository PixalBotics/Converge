"use client";

import ArrowForward from "@mui/icons-material/ArrowForward";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Groups from "@mui/icons-material/Groups";
import List from "@mui/icons-material/List";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import NextLink from "next/link";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { schedulingSuccessPanelSx } from "../styles/website-assignment-ui.styles";

export function SchedulingSaveSuccessPanel({
  websiteName,
  websiteUrl,
  rosterHref,
  onViewAllSchedules,
}: {
  websiteName: string;
  websiteUrl?: string;
  rosterHref: string;
  onViewAllSchedules: () => void;
}) {
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={schedulingSuccessPanelSx}>
      <CheckCircle
        sx={{
          fontSize: 56,
          color: theme.palette.success.main,
          mb: 2,
        }}
      />
      <Typography variant="regularLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 1 }}>
        Schedule saved
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: theme.app.dashboard.textMuted, maxWidth: 480, mx: "auto", mb: 3, lineHeight: 1.6 }}
      >
        <strong style={{ color: theme.app.text.primary }}>{websiteName}</strong>
        {websiteUrl ? ` · ${websiteUrl}` : ""}
        <br />
        Step 1 is complete. Continue to <strong>Agent roster</strong> to assign Primary, Secondary, and
        Backup agents for each visitor topic.
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          type="button"
          variant="primary"
          component={NextLink}
          href={rosterHref}
          endIcon={<ArrowForward />}
          startIcon={<Groups />}
          sx={{ ...gradientPrimaryButtonSx, minWidth: { sm: 260 }, py: 1.25, px: 3, fontSize: 15 }}
        >
          Assign agents now
        </Button>
        <Button
          type="button"
          variant="outlined"
          startIcon={<List />}
          onClick={onViewAllSchedules}
          sx={{ py: 1.25, px: 3, fontSize: 15 }}
        >
          All schedules
        </Button>
      </Box>
      <Typography variant="caption" sx={{ display: "block", mt: 2.5, color: theme.app.dashboard.textMuted }}>
        You can edit hours and topics anytime from Service scheduling.
      </Typography>
    </Box>
  );
}
