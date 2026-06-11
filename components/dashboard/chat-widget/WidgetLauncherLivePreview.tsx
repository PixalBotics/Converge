"use client";

import ChatRounded from "@mui/icons-material/ChatRounded";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { WidgetAccentDensityPreview } from "@/components/dashboard/chat-widget/WidgetAccentDensityPreview";
import { EmbedAgentAvatar } from "@/components/embed/EmbedAgentAvatar";
import { WidgetProactiveTeaserBubble } from "@/components/embed/WidgetProactiveTeaserBubble";
import { truncateClosedMessagePreviewHalf } from "@/lib/widget-runtime/widget-notifications";
import { LauncherPresetIcon } from "@/lib/chat-widget/launcherIcons";
import { parseProactiveSecondaryCtaFromUi } from "@/lib/chat-widget/proactive-teaser-types";
import {
  normalizeLauncherStyle,
  resolveLauncherFabSurfaceSx,
  type WidgetLauncherStyleId,
} from "@/lib/chat-widget/launcher-style";
import type { LauncherIconPresetId } from "@/lib/chat-widget/widgetDraft";

const LAUNCHER_PX = 52;

export function WidgetLauncherLivePreview({
  buttonShape,
  buttonPosition,
  insetBottomPx,
  insetSidePx,
  buttonColor,
  hoverColor,
  iconColor,
  iconDataUrl,
  launcherIconPreset,
  proactiveTeaser = "",
  proactiveTeaserActive = false,
  proactiveTeaserAvatarUrl = "",
  proactiveSecondaryCta,
  closedMessagePreviewEnabled = true,
  incomingPreviewSampleText = "Thanks for reaching out — an agent will reply shortly.",
  incomingPreviewBg = "#E8EDF4",
  incomingPreviewTextColor = "#0f172a",
  incomingPreviewMutedColor = "#64748b",
  incomingPreviewAgentUrl = "",
  incomingPreviewAgentPreset = "phosphor-user-circle",
  launcherBadgeMode = "count",
  accent,
  density,
  launcherStyle = "solid",
}: {
  buttonShape: "circle" | "rounded" | "square";
  buttonPosition: "left" | "center" | "right";
  insetBottomPx: number;
  insetSidePx: number;
  buttonColor: string;
  hoverColor?: string;
  iconColor: string;
  iconDataUrl: string;
  launcherIconPreset: LauncherIconPresetId;
  proactiveTeaser?: string;
  proactiveTeaserActive?: boolean;
  proactiveTeaserAvatarUrl?: string;
  proactiveSecondaryCta?: ReturnType<typeof parseProactiveSecondaryCtaFromUi>;
  closedMessagePreviewEnabled?: boolean;
  incomingPreviewSampleText?: string;
  incomingPreviewBg?: string;
  incomingPreviewTextColor?: string;
  incomingPreviewMutedColor?: string;
  incomingPreviewAgentUrl?: string;
  incomingPreviewAgentPreset?: string;
  launcherBadgeMode?: "count" | "dot" | "none";
  accent: string;
  density: string;
  launcherStyle?: WidgetLauncherStyleId;
}) {
  const theme = useTheme() as AppTheme;
  const fabColor = buttonColor || "#2563eb";
  const showIncomingPreviewDemo =
    closedMessagePreviewEnabled && !proactiveTeaserActive && Boolean(incomingPreviewSampleText.trim());
  const siteMinHeight = Math.max(
    148,
    insetBottomPx + LAUNCHER_PX + 24 + (proactiveTeaserActive || showIncomingPreviewDemo ? 72 : 0),
  );
  const badgeVisible = launcherBadgeMode !== "none";

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
              display: "flex",
              flexDirection: "column",
              alignItems:
                buttonPosition === "left"
                  ? "flex-start"
                  : buttonPosition === "center"
                    ? "center"
                    : "flex-end",
              gap: 1,
              zIndex: 2,
              ...fabPosition,
            }}
          >
            {proactiveTeaserActive ? (
              <WidgetProactiveTeaserBubble
                text={proactiveTeaser}
                avatarUrl={proactiveTeaserAvatarUrl}
                secondaryCta={proactiveSecondaryCta}
                motionEnabled={false}
              />
            ) : showIncomingPreviewDemo ? (
              <Paper
                elevation={0}
                sx={{
                  maxWidth: 300,
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 2,
                  bgcolor: incomingPreviewBg,
                  color: incomingPreviewTextColor,
                  border: `1px solid ${incomingPreviewBg}`,
                  boxShadow: "0 2px 10px rgba(15, 23, 42, 0.1)",
                }}
              >
                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                  <EmbedAgentAvatar
                    avatarUrl={incomingPreviewAgentUrl}
                    preset={incomingPreviewAgentPreset}
                    accentColor={fabColor}
                    size={32}
                    variant="agent"
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        fontWeight: 700,
                        mb: 0.35,
                        color: incomingPreviewMutedColor,
                        fontSize: 11,
                        letterSpacing: "0.02em",
                        textTransform: "uppercase",
                      }}
                    >
                      New message
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: 13, lineHeight: 1.45, fontWeight: 500, color: incomingPreviewTextColor }}
                    >
                      {truncateClosedMessagePreviewHalf(incomingPreviewSampleText)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ) : null}
          <Badge
            overlap="circular"
            invisible={!badgeVisible}
            badgeContent={launcherBadgeMode === "count" ? 1 : undefined}
            variant={launcherBadgeMode === "dot" ? "dot" : "standard"}
            sx={{
              "& .MuiBadge-badge": {
                bgcolor: hoverColor || fabColor,
                color: "#fff",
                fontWeight: 700,
              },
            }}
          >
            <Box
              sx={{
                ...resolveLauncherFabSurfaceSx({
                  style: normalizeLauncherStyle(launcherStyle),
                  buttonColor: fabColor,
                  buttonHoverColor: hoverColor || fabColor,
                  iconColor: iconColor || "#FFFFFF",
                  shape: buttonShape,
                  sizePx: LAUNCHER_PX,
                }),
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                "&:hover": {
                  transform: "scale(1.06)",
                },
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
          </Badge>
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
