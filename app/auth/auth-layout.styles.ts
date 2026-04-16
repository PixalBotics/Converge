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
  contentVisibility: "auto",
};

export const formWrapperStyles: SxProps<Theme> = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  width: "100%",
  minWidth: 0,
};

const glassFormCardBase = (theme: Theme): SystemStyleObject<Theme> => ({
  width: "100%",
  maxWidth: { xs: "100%", sm: 420 },
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
    p: { xs: 1.5, sm: 2.5 },
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

/**
 * Single glass card for all auth routes — fixed min-height so switching
 * login ↔ forgot ↔ verify does not jump (premium SaaS shell).
 */
export const authShellCardStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  ...glassFormCardBase(theme),
  display: "flex",
  flexDirection: "column",
  minHeight: { xs: 540, sm: 560 },
  "& .MuiCardContent-root": {
    p: { xs: 1.5, sm: 2.5 },
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    position: "relative",
    zIndex: 1,
    color: theme.app.text.link,
  },
});

/** @deprecated Use `authShellCardStyles` */
export const formCardStyles = authShellCardStyles;

/** @deprecated Use `authShellCardStyles` */
export const formCardStylesTall = authShellCardStyles;

export const formStackStyles: SxProps<Theme> = {
  alignItems: "stretch",
  "& > .remember-forgot-row": { marginTop: "6px !important" },
  width: "100%",
};

/** Shared auth forms: rounded underline field (merged after global `InputField` styles). */
export const authInputFieldStyles: SxProps<Theme> = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    "&::after": {
      borderRadius: "12px",
    },
  },
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

export const titleStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  color: theme.app.text.primary,
  fontWeight: 500,
  fontSize: { xs: "1.5rem", sm: "40px" },
  lineHeight: 1.3,
});

export const descriptionStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  color: theme.app.text.secondary,
  fontSize: { xs: "0.875rem", sm: "0.9375rem" },
  lineHeight: 1.5,
});

export const formInnerStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  flex: 1,
  minHeight: 0,
};

/** Forgot / set-password / verify: full-height column form inside the auth card slot. */
export const authFormColumnSx: SxProps<Theme> = formInnerStyles;

export const footerTextStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  textAlign: "center",
  color: theme.app.text.secondary,
  fontSize: "0.875rem",
});

export const signUpLinkStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  color: theme.palette.primary.main,
});

export const signInButtonStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  height: { xs: 52, sm: 62 },
  gap: "10px",
  borderRadius: "51px",
  padding: { xs: "10px 14px", sm: "12px 16px" },
  background: theme.palette.primary.main,
  opacity: 1,
  fontSize: { xs: "0.9375rem", sm: "1rem" },
  transition: theme.transitions.create(["background-color", "box-shadow", "transform"], {
    duration: theme.transitions.duration.short,
  }),
  "&:hover": {
    background: theme.palette.primary.dark,
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)",
  },
  "&:active": {
    transform: "scale(0.985)",
  },
});

export const resendTextStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  color: theme.app.text.secondary,
  fontSize: "0.875rem",
});

export const resendLinkStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  color: theme.palette.primary.main,
});

/** Centered loading / redirect state inside the auth card */
export const authLoadingSlotStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  py: { xs: 8, sm: 10 },
  minHeight: { xs: 320, sm: 360 },
};
