"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import NotificationsNoneRounded from "@mui/icons-material/NotificationsNoneRounded";
import VolumeUpRounded from "@mui/icons-material/VolumeUpRounded";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { WidgetLauncherLivePreview } from "@/components/dashboard/chat-widget/WidgetLauncherLivePreview";
import { normalizeAgentAvatarPreset } from "@/lib/chat-widget/chat-avatar-presets";
import { proactiveTeaserPreviewFromDraft } from "@/lib/chat-widget/proactive-teaser-from-draft";
import { buildChatColorsFromWidgetDraft } from "@/lib/chat-widget/widget-colors-draft";
import {
  normalizeButtonPosition,
  normalizeButtonShape,
  type WidgetDraft,
} from "@/lib/chat-widget/widgetDraft";
import {
  resolveNotificationTitle,
  truncateNotificationPreview,
  WIDGET_NOTIFICATION_SOUND_OPTIONS,
  type WidgetLauncherBadgeMode,
  type WidgetSoundId,
} from "@/lib/widget-runtime/widget-notifications";

export function WidgetNotificationAlertPreview({
  draft,
  browserNotification,
  soundNotification,
  notificationSoundId,
  launcherBadgeMode,
  fallbackText,
}: {
  draft: WidgetDraft;
  browserNotification: boolean;
  soundNotification: boolean;
  notificationSoundId: WidgetSoundId;
  launcherBadgeMode: WidgetLauncherBadgeMode;
  fallbackText: string;
}) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;
  const teaser = proactiveTeaserPreviewFromDraft(draft);
  const chatColors = buildChatColorsFromWidgetDraft(draft);
  const sampleBody = fallbackText.trim() || "You have a new message from support.";
  const notificationTitle = resolveNotificationTitle(
    { fallbackNotificationText: sampleBody },
    truncateNotificationPreview(sampleBody),
  );
  const soundLabel =
    WIDGET_NOTIFICATION_SOUND_OPTIONS.find((o) => o.id === notificationSoundId)?.label ??
    notificationSoundId;
  const agentAvatarUrl =
    (draft.agentAvatarDataUrl?.trim().startsWith("http") ? draft.agentAvatarDataUrl.trim() : "") ||
    (draft.proactiveTeaserAvatarDataUrl?.trim().startsWith("http")
      ? draft.proactiveTeaserAvatarDataUrl.trim()
      : "");

  return (
    <Stack spacing={2}>
      <Typography variant="caption" sx={{ color: d.textMuted }}>
        How alerts look when a new message arrives (widget closed)
      </Typography>

      {browserNotification ? (
        <Box>
          <Typography variant="caption" sx={{ color: d.textMuted, display: "block", mb: 0.75 }}>
            Browser notification
          </Typography>
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              gap: 1.25,
              alignItems: "flex-start",
              p: 1.25,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.common.white, 0.96),
              border: `1px solid ${alpha(d.cardBorder, 0.9)}`,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
              maxWidth: 360,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.25,
                bgcolor: draft.buttonColor || "#2563eb",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <NotificationsNoneRounded sx={{ fontSize: 20 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="caption" sx={{ color: d.textMuted, display: "block", mb: 0.25 }}>
                {draft.headerTitle?.trim() || "Your website"}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.35, mb: 0.25 }}>
                {notificationTitle}
              </Typography>
              <Typography variant="caption" sx={{ color: d.textMuted, lineHeight: 1.45 }}>
                {truncateNotificationPreview(sampleBody, 96)}
              </Typography>
            </Box>
          </Paper>
        </Box>
      ) : (
        <Typography variant="caption" sx={{ color: d.textMuted, fontStyle: "italic" }}>
          Browser notification is off — enable it to show the OS-style alert preview.
        </Typography>
      )}

      {soundNotification ? (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.25,
            py: 0.75,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            width: "fit-content",
          }}
        >
          <VolumeUpRounded sx={{ fontSize: 18, color: theme.palette.primary.main }} />
          <Typography variant="caption" sx={{ color: d.textMuted }}>
            Sound:{" "}
            <Box component="span" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {soundLabel}
            </Box>
          </Typography>
        </Box>
      ) : null}

      <Box>
        <Typography variant="caption" sx={{ color: d.textMuted, display: "block", mb: 0.75 }}>
          Launcher badge &amp; message preview
        </Typography>
        <WidgetLauncherLivePreview
          buttonShape={normalizeButtonShape(draft.buttonShape)}
          buttonPosition={
            normalizeButtonPosition(draft.buttonPosition) === "left" ? "left" : "right"
          }
          insetBottomPx={draft.launcherInsetBottomPx}
          insetSidePx={draft.launcherInsetSidePx}
          buttonColor={draft.buttonColor}
          hoverColor={draft.buttonHoverColor}
          iconColor={draft.iconColor}
          iconDataUrl={draft.iconDataUrl}
          launcherIconPreset={draft.launcherIconPreset}
          launcherIconEnabled={draft.launcherIconEnabled !== false}
          launcherLabelEnabled={draft.launcherLabelEnabled !== false}
          buttonLabel={draft.buttonLabel ?? ""}
          launcherStyle={draft.launcherStyle ?? "solid"}
          proactiveTeaser={teaser.text}
          proactiveTeaserActive={false}
          proactiveTeaserAvatarUrl={teaser.avatarUrl}
          proactiveSecondaryCta={teaser.secondaryCta}
          closedMessagePreviewEnabled
          incomingPreviewSampleText={sampleBody}
          incomingPreviewBg={chatColors.incomingMessageBg}
          incomingPreviewTextColor={chatColors.incomingMessageText}
          incomingPreviewMutedColor={chatColors.mutedText}
          incomingPreviewAgentUrl={agentAvatarUrl}
          incomingPreviewAgentPreset={normalizeAgentAvatarPreset(draft.agentAvatarPreset)}
          launcherBadgeMode={launcherBadgeMode}
          forceIncomingAlertPreview
          showAccentDensityPreview={false}
        />
      </Box>
    </Stack>
  );
}
