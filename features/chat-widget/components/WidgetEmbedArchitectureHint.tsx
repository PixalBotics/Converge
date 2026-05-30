"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { resolveWidgetEmbedArchitecture } from "@/lib/chat-widget/widget-embed-api-origin";

export function WidgetEmbedArchitectureHint() {
  const theme = useTheme() as AppTheme;
  const { appOrigin, apiOrigin, scriptSrc } = resolveWidgetEmbedArchitecture();

  return (
    <Box
      sx={{
        mb: 1,
        p: 1.25,
        borderRadius: 1.5,
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
        bgcolor: theme.app.dashboard.overlayLight,
      }}
    >
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
        SaaS embed uses two origins (this is intentional):
      </Typography>
      <Typography
        component="ul"
        variant="caption"
        sx={{
          color: theme.app.dashboard.textMuted,
          m: "6px 0 0",
          pl: 2.25,
          "& li": { mb: 0.35 },
        }}
      >
        <li>
          <strong>App</strong> ({appOrigin}) — script <code>{scriptSrc}</code> → iframe{" "}
          <code>/embed/widget</code> (same UI as admin preview)
        </li>
        <li>
          <strong>API</strong> ({apiOrigin}) — published design via{" "}
          <code>GET /widget/config</code>, session, chat (inside the iframe)
        </li>
      </Typography>
    </Box>
  );
}
