"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { resolveWidgetEmbedAppOrigin } from "@/lib/chat-widget/widget-embed-api-origin";

export function WidgetSandboxPanel({
  widgetKey,
  websiteUrl,
  title = "Widget sandbox",
  height = 560,
  refreshKey = 0,
}: {
  widgetKey: string;
  websiteUrl?: string;
  title?: string;
  height?: number;
  refreshKey?: number;
}) {
  const theme = useTheme() as AppTheme;
  const embedOrigin = resolveWidgetEmbedAppOrigin();
  const parentPage = websiteUrl?.trim() || embedOrigin;
  const src =
    `${embedOrigin}/embed/widget` +
    `?widgetKey=${encodeURIComponent(widgetKey)}` +
    `&parentPage=${encodeURIComponent(parentPage)}` +
    `&sandbox=1`;

  return (
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
        <Typography variant="body2" fontWeight={700}>
          {title}
        </Typography>
        <Chip
          size="small"
          label="Sandbox"
          sx={{
            bgcolor: "rgba(59, 130, 246, 0.15)",
            color: theme.palette.info.light,
            fontWeight: 600,
          }}
        />
      </Stack>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
        Full visitor widget — form, chat, and AI. Test traffic is marked sandbox (no analytics or leads).
      </Typography>
      <Box
        sx={{
          position: "relative",
          mx: "auto",
          width: "100%",
          maxWidth: 380,
          borderRadius: 3,
          overflow: "hidden",
          border: `12px solid rgba(255,255,255,0.12)`,
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          bgcolor: "#0f172a",
          minHeight: height,
        }}
      >
        <Box
          component="iframe"
          key={refreshKey}
          title="Widget sandbox"
          src={src}
          sx={{
            width: "100%",
            height,
            border: "none",
            display: "block",
            bgcolor: "#fff",
          }}
        />
      </Box>
    </Stack>
  );
}
