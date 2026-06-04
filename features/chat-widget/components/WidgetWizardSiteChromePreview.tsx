"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { WidgetLauncherLivePreview } from "@/components/dashboard/chat-widget/WidgetLauncherLivePreview";
import { proactiveTeaserPreviewFromDraft } from "@/lib/chat-widget/proactive-teaser-from-draft";
import {
  normalizeButtonPosition,
  normalizeButtonShape,
  type WidgetDraft,
} from "@/lib/chat-widget/widgetDraft";

/** Closed-state site chrome (invitation bubble + FAB) for wizard steps 2–4. */
export function WidgetWizardSiteChromePreview({ draft }: { draft: WidgetDraft }) {
  const theme = useTheme() as AppTheme;
  const teaser = proactiveTeaserPreviewFromDraft(draft);
  return (
    <Stack spacing={1}>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
        Closed on your website (invitation + launcher)
      </Typography>
      <WidgetLauncherLivePreview
        buttonShape={normalizeButtonShape(draft.buttonShape)}
        buttonPosition={normalizeButtonPosition(draft.buttonPosition)}
        insetBottomPx={draft.launcherInsetBottomPx}
        insetSidePx={draft.launcherInsetSidePx}
        buttonColor={draft.buttonColor}
        hoverColor={draft.buttonHoverColor}
        iconColor={draft.iconColor}
        iconDataUrl={draft.iconDataUrl}
        launcherIconPreset={draft.launcherIconPreset}
        proactiveTeaser={teaser.text}
        proactiveTeaserActive={teaser.active}
        proactiveTeaserAvatarUrl={teaser.avatarUrl}
        proactiveSecondaryCta={teaser.secondaryCta}
        accent={draft.themeDesignJsonAccent ?? "blue"}
        density={draft.themeDesignJsonDensity ?? "comfortable"}
      />
    </Stack>
  );
}
