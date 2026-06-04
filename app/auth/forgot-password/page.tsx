"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import { requestPasswordReset } from "@/api/auth/auth.api";
import { Button, InputField } from "@/components/common";
import {
  getAuthEmailRules,
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
  signInButtonStyles,
  signUpLinkStyles,
} from "../auth-layout.styles";

type ForgotFormValues = {
  email: string;
};

const defaultValues: ForgotFormValues = { email: "" };

export default function ForgotPasswordPage() {
  const theme = useTheme();
  const router = useRouter();
  const block = useAuthPublicOnlyRoute();
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<ForgotFormValues>({
    defaultValues,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onSubmit = async (values: ForgotFormValues) => {
    const email = values.email.trim().toLowerCase();
    const message = await requestPasswordReset({ email });
    setPasswordResetEmail(email);
    setInfoMessage(message);
    router.push(
      `${AUTH_PATHS.verifyCode}?email=${encodeURIComponent(email)}`,
    );
  };

  const disableForm = block;
  const disableSubmit = disableForm || !isValid || isSubmitting;

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      sx={authFormColumnSx}
    >
      <Stack spacing={2} sx={formStackStyles}>
        {infoMessage ? (
          <Alert severity="info">{infoMessage}</Alert>
        ) : null}

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
