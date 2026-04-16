"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import { Button, InputField } from "@/components/common";
import { AuthInlineLoading } from "../_components/AuthInlineLoading";
import { AuthNavigationLink } from "../_components/AuthNavigationLink";
import { AUTH_PATHS } from "../constants";
import { useAuthPublicOnlyRoute } from "../use-auth-public-only-route";
import {
  authInputFieldStyles,
  footerTextStyles,
  authFormColumnSx,
  formStackStyles,
  signInButtonStyles,
  signUpLinkStyles,
} from "../auth-layout.styles";

export default function SetPasswordPage() {
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
          label="Create Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          sx={authInputFieldStyles}
        />

        <InputField
          label="Create Password"
          name="confirmPassword"
          type="password"
          placeholder="Enter your password"
          sx={authInputFieldStyles}
        />

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
