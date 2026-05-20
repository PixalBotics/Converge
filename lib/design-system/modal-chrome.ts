import type { SxProps, Theme } from "@mui/material/styles";
import { MODAL_CLOSE_BUTTON_PX } from "@/lib/design-system/icons";
import type { AppTheme } from "@/theme/theme";

/** Outlined dismiss control — FormModal, drawers, glass shells. */
export function modalCloseIconButtonSx(theme: Theme): SxProps<Theme> {
  const app = (theme as AppTheme).app;
  return {
    width: MODAL_CLOSE_BUTTON_PX,
    height: MODAL_CLOSE_BUTTON_PX,
    p: 0,
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 0,
    border: `1px solid ${app.dashboard.textMuted}`,
    borderRadius: "50%",
    color: app.dashboard.textMuted95,
    "&:hover": {
      bgcolor: theme.palette.action.hover,
      borderColor: app.text.primary,
      color: app.text.primary,
    },
  };
}

/** Filled error dismiss — destructive / exit flows. */
export function modalCloseIconButtonFilledSx(theme: Theme): SxProps<Theme> {
  return {
    width: MODAL_CLOSE_BUTTON_PX,
    height: MODAL_CLOSE_BUTTON_PX,
    p: 0,
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 0,
    border: "none",
    borderRadius: "50%",
    bgcolor: theme.palette.error.main,
    color: theme.palette.common.white,
    "&:hover": {
      bgcolor: theme.palette.error.dark,
    },
  };
}
