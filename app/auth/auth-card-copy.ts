import { AUTH_PATHS } from "./constants";

export type AuthCardCopy = {
  heading?: string;
  subheading?: string;
};

/**
 * Static copy for the auth card header (below logo). Keeps route pages focused on fields only.
 */
export function getAuthCardCopy(pathname: string): AuthCardCopy {
  switch (pathname) {
    case AUTH_PATHS.forgotPassword:
      return {
        heading: "Forgot Password",
        subheading:
          "Don't worry, happens to all of us. Enter your email below to recover your password",
      };
    case AUTH_PATHS.setPassword:
      return {
        heading: "Set a password",
        subheading:
          "Your previous password has been reset. Please set a new password for your account.",
      };
    case AUTH_PATHS.verifyCode:
      return {
        heading: "Verify code",
        subheading: "An authentication code has been sent to your email.",
      };
    default:
      return {};
  }
}
