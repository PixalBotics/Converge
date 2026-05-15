import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export type ToolbarIconButtonTone = "default" | "muted";

/**
 * Table toolbars / filter rows — bordered icon chips that pick up hover accent from `palette.primary`.
 */
export function toolbarIconButtonSx(
  theme: Theme,
  tone: ToolbarIconButtonTone = "default",
): SxProps<Theme> {
  const app = (theme as AppTheme).app;
  const color = tone === "muted" ? app.dashboard.iconMuted : app.dashboard.textMuted95;
  return {
    boxSizing: "border-box",
    width: 36,
    height: 36,
    p: 0,
    borderRadius: "10px",
    border: `1px solid ${app.dashboard.cardBorder}`,
    color,
    "&:hover": {
      backgroundColor: app.dashboard.overlayLight,
      borderColor: theme.palette.primary.main,
      color: app.text.primary,
    },
  };
}
