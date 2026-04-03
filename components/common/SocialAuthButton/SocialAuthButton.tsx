"use client";

import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { SocialAuthButtonProps } from "./SocialAuthButton.types";

export function SocialAuthButton({
  icon,
  onClick,
  "aria-label": ariaLabel,
}: SocialAuthButtonProps) {
  const theme = useTheme();
  return (
    <IconButton
      onClick={onClick}
      aria-label={ariaLabel}
      sx={{
        flex: 1,
        minWidth: "56px",
        maxWidth: "114.07px",
        width: "100%",
        aspectRatio: "114.07 / 48.54",
        height: "auto",
        borderRadius: "42.8764px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundBlendMode: "plus-lighter, luminosity, darken",
        boxShadow: `0px 0px 0px -1px ${theme.app.grey.inputShadowLight} inset,0px 3px 1px -2px ${theme.app.grey.inputShadowWhite80} inset,0px 0px 5.5px -1px ${theme.app.grey.inputShadowWhite} inset,3px 5px 0.5px -10px ${theme.app.grey.inputShadowWhite} inset,3px -5px 7px -13.5px ${theme.app.grey.inputShadowDark} inset,0px 9px 10px -14.5px ${theme.app.grey.socialButtonDark} inset`,
        flexShrink: 0,
      }}
    >
      {icon}
    </IconButton>
  );
}