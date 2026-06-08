"use client";

import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import type { RuntimeChatAppearance } from "@/lib/widget-runtime/widget-runtime-appearance";
import { ChatFormattedMessage } from "@/lib/safe-markdown/ChatFormattedMessage";
import { EmbedAgentAvatar } from "@/components/embed/EmbedAgentAvatar";
import {
  EMBED_CHAT_AVATAR_SIZE_PX,
  embedChatAvatarSpacerSx,
  embedChatBubbleInnerSx,
  embedChatBubbleRowSx,
  embedChatBubbleShellSx,
  resolveEmbedChatAvatarDisplay,
  shouldMirrorEmbedChatAvatarColumn,
} from "@/lib/widget-runtime/embed-theme-sx";

export type EmbedChatBubbleRole = "greeting" | "assistant" | "visitor";

export function EmbedChatBubble({
  appearance,
  role = "assistant",
  align = "start",
  showAvatar,
  children,
}: {
  appearance: RuntimeChatAppearance;
  role?: EmbedChatBubbleRole;
  align?: "start" | "end";
  /** Assistant/greeting avatar; defaults on for incoming roles. */
  showAvatar?: boolean;
  children: ReactNode;
}) {
  const showAgentAvatar =
    showAvatar !== false &&
    align !== "end" &&
    appearance.avatars.agent.enabled &&
    (role === "assistant" || role === "greeting");
  const showVisitorAvatar =
    showAvatar !== false &&
    align === "end" &&
    appearance.avatars.visitor.enabled &&
    role === "visitor";
  const avatarRole = role === "visitor" ? "visitor" : "agent";
  const avatarDisplay = resolveEmbedChatAvatarDisplay(appearance, avatarRole);
  const rowAlign = align === "end" ? "end" : "start";
  const showAvatarInRow = showAgentAvatar || showVisitorAvatar;
  const mirrorAvatarColumn = shouldMirrorEmbedChatAvatarColumn(
    appearance,
    rowAlign,
    showAvatarInRow,
  );

  const renderBubbleContent = (content: ReactNode) => (
    <Box sx={{ ...embedChatBubbleShellSx(align), mb: 0 }}>
      <Box sx={embedChatBubbleInnerSx(appearance, role)}>{content}</Box>
    </Box>
  );

  const avatarNode =
    showAvatarInRow ? (
      <EmbedAgentAvatar
        avatarUrl={avatarDisplay.url}
        preset={avatarDisplay.preset}
        accentColor={appearance.launcher.buttonColor}
        size={EMBED_CHAT_AVATAR_SIZE_PX}
        variant={avatarRole}
        sx={{ flexShrink: 0 }}
      />
    ) : mirrorAvatarColumn ? (
      <Box sx={embedChatAvatarSpacerSx()} aria-hidden />
    ) : null;

  const wrapRow = (content: ReactNode) =>
    showAvatarInRow || mirrorAvatarColumn ? (
      <Box sx={embedChatBubbleRowSx(rowAlign)}>
        {rowAlign === "end" ? (
          <>
            {renderBubbleContent(content)}
            {avatarNode}
          </>
        ) : (
          <>
            {avatarNode}
            {renderBubbleContent(content)}
          </>
        )}
      </Box>
    ) : (
      renderBubbleContent(content)
    );

  if (typeof children === "string") {
    const text = children.trim();
    if (!text) return null;
    return wrapRow(
      <ChatFormattedMessage text={text} linkColor={appearance.colors.primary} />,
    );
  }

  if (children === null || children === undefined) return null;

  return wrapRow(children);
}
