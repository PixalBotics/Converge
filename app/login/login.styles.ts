import type { SxProps, Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { FULL_PAGE_LOADER_BACKGROUND_GRADIENT } from "@/lib/theme/full-page-loader-background";

export const pageWrapperStyles: SxProps<Theme> = {
  position: "relative",
  overflow: "hidden",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: FULL_PAGE_LOADER_BACKGROUND_GRADIENT,
  p: { xs: 1.5, sm: 2 },
  boxSizing: "border-box",
};

export const contentWrapperStyles: SxProps<Theme> = {
  position: "relative",
  zIndex: 1,
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
  width: "100%",
  maxWidth: "430px",
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

/** Glassmorphism login panel — matches reference glass-card (frosted + edge highlights). */
export const formCardStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  width: "100%",
  maxWidth: { xs: "100%", sm: 440 },
  position: "relative",
  overflow: "hidden",
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(5px)",
  WebkitBackdropFilter: "blur(5px)",
  borderRadius: "20px",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  boxShadow:
    "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(255, 255, 255, 0.1), inset 0 0 0px 0px rgba(255, 255, 255, 0)",
  "& .MuiCardContent-root": {
    position: "relative",
    zIndex: 1,
    p: { xs: 2, sm: 3 },
    color: theme.app.text.link,
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "1px",
    zIndex: 0,
    pointerEvents: "none",
    background:
      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "1px",
    height: "100%",
    zIndex: 0,
    pointerEvents: "none",
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.8), transparent, rgba(255, 255, 255, 0.3))",
  },
});

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

export const orTextStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  color: theme.app.text.or,
  px: 1,
});

export const signUpTextStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  textAlign: "center",
  color: theme.app.text.secondary,
  pt: 0.5,
});

export const forgotPasswordLabelStyles: SxProps<Theme> = {
  display: "inline",
};

export const signUpLinkStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  color: theme.palette.primary.main,
});
