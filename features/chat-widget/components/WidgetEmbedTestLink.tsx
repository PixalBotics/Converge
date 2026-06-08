"use client";

import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { WidgetSandboxActionButton } from "./WidgetSandboxActionButton";

export function WidgetEmbedTestLink({
  widgetKey,
  requiresPublishBeforeEmbed,
}: {
  widgetKey: string;
  websiteId?: string;
  /** When true, live embed still serves the last published snapshot only. */
  requiresPublishBeforeEmbed?: boolean;
}) {
  const theme = useTheme() as AppTheme;
  const key = widgetKey.trim();
  if (!key.startsWith("wgt_")) return null;

  const unpublished = requiresPublishBeforeEmbed === true;

  return (
    <Box
      sx={{
        mt: 1.5,
        p: 1.5,
        borderRadius: 2,
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
        bgcolor: theme.app.dashboard.overlayLight,
      }}
    >
      {unpublished ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 0.75,
            mb: 1.25,
            p: 1,
            borderRadius: 1.5,
            bgcolor: theme.app.dashboard.overlayLight,
            border: `1px solid ${theme.palette.warning.main}`,
          }}
        >
          <WarningAmberRounded
            sx={{ fontSize: 18, mt: 0.15, flexShrink: 0, color: "warning.main" }}
          />
          <Typography
            variant="caption"
            sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}
          >
            Widget is offline on real sites until you click Go live. This test link always shows your
            latest saved draft.
          </Typography>
        </Box>
      ) : null}
      <Typography
        variant="caption"
        sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}
      >
        Preview here or copy the test link — works even while the widget is offline on customer sites.
      </Typography>
      <WidgetSandboxActionButton widgetKey={key} variant="button" size="small" />
    </Box>
  );
}
