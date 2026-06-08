"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import {
  AGENT_AVATAR_PRESETS,
  VISITOR_AVATAR_PRESETS,
  type AgentAvatarPresetId,
  type VisitorAvatarPresetId,
} from "@/lib/chat-widget/chat-avatar-presets";

export function WidgetChatAvatarPicker({
  variant,
  preset,
  accentColor,
  hasCustomImage,
  onSelectPreset,
}: {
  variant: "agent" | "visitor";
  preset: AgentAvatarPresetId | VisitorAvatarPresetId;
  accentColor: string;
  hasCustomImage: boolean;
  onSelectPreset: (id: AgentAvatarPresetId | VisitorAvatarPresetId) => void;
}) {
  const theme = useTheme() as AppTheme;
  const presets = variant === "agent" ? AGENT_AVATAR_PRESETS : VISITOR_AVATAR_PRESETS;
  const iconColor = accentColor || "#1E63D5";

  const chipSx = (selected: boolean) => ({
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: `2px solid ${selected ? theme.app.dashboard.accentBlue : theme.app.dashboard.cardBorder}`,
    bgcolor: "#E8EDF4",
    "&:hover": { bgcolor: "#DCE6F2" },
  });

  return (
    <Box>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
        {presets.length} Phosphor icons — tap to pick a default avatar, or upload your own below.
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))",
          gap: 1,
          maxHeight: 160,
          overflowY: "auto",
          pr: 0.5,
          mb: 1,
        }}
      >
        {presets.map((entry) => {
          const selected = !hasCustomImage && preset === entry.id;
          const Icon = entry.Icon;
          return (
            <IconButton
              key={entry.id}
              type="button"
              onClick={() => onSelectPreset(entry.id)}
              title={entry.label}
              sx={chipSx(selected)}
            >
              <Icon color={iconColor} size={22} />
            </IconButton>
          );
        })}
      </Box>
    </Box>
  );
}
