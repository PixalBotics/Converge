import type { SxProps, Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import {
  pageWrapperStyles,
  contentWrapperStyles,
  illustrationWrapperStyles,
  illustrationImgStyles,
  formWrapperStyles,
  formCardStyles,
  formStackStyles,
  formInnerStyles,
  logoImgStyles,
  titleStyles,
  descriptionStyles,
  signInButtonStyles,
  footerTextStyles,
  signUpLinkStyles,
} from "../forgot-password/forgot-password.styles";

export {
  pageWrapperStyles,
  contentWrapperStyles,
  illustrationWrapperStyles,
  illustrationImgStyles,
  formWrapperStyles,
  formCardStyles,
  formStackStyles,
  formInnerStyles,
  logoImgStyles,
  titleStyles,
  descriptionStyles,
  signInButtonStyles,
  footerTextStyles,
  signUpLinkStyles,
};

export const logoWrapperStyles: SxProps<Theme> = {
  textAlign: "center",
  mb: 1,
};

export const resendTextStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  color: theme.app.text.secondary,
  fontSize: "0.875rem",
});

export const resendLinkStyles = (theme: Theme): SystemStyleObject<Theme> => ({
  color: theme.palette.primary.main,
});
