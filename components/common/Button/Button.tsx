"use client";

import MuiButton from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ButtonProps } from "./Button.types";
import { baseButtonStyles, variantStyles } from "./Button.styles";
import { resolveSx } from "@/utils/resolveSx";

/**
 * Primary button with theme-based variants. Accepts MUI `sx` as object or
 * (theme) => object so page-level styles (e.g. height, borderRadius) can use theme.
 */
export function Button({
  children,
  variant = "primary",
  fullWidth = false,
  type = "button",
  disabled = false,
  sx,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const muiVariant = variant === "outlined" ? "outlined" : "contained";
  const mergedSx = {
    ...baseButtonStyles,
    ...variantStyles[variant](theme),
    ...resolveSx(sx, theme),
  } as SxProps<Theme>;
  return (
    <MuiButton
      type={type}
      variant={muiVariant}
      disableElevation
      fullWidth={fullWidth}
      disabled={disabled}
      sx={mergedSx}
      {...rest}
    >
      {children}
    </MuiButton>
  );
}
