import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const chatBoxFormStackSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2.5,
  minWidth: 0,
};

export const chatBoxFieldGroupSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1.25,
};

export const chatBoxSectionTitleSx: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.text.primary,
  fontWeight: 600,
});

export const chatBoxSectionHintSx: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.textMuted,
  lineHeight: 1.5,
});

export const chatBoxColorHintSx: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.textMuted,
});

export const chatBoxColorRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.25,
};

export const chatBoxSwitchRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
};
