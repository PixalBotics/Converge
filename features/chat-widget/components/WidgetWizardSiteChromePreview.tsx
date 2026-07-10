"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { WidgetLauncherLivePreview } from "@/components/dashboard/chat-widget/WidgetLauncherLivePreview";
import { normalizeAgentAvatarPreset } from "@/lib/chat-widget/chat-avatar-presets";
import { proactiveTeaserPreviewFromDraft } from "@/lib/chat-widget/proactive-teaser-from-draft";
import { buildChatColorsFromWidgetDraft } from "@/lib/chat-widget/widget-colors-draft";
import {
  normalizeButtonPosition,
  normalizeButtonShape,
  type WidgetDraft,
} from "@/lib/chat-widget/widgetDraft";

/** Closed-state site chrome (invitation bubble + FAB) for wizard steps 2–4. */
export function WidgetWizardSiteChromePreview({ draft }: { draft: WidgetDraft }) {
  const theme = useTheme() as AppTheme;
  const teaser = proactiveTeaserPreviewFromDraft(draft);
  const chatColors = buildChatColorsFromWidgetDraft(draft);
  const agentAvatarUrl =
    (draft.agentAvatarDataUrl?.trim().startsWith("http") ? draft.agentAvatarDataUrl.trim() : "") ||
    (draft.proactiveTeaserAvatarDataUrl?.trim().startsWith("http")
      ? draft.proactiveTeaserAvatarDataUrl.trim()
      : "");
  return (
    <Stack spacing={1}>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
        Closed on your website (invitation + launcher)
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
        proactiveTeaserActive={teaser.active}
        proactiveTeaserAvatarUrl={teaser.avatarUrl}
        proactiveSecondaryCta={teaser.secondaryCta}
        closedMessagePreviewEnabled={draft.closedMessagePreviewEnabled !== false}
        incomingPreviewSampleText={
          draft.fallbackNotificationText ?? "You have a new message from support."
        }
        incomingPreviewBg={chatColors.incomingMessageBg}
        incomingPreviewTextColor={chatColors.incomingMessageText}
        incomingPreviewMutedColor={chatColors.mutedText}
        incomingPreviewAgentUrl={agentAvatarUrl}
        incomingPreviewAgentPreset={normalizeAgentAvatarPreset(draft.agentAvatarPreset)}
        launcherBadgeMode={draft.launcherBadgeMode ?? "count"}
        accent={draft.themeDesignJsonAccent ?? "blue"}
        density={draft.themeDesignJsonDensity ?? "comfortable"}
      />
    </Stack>
  );
}
