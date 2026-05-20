"use client";

import MuiButton from "@mui/material/Button";
import type { SxProps, Theme } from "@mui/material/styles";
import { embedPrimaryButtonSx } from "@/lib/widget-runtime/embed-theme-sx";
import type { RuntimeChatAppearance } from "@/lib/widget-runtime/widget-runtime-appearance";

export interface EmbedActionButtonProps {
  appearance: RuntimeChatAppearance;
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

/** CTA using `chat.colors.button` — avoids dashboard `Button` grey/white styles. */
export function EmbedActionButton({
  appearance,
  children,
  type = "button",
  disabled = false,
  fullWidth = false,
  onClick,
  sx,
}: EmbedActionButtonProps) {
  return (
    <MuiButton
      type={type}
      disabled={disabled}
      fullWidth={fullWidth}
      disableElevation
      onClick={onClick}
      sx={{
        ...(embedPrimaryButtonSx(appearance) as object),
        minWidth: fullWidth ? 0 : 120,
        ...(fullWidth ? { width: "100%" } : {}),
        ...(sx as object),
      }}
    >
      {children}
    </MuiButton>
  );
}
