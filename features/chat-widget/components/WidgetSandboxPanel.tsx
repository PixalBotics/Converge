"use client";

import RefreshRounded from "@mui/icons-material/RefreshRounded";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { buildWidgetEmbedIframeUrl } from "@/lib/chat-widget/widget-sandbox-url";
import { resolveWidgetEmbedAppOrigin } from "@/lib/chat-widget/widget-embed-api-origin";
import { WidgetSandboxActionButton } from "./WidgetSandboxActionButton";
import { useWidgetPreviewShareLink } from "../hooks/useWidgetPreviewShareLink";

export function WidgetSandboxPanel({
  widgetKey,
  websiteUrl,
  title = "Widget sandbox",
  height = 560,
  refreshKey = 0,
  onRefresh,
}: {
  widgetKey: string;
  websiteUrl?: string;
  title?: string;
  height?: number;
  refreshKey?: number;
  onRefresh?: () => void;
}) {
  const theme = useTheme() as AppTheme;
  const embedOrigin = resolveWidgetEmbedAppOrigin({
    browserOrigin: typeof window !== "undefined" ? window.location.origin : undefined,
  });
  const { previewShareToken } = useWidgetPreviewShareLink(widgetKey);
  const parentPage = websiteUrl?.trim() || embedOrigin;
  const src = buildWidgetEmbedIframeUrl({
    widgetKey,
    mode: "draft",
    previewShareToken: previewShareToken || undefined,
    parentPage,
    appOrigin: embedOrigin,
  });

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 200 }}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography variant="body2" fontWeight={700}>
              {title}
            </Typography>
            <Chip
              size="small"
              label="Sandbox"
              sx={{
                bgcolor: alpha(theme.palette.info.main, 0.15),
                color: theme.palette.info.light,
                fontWeight: 600,
              }}
            />
          </Stack>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}>
            Latest saved draft. Refresh after saving a step. Share the public link so anyone can test
            without logging in.
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {onRefresh ? (
            <Tooltip title="Refresh preview" arrow>
              <IconButton size="small" onClick={onRefresh} aria-label="Refresh sandbox">
                <RefreshRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          <WidgetSandboxActionButton widgetKey={widgetKey} variant="button" size="small" />
        </Stack>
      </Stack>

      <Box
        sx={{
          position: "relative",
          mx: "auto",
          width: "100%",
          maxWidth: 380,
          borderRadius: 4,
          overflow: "hidden",
          border: "12px solid rgba(255,255,255,0.1)",
          boxShadow: "0 28px 70px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)",
          bgcolor: "#0f172a",
          minHeight: height + 28,
        }}
      >
        <Box
          sx={{
            height: 28,
            bgcolor: "rgba(15,23,42,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 5,
              borderRadius: 99,
              bgcolor: "rgba(255,255,255,0.12)",
            }}
          />
        </Box>
        {src ? (
          <Box
            component="iframe"
            key={`${refreshKey}-${previewShareToken}`}
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
        ) : (
          <Box
            sx={{
              height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.app.dashboard.textMuted,
              fontSize: 13,
              p: 2,
              textAlign: "center",
            }}
          >
            Set NEXT_PUBLIC_WIDGET_EMBED_ORIGIN to preview the widget.
          </Box>
        )}
      </Box>
    </Stack>
  );
}
