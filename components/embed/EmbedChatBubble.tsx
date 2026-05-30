"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import type { RuntimeChatAppearance } from "@/lib/widget-runtime/widget-runtime-appearance";
import {
  embedChatBubbleInnerSx,
  embedChatBubbleShellSx,
} from "@/lib/widget-runtime/embed-theme-sx";

export type EmbedChatBubbleRole = "greeting" | "assistant" | "visitor";

export function EmbedChatBubble({
  appearance,
  role = "assistant",
  align = "start",
  children,
}: {
  appearance: RuntimeChatAppearance;
  role?: EmbedChatBubbleRole;
  align?: "start" | "end";
  children: ReactNode;
}) {
  if (typeof children === "string") {
    const text = children.trim();
    if (!text) return null;
    return (
      <Box sx={embedChatBubbleShellSx(align)}>
        <Box sx={embedChatBubbleInnerSx(appearance, role)}>
          <Typography
            variant="body2"
            component="div"
            sx={{ color: "inherit", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {text}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (children === null || children === undefined) return null;

  return (
    <Box sx={embedChatBubbleShellSx(align)}>
      <Box sx={embedChatBubbleInnerSx(appearance, role)}>{children}</Box>
    </Box>
  );
}
