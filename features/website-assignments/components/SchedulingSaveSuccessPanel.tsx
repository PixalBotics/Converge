"use client";

import CheckCircle from "@mui/icons-material/CheckCircle";
import List from "@mui/icons-material/List";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { schedulingSuccessPanelSx } from "../styles/website-assignment-ui.styles";

export function SchedulingSaveSuccessPanel({
  websiteName,
  websiteUrl,
  onViewAllSchedules,
  onEditAgain,
}: {
  websiteName: string;
  websiteUrl?: string;
  onViewAllSchedules: () => void;
  onEditAgain?: () => void;
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
        Service hours are saved for this website. You can assign agents without inquire topics.
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
          startIcon={<List />}
          onClick={onViewAllSchedules}
          sx={{ py: 1.25, px: 3, fontSize: 15 }}
        >
          All schedules
        </Button>
        {onEditAgain ? (
          <Button type="button" variant="outlined" onClick={onEditAgain} sx={{ py: 1.25, px: 3, fontSize: 15 }}>
            Edit schedule
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}
