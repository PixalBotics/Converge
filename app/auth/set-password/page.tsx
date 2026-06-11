"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import { confirmPasswordReset } from "@/api/auth/auth.api";
import { Button, InputField } from "@/components/common";
import {
  AUTH_PASSWORD_MESSAGES,
  clearPasswordResetEmail,
  getAuthPasswordRules,
  getPasswordResetEmail,
} from "@/lib/auth";
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

type SetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

export default function SetPasswordPage() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const block = useAuthPublicOnlyRoute();
  const email = useMemo(() => {
    const fromQuery = searchParams.get("email")?.trim().toLowerCase();
    if (fromQuery) return fromQuery;
    return getPasswordResetEmail() ?? "";
  }, [searchParams]);

  const code = useMemo(
    () => searchParams.get("code")?.trim() ?? "",
    [searchParams],
  );

  useEffect(() => {
    if (!email || !code) {
      router.replace(AUTH_PATHS.forgotPassword);
    }
  }, [email, code, router]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid, isSubmitting },
  } = useForm<SetPasswordFormValues>({
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const passwordValue = watch("password");

  const onSubmit = async (values: SetPasswordFormValues) => {
    if (!email || !code) return;
    await confirmPasswordReset({
      email,
      code,
      password: values.password,
    });
    clearPasswordResetEmail();
    router.replace(`${AUTH_PATHS.login}?reset=success`);
  };

  const disableForm = block || !email || !code;
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
          name="password"
          control={control}
          rules={getAuthPasswordRules<SetPasswordFormValues, "password">()}
          render={({ field, fieldState }) => (
            <InputField
              label="New password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter your password"
              {...field}
              disabled={disableForm}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              sx={authInputFieldStyles}
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            required: AUTH_PASSWORD_MESSAGES.required,
            validate: (value) =>
              value === passwordValue || AUTH_PASSWORD_MESSAGES.mismatch,
          }}
          render={({ field, fieldState }) => (
            <InputField
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              {...field}
              disabled={disableForm}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              sx={authInputFieldStyles}
            />
          )}
        />

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
