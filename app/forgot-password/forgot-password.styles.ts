import type { SxProps, Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import {
  pageWrapperStyles as loginPageWrapperStyles,
  contentWrapperStyles,
  illustrationWrapperStyles,
  illustrationImgStyles,
  formWrapperStyles,
  formCardStyles as loginFormCardStyles,
  formStackStyles,
  logoImgStyles,
  signInButtonStyles,
  signUpLinkStyles,
} from "../login/login.styles";

export const pageWrapperStyles = loginPageWrapperStyles;
export { contentWrapperStyles, illustrationWrapperStyles, illustrationImgStyles };
export { formWrapperStyles, formStackStyles, logoImgStyles };
export { signInButtonStyles, signUpLinkStyles };

export const formCardStyles: SxProps<Theme> = {
  ...loginFormCardStyles,
  display: "flex",
  flexDirection: "column",
  minHeight: { xs: 600, sm: 620 },
  "& .MuiCardContent-root": {
    p: { xs: 2, sm: 3 },
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
  },
};

export const logoWrapperStyles: SxProps<Theme> = {
  textAlign: "left",
  mb: 1,
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

export const footerTextStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  textAlign: "center",
  color: theme.app.text.secondary,
  fontSize: "0.875rem",
});
