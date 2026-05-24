"use client";

import ChatRounded from "@mui/icons-material/ChatRounded";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { WidgetAccentDensityPreview } from "@/components/dashboard/chat-widget/WidgetAccentDensityPreview";
import { LauncherPresetIcon } from "@/lib/chat-widget/launcherIcons";
import type { LauncherIconPresetId } from "@/lib/chat-widget/widgetDraft";

const LAUNCHER_PX = 52;

function launcherShapeRadius(shape: "circle" | "rounded" | "square"): string {
  if (shape === "circle") return "50%";
  if (shape === "rounded") return "16px";
  return "10px";
}

export function WidgetLauncherLivePreview({
  buttonShape,
  buttonPosition,
  insetBottomPx,
  insetSidePx,
  buttonColor,
  iconColor,
  iconDataUrl,
  launcherIconPreset,
  accent,
  density,
}: {
  buttonShape: "circle" | "rounded" | "square";
  buttonPosition: "left" | "center" | "right";
  insetBottomPx: number;
  insetSidePx: number;
  buttonColor: string;
  iconColor: string;
  iconDataUrl: string;
  launcherIconPreset: LauncherIconPresetId;
  accent: string;
  density: string;
}) {
  const theme = useTheme() as AppTheme;
  const fabColor = buttonColor || "#2563eb";
  const siteMinHeight = Math.max(148, insetBottomPx + LAUNCHER_PX + 24);

  const fabPosition =
    buttonPosition === "left"
      ? { left: insetSidePx, right: "auto", transform: "none" }
      : buttonPosition === "right"
        ? { right: insetSidePx, left: "auto", transform: "none" }
        : {
            left: "50%",
            right: "auto",
            transform: `translateX(calc(-50% + ${insetSidePx}px))`,
          };

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.75 }}>
          Launcher on your website
        </Typography>
        <Box
          sx={{
            position: "relative",
            minHeight: siteMinHeight,
            borderRadius: 2,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            overflow: "hidden",
            background: `linear-gradient(180deg, #eef2f7 0%, #e2e8f0 100%)`,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 12,
              borderRadius: 1,
              bgcolor: "rgba(255,255,255,0.55)",
              border: `1px dashed ${theme.app.dashboard.cardBorder}`,
            }}
          />
          <Box sx={{ position: "absolute", top: 20, left: 20, right: "35%", height: 8, borderRadius: 1, bgcolor: "rgba(15,23,42,0.08)" }} />
          <Box sx={{ position: "absolute", top: 36, left: 20, right: "50%", height: 6, borderRadius: 1, bgcolor: "rgba(15,23,42,0.06)" }} />
          <Box
            sx={{
              position: "absolute",
              bottom: insetBottomPx,
              width: LAUNCHER_PX,
              height: LAUNCHER_PX,
              borderRadius: launcherShapeRadius(buttonShape),
              bgcolor: fabColor,
              boxShadow: "0 10px 24px rgba(15, 23, 42, 0.28)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              ...fabPosition,
            }}
          >
            {iconDataUrl ? (
              <Box component="img" src={iconDataUrl} alt="" sx={{ width: 26, height: 26, objectFit: "contain" }} />
            ) : launcherIconPreset ? (
              <LauncherPresetIcon presetId={launcherIconPreset} color={iconColor || "#FFFFFF"} fontSizePx={26} />
            ) : (
              <ChatRounded sx={{ color: iconColor || "#FFFFFF", fontSize: 26 }} />
            )}
          </Box>
        </Box>
      </Box>

      <Box>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.75 }}>
          Chat panel — accent &amp; spacing
        </Typography>
        <WidgetAccentDensityPreview
          accent={accent}
          density={density}
          launcherColor={fabColor}
          headerTextColor="#ffffff"
          embedded
        />
      </Box>
    </Stack>
  );
}
