"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { resolveWidgetEmbedAppOrigin } from "@/lib/chat-widget/widget-embed-api-origin";

export function AiTrainingWidgetTestFrame({
  widgetKey,
  websiteUrl,
}: {
  widgetKey: string;
  websiteUrl?: string;
}) {
  const theme = useTheme() as AppTheme;
  const embedOrigin = resolveWidgetEmbedAppOrigin();
  const parentPage = websiteUrl?.trim() || embedOrigin;
  const src =
    `${embedOrigin}/embed/widget` +
    `?widgetKey=${encodeURIComponent(widgetKey)}` +
    `&parentPage=${encodeURIComponent(parentPage)}` +
    `&trainingTest=1`;

  return (
    <Box>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
        Live widget preview — same form and chat visitors see. Test messages are real widget traffic.
      </Typography>
      <Box
        sx={{
          borderRadius: 1,
          overflow: "hidden",
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
          height: 520,
          bgcolor: "#f1f5f9",
        }}
      >
        <Box
          component="iframe"
          title="Widget training test"
          src={src}
          sx={{ width: "100%", height: "100%", border: 0, display: "block" }}
        />
      </Box>
    </Box>
  );
}
