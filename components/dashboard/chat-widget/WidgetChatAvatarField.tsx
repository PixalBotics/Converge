"use client";

import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type {
  AgentAvatarPresetId,
  VisitorAvatarPresetId,
} from "@/lib/chat-widget/chat-avatar-presets";
import { WidgetChatAvatarBubble } from "@/lib/chat-widget/widget-chat-avatar-svg";
import { WidgetChatAvatarPicker } from "./WidgetChatAvatarPicker";

export function WidgetChatAvatarField({
  title,
  subtitle,
  enabled,
  onEnabledChange,
  dataUrl,
  preset,
  accentColor,
  onSelectPreset,
  variant = "agent",
}: {
  title: string;
  subtitle: string;
  enabled: boolean;
  onEnabledChange: (checked: boolean) => void;
  dataUrl?: string;
  preset: AgentAvatarPresetId | VisitorAvatarPresetId;
  accentColor: string;
  onSelectPreset: (id: AgentAvatarPresetId | VisitorAvatarPresetId) => void;
  variant?: "agent" | "visitor";
}) {
  const theme = useTheme() as AppTheme;
  const hasCustomImage = Boolean(dataUrl?.trim());

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
        <Box>
          <Typography variant="body2" sx={{ color: theme.app.text.primary, fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            {subtitle}
          </Typography>
        </Box>
        <Switch checked={enabled} onChange={(_, checked) => onEnabledChange(checked)} color="success" />
      </Box>
      {enabled ? (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1 }}>
            <WidgetChatAvatarBubble
              avatarUrl={dataUrl}
              preset={preset}
              variant={variant}
              accentColor={accentColor}
              size={44}
            />
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}>
              Choose an icon preset below.
            </Typography>
          </Box>
          <WidgetChatAvatarPicker
            variant={variant}
            preset={preset}
            accentColor={accentColor}
            hasCustomImage={hasCustomImage}
            onSelectPreset={onSelectPreset}
          />
        </>
      ) : null}
    </Box>
  );
}
