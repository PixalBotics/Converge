"use client";

import { useForm, Controller } from "react-hook-form";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import { Button, InputField } from "@/components/common";
import { getAuthEmailRules, isForgotPasswordOtpApiEnabled } from "@/lib/auth";
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

type ForgotFormValues = {
  email: string;
};

const defaultValues: ForgotFormValues = { email: "" };

export default function ForgotPasswordPage() {
  const theme = useTheme();
  const block = useAuthPublicOnlyRoute();
  const apiEnabled = isForgotPasswordOtpApiEnabled();

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<ForgotFormValues>({
    defaultValues,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  if (block) {
    return <AuthInlineLoading message="Checking session…" />;
  }

  const onSubmit = async (_values: ForgotFormValues) => {
    if (!apiEnabled) {
      return;
    }
    // TODO: call forgot-password / send OTP API when backend is ready
  };

  /** Valid email shape + OTP API flag (until then button stays disabled). */
  const canSendOtp = isValid && apiEnabled;

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      sx={authFormColumnSx}
    >
      <Stack spacing={2.5} sx={formStackStyles}>
        <Controller
          name="email"
          control={control}
          rules={getAuthEmailRules<ForgotFormValues, "email">()}
          render={({ field, fieldState }) => (
            <InputField
              label="Email"
              type="email"
              placeholder="Enter your email"
              {...field}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              sx={authInputFieldStyles}
            />
          )}
        />

        <Button
          fullWidth
          type="submit"
          disabled={!canSendOtp || isSubmitting}
          sx={signInButtonStyles(theme) as SxProps<Theme>}
        >
          Send OTP
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
