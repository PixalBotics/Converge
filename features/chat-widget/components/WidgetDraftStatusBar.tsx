"use client";

import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";

export type WidgetDraftStatusBarProps = {
  /** Shown on wizard steps — no extra GET /widgets/:key on every page. */
  variant?: "wizard" | "detail";
  /** Detail page only: from GET /widgets/:key deploy block. */
  deployState?: "draft_only" | "live" | "live_with_pending_draft" | null;
};

const WIZARD_COPY =
  "Working draft — each step saves with PATCH. Real sites show the widget only after you click Go live. Use the test link to preview anytime.";

export function WidgetDraftStatusBar({
  variant = "wizard",
  deployState = null,
}: WidgetDraftStatusBarProps) {
  const theme = useTheme() as AppTheme;

  let copy = WIZARD_COPY;
  if (variant === "detail") {
    if (deployState === "live")
      copy = "Live on customer sites. Wizard edits save as draft until you publish changes or take offline.";
    else if (deployState === "live_with_pending_draft")
      copy = "Live version is on sites. You have newer saved changes — click Go live to update the embed.";
    else if (deployState === "draft_only")
      copy = "Offline on real sites. Share the test link to preview. Click Go live when you want visitors to see it.";
    else copy = "Widget configuration.";
  }

  return (
    <Box
      sx={{
        mb: 2,
        p: 1.25,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
        bgcolor: alpha(theme.palette.info.main, theme.palette.mode === "light" ? 0.06 : 0.1),
        display: "flex",
        gap: 1,
        alignItems: "flex-start",
      }}
    >
      <InfoOutlined sx={{ fontSize: 18, mt: 0.15, color: theme.palette.info.main, flexShrink: 0 }} />
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}>
        {copy}
      </Typography>
    </Box>
  );
}
