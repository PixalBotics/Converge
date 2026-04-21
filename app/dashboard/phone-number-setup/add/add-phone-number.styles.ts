import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const addPhoneHeaderSx: SxProps<Theme> = {
  mb: 0.5,
};

export const addPhoneSubtextSx: SxProps<Theme> = (theme) => ({
  mt: 0.65,
  color: (theme as AppTheme).app.dashboard.textMuted,
});

export const addPhoneCardHeaderSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.25,
};

export const addPhoneFormGridTwoSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
  gap: 1.5,
  alignItems: "end",
};

export const addPhoneFetchRowSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
  gap: 1.5,
  alignItems: "end",
};

export const addPhoneStatusRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.25,
};

export const addPhoneStatusLabelSx: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.textMuted,
  mt: 0.3,
});

export const addPhoneActionsSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 1.25,
  mt: 1,
  flexWrap: "wrap",
};
