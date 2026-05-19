"use client";

import type { IconButtonProps } from "@mui/material/IconButton";
import MuiIconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import { toolbarIconButtonSx, type ToolbarIconButtonTone } from "@/lib/design-system";
import { resolveSx } from "@/utils/resolveSx";

export type AppIconButtonProps = Omit<IconButtonProps, "size"> & {
  /** Muted icon color for dense tables; hover still lifts to full contrast. */
  tone?: ToolbarIconButtonTone;
  sx?: SxProps<Theme>;
};

/**
 * Standard dashboard icon control (toolbars, table row menus). Colors always flow from `theme.app`
 * and `palette.primary` on hover so backend / preset theme changes stay consistent.
 */
export function AppIconButton({ tone = "default", sx, children, ...rest }: AppIconButtonProps) {
  const theme = useTheme();
  return (
    <MuiIconButton
      size="small"
      sx={[toolbarIconButtonSx(theme, tone), ...(sx ? [resolveSx(sx, theme)] : [])] as SxProps<Theme>}
      {...rest}
    >
      {children}
    </MuiIconButton>
  );
}
