"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import { verifyPasswordResetOtp, requestPasswordReset } from "@/api/auth/auth.api";
import { Button, InputField, TextLink } from "@/components/common";
import {
  getAuthOtpRules,
  getPasswordResetEmail,
  setPasswordResetEmail,
} from "@/lib/auth";
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

type VerifyFormValues = {
  code: string;
};

export default function VerifyCodePage() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const block = useAuthPublicOnlyRoute();

  const email = useMemo(() => {
    const fromQuery = searchParams.get("email")?.trim().toLowerCase();
    if (fromQuery) return fromQuery;
    return getPasswordResetEmail() ?? "";
  }, [searchParams]);

  useEffect(() => {
    if (email) setPasswordResetEmail(email);
  }, [email]);

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<VerifyFormValues>({
    defaultValues: { code: "" },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onSubmit = async (values: VerifyFormValues) => {
    if (!email) {
      router.replace(AUTH_PATHS.forgotPassword);
      return;
    }
    await verifyPasswordResetOtp({
      email,
      code: values.code.trim(),
    });
    const params = new URLSearchParams({
      email,
      code: values.code.trim(),
    });
    router.push(`${AUTH_PATHS.setPassword}?${params.toString()}`);
  };

  const onResend = async () => {
    if (!email) {
      router.replace(AUTH_PATHS.forgotPassword);
      return;
    }
    await requestPasswordReset({ email });
  };

  const disableForm = block || !email;
  const disableSubmit = disableForm || !isValid || isSubmitting;

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      sx={authFormColumnSx}
    >
      <Stack spacing={2} sx={formStackStyles}>
        <Controller
          name="code"
          control={control}
          rules={getAuthOtpRules<VerifyFormValues, "code">()}
          render={({ field, fieldState }) => (
            <InputField
              label="Enter Code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              {...field}
              disabled={disableForm}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              sx={authInputFieldStyles}
            />
          )}
        />

        <Box component="p" sx={resendTextStyles(theme) as SxProps<Theme>}>
          Didn&apos;t receive a code?{" "}
          <TextLink
            href="#"
            onClick={() => {
              if (disableForm || isSubmitting) return;
              void onResend();
            }}
            sx={resendLinkStyles(theme) as SxProps<Theme>}
          >
            Resend
          </TextLink>
        </Box>

        <Button
          fullWidth
          type="submit"
          disabled={disableSubmit}
          sx={signInButtonStyles(theme) as SxProps<Theme>}
        >
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
