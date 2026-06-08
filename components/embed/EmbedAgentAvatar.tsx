"use client";

import type { SxProps, Theme } from "@mui/material/styles";
import {
  WidgetChatAvatarBubble,
  type WidgetChatAvatarVariant,
} from "@/lib/chat-widget/widget-chat-avatar-svg";

export function EmbedAgentAvatar({
  avatarUrl = "",
  preset = "",
  accentColor = "#1E63D5",
  size = 28,
  variant = "agent",
  sx,
}: {
  avatarUrl?: string;
  preset?: string;
  accentColor?: string;
  size?: number;
  variant?: WidgetChatAvatarVariant;
  sx?: SxProps<Theme>;
}) {
  return (
    <WidgetChatAvatarBubble
      avatarUrl={avatarUrl}
      preset={preset}
      accentColor={accentColor}
      variant={variant}
      size={size}
      sx={sx}
    />
  );
}
