import type { SxProps, Theme } from "@mui/material/styles";
import { formStackStyles } from "../auth-layout.styles";

/** Login field stack: flex `gap` so fields space evenly; spacing={0} on Stack avoids double margins. */
export const loginFormStackStyles: SxProps<Theme> = {
  ...formStackStyles,
  gap: { xs: 2, sm: 2.25 },
  "& > .remember-forgot-row": { marginTop: "0 !important" },
};

export const rememberForgotRowStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 1,
  width: "100%",
  minWidth: 0,
  alignSelf: "stretch",
  marginLeft: 0,
  marginRight: 0,
};

export const formControlLabelStyles: SxProps<Theme> = {
  margin: 0,
  marginRight: 0,
  gap: 1,
  "& .MuiFormControlLabel-label": { marginLeft: 0 },
  "& .MuiFormControlLabel-labelPlacementStart": { marginRight: 0 },
};

export const checkboxStyles: SxProps<Theme> = {
  margin: 0,
  padding: 0,
  "&.Mui-checked": { color: "primary.main" },
};

export const forgotPasswordLabelStyles: SxProps<Theme> = {
  display: "inline",
};
