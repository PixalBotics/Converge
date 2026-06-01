"use client";

import OpenInNew from "@mui/icons-material/OpenInNew";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { resolveWidgetEmbedAppOrigin } from "@/lib/chat-widget/widget-embed-api-origin";
import { Typography } from "@/components/common";

export function WidgetEmbedTestLink({
  widgetKey,
  websiteId,
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

  const origin = resolveWidgetEmbedAppOrigin({
    browserOrigin:
      typeof window !== "undefined" ? window.location.origin : undefined,
  });
  if (!origin) return null;

  const params = new URLSearchParams({ widgetKey: key });
  if (websiteId?.trim()) params.set("websiteId", websiteId.trim());
  const href = `${origin}/embed/widget?${params.toString()}`;

  const unpublished = requiresPublishBeforeEmbed === true;

  return (
    <Box sx={{ mt: 1.5, p: 1.25, borderRadius: 2, border: `1px solid ${theme.app.dashboard.cardBorder}` }}>
      {unpublished ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 0.75,
            mb: 1,
            p: 1,
            borderRadius: 1.5,
            bgcolor: theme.app.dashboard.overlayLight,
            border: `1px solid ${theme.palette.warning.main}`,
          }}
        >
          <WarningAmberRounded sx={{ fontSize: 18, mt: 0.15, flexShrink: 0, color: "warning.main" }} />
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}>
            Unpublished draft — customer embed shows the last published snapshot only. Finish
            Install (publish) so banner, icon, and greeting copy go live.
          </Typography>
        </Box>
      ) : null}
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.75 }}>
        Same iframe embed as customer sites (Install embed code uses dashboard widget.js)
      </Typography>
      <Link href={href} target="_blank" rel="noopener noreferrer" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontWeight: 600 }}>
        Open embed preview
        <OpenInNew sx={{ fontSize: 16 }} />
      </Link>
    </Box>
  );
}
