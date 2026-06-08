"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { EmbedAgentAvatar } from "@/components/embed/EmbedAgentAvatar";
import type { RuntimeChatAppearance } from "@/lib/widget-runtime/widget-runtime-appearance";
import {
  EMBED_CHAT_AVATAR_SIZE_PX,
  embedIncomingPreviewBubbleSx,
  resolveEmbedChatAvatarDisplay,
} from "@/lib/widget-runtime/embed-theme-sx";

export function WidgetClosedIncomingPreviewBubble({
  preview,
  appearance,
  onOpenChat,
}: {
  preview: string;
  appearance: RuntimeChatAppearance;
  onOpenChat: () => void;
}) {
  const copy = preview.trim();
  if (!copy) return null;

  const agent = appearance.avatars.agent;
  const showAvatar = agent.enabled;
  const avatarDisplay = resolveEmbedChatAvatarDisplay(appearance, "agent");
  const c = appearance.colors;

  return (
    <Paper
      elevation={0}
      onClick={onOpenChat}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenChat();
        }
      }}
      sx={{
        ...embedIncomingPreviewBubbleSx(appearance),
        minWidth: 0,
        width: "fit-content",
      }}
    >
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
        {showAvatar ? (
          <EmbedAgentAvatar
            avatarUrl={avatarDisplay.url}
            preset={avatarDisplay.preset}
            accentColor={appearance.launcher.buttonColor}
            size={EMBED_CHAT_AVATAR_SIZE_PX}
            variant="agent"
            sx={{ flexShrink: 0 }}
          />
        ) : null}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              fontWeight: 700,
              mb: 0.35,
              color: c.mutedText,
              fontSize: 11,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            New message
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: c.bodyFontSizePx ?? 13,
              lineHeight: 1.45,
              fontWeight: 500,
              color: c.incomingBubbleText,
              wordBreak: "break-word",
            }}
          >
            {copy}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
