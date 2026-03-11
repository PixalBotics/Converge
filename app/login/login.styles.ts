import type { SxProps, Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";

export const pageWrapperStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.appBackground,
  p: { xs: 1.5, sm: 2 },
  boxSizing: "border-box",
});

export const contentWrapperStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: { xs: 2, sm: 4, lg: 8 },
  maxWidth: 1200,
  width: "100%",
  flexDirection: { xs: "column", md: "row" },
  boxSizing: "border-box",
};

export const illustrationWrapperStyles: SxProps<Theme> = {
  flex: 1,
  display: { xs: "none", md: "flex" },
  alignItems: "center",
  justifyContent: "center",
  minHeight: { xs: 180, sm: 240 },
  width: "100%",
};

export const illustrationImgStyles: SxProps<Theme> = {
  maxWidth: "100%",
  height: "auto",
  objectFit: "contain",
};

export const formWrapperStyles: SxProps<Theme> = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  width: "100%",
  minWidth: 0,
};

export const formCardStyles: SxProps<Theme> = {
  width: "100%",
  maxWidth: { xs: "100%", sm: 440 },
  "& .MuiCardContent-root": {
    p: { xs: 2, sm: 3 },
    color: "rgba(203, 213, 225, 0.9)",
  },
};

export const formStackStyles: SxProps<Theme> = {
  alignItems: "stretch",
  "& > .remember-forgot-row": { marginTop: "6px !important" },
  width: "100%",
};

export const logoWrapperStyles: SxProps<Theme> = {
  textAlign: "center",
  mb: 1,
};

export const logoImgStyles: SxProps<Theme> = {
  display: "block",
  maxWidth: "100%",
  height: "auto",
  maxHeight: { xs: 40, sm: 48 },
  mx: "auto",
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

export const signInButtonStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  height: { xs: 52, sm: 62 },
  gap: "10px",
  borderRadius: "51px",
  padding: { xs: "10px 14px", sm: "12px 16px" },
  background: theme.palette.primary.main,
  opacity: 1,
  fontSize: { xs: "0.9375rem", sm: "1rem" },
  "&:hover": {
    background: theme.palette.primary.dark,
  },
});

export const dividerStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  "&::before, &::after": { borderColor: theme.app.border.divider },
});

export const orTextStyles: SxProps<Theme> = {
  color: "rgba(148, 163, 184, 0.8)",
  px: 1,
};

export const signUpTextStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  textAlign: "center",
  color: (theme as Theme & { app?: { text?: { secondary?: string } } }).app?.text?.secondary ?? "rgba(203, 213, 225, 0.8)",
  pt: 0.5,
});

export const forgotPasswordLabelStyles: SxProps<Theme> = {
  display: "inline",
};

export const signUpLinkStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  color: theme.palette.primary.main,
});
