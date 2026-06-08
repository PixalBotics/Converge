"use client";

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { useState } from "react";
import {
  findChatAvatarPreset,
  normalizeAgentAvatarPreset,
  normalizeVisitorAvatarPreset,
  type AgentAvatarPresetId,
  type VisitorAvatarPresetId,
} from "./chat-avatar-presets";

export type WidgetChatAvatarVariant = "agent" | "visitor";

/** Phosphor duotone icon inside a circular chip. */
export function WidgetChatAvatarPresetIcon({
  variant,
  preset,
  size = 28,
  accentColor = "#1E63D5",
  sx,
}: {
  variant: WidgetChatAvatarVariant;
  preset?: string;
  size?: number;
  accentColor?: string;
  sx?: SxProps<Theme>;
}) {
  const entry = findChatAvatarPreset(variant, preset);
  const Icon = entry.Icon;
  const glyph = Math.max(16, Math.round(size * 0.58));
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        bgcolor: `${accentColor}22`,
        border: `1.5px solid ${accentColor}66`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.12)",
        overflow: "hidden",
        "& svg": {
          display: "block",
          width: glyph,
          height: glyph,
          flexShrink: 0,
        },
        ...sx,
      }}
    >
      <Icon color={accentColor} size={glyph} aria-hidden />
    </Box>
  );
}

/** Custom upload wins; otherwise selected Phosphor preset icon. */
export function WidgetChatAvatarBubble({
  avatarUrl = "",
  variant = "agent",
  preset,
  size = 28,
  accentColor = "#1E63D5",
  sx,
}: {
  avatarUrl?: string;
  variant?: WidgetChatAvatarVariant;
  preset?: string;
  size?: number;
  accentColor?: string;
  sx?: SxProps<Theme>;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const url = avatarUrl?.trim() ?? "";
  if (url && !imageFailed) {
    return (
      <Box
        component="img"
        src={url}
        alt=""
        onError={() => setImageFailed(true)}
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          border: "1px solid rgba(15, 23, 42, 0.12)",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
          ...sx,
        }}
      />
    );
  }
  const resolvedPreset =
    variant === "visitor"
      ? normalizeVisitorAvatarPreset(preset)
      : normalizeAgentAvatarPreset(preset);
  return (
    <WidgetChatAvatarPresetIcon
      variant={variant}
      preset={resolvedPreset}
      size={size}
      accentColor={accentColor}
      sx={sx}
    />
  );
}
