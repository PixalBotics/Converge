"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import { Button, InputField, TextLink } from "@/components/common";
import { AuthInlineLoading } from "../_components/AuthInlineLoading";
import { AuthNavigationLink } from "../_components/AuthNavigationLink";
import { AUTH_PATHS } from "../constants";
import { useAuthPublicOnlyRoute } from "../use-auth-public-only-route";
import {
  authInputFieldStyles,
  footerTextStyles,
  authFormColumnSx,
  formStackStyles,
  resendLinkStyles,
  resendTextStyles,
  signInButtonStyles,
  signUpLinkStyles,
} from "../auth-layout.styles";

export default function VerifyCodePage() {
  const theme = useTheme();
  const block = useAuthPublicOnlyRoute();

  if (block) {
    return <AuthInlineLoading message="Checking session…" />;
  }

  return (
    <Box
      component="form"
      noValidate
      sx={authFormColumnSx}
    >
      <Stack spacing={2.5} sx={formStackStyles}>
        <InputField
          label="Enter Code"
          name="code"
          type="text"
          placeholder="Enter your code"
          sx={authInputFieldStyles}
        />

        <Box component="p" sx={resendTextStyles(theme) as SxProps<Theme>}>
          Didn&apos;t receive a code?{" "}
          <TextLink href="#" sx={resendLinkStyles(theme) as SxProps<Theme>}>
            Resend
          </TextLink>
        </Box>

        <Button fullWidth type="submit" sx={signInButtonStyles(theme) as SxProps<Theme>}>
          Confirm
        </Button>
      </Stack>

      <Box component="p" sx={footerTextStyles(theme) as SxProps<Theme>}>
        Remember password?{" "}
        <AuthNavigationLink href={AUTH_PATHS.login} sx={signUpLinkStyles(theme) as SxProps<Theme>}>
          Log in
        </AuthNavigationLink>
      </Box>
    </Box>
  );
}
