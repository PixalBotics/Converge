import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const notificationsFormStackSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2.5,
  minWidth: 0,
};

export const notificationsFieldGroupSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1.25,
};

export const notificationsSectionTitleSx: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.text.primary,
  fontWeight: 600,
});

export const notificationsSectionHintSx: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.textMuted,
  lineHeight: 1.5,
});

export const notificationsSwitchRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
};

export const notificationsSwitchLabelSx: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.text.primary,
});

export const notificationsCheckboxRowSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 2,
};

export const notificationsCheckboxItemSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
};

export const notificationsInlineTogglesSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 2,
  alignItems: "center",
};
