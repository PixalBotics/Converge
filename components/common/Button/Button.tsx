"use client";

import MuiButton from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ButtonProps } from "./Button.types";
import { baseButtonStyles, compactButtonMetrics, variantStyles } from "./Button.styles";
import { resolveSx } from "@/utils/resolveSx";

/**
 * Primary button with theme-based variants. Accepts MUI `sx` as object or
 * (theme) => object so page-level styles (e.g. height, borderRadius) can use theme.
 */
export function Button({
  children,
  variant = "primary",
  size = "default",
  fullWidth = false,
  type = "button",
  disabled = false,
  sx,
  color: colorProp,
  ...rest
}: ButtonProps) {
  const density = size === "compact" || size === "small" ? "compact" : "default";
  const theme = useTheme();
  const muiVariant = variant === "outlined" ? "outlined" : "contained";
  /** `contained` defaults to `color="primary"`, which forces primary label colors — invisible on light `pillBg` (e.g. Nitro mint). */
  const muiColor = colorProp ?? (variant === "primary" ? "primary" : "inherit");
  const mergedSx = {
    ...baseButtonStyles,
    ...(density === "compact" ? compactButtonMetrics : {}),
    ...variantStyles[variant](theme),
    ...(fullWidth ? { minWidth: 0 } : {}),
    ...resolveSx(sx, theme),
  } as SxProps<Theme>;
  return (
    <MuiButton
      type={type}
      variant={muiVariant}
      color={muiColor}
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
