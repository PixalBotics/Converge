"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  Button,
  Checkbox,
  InputField,
  Label,
} from "@/components/common";
import { APP_PATHS, getAuthEmailRules, useAuth } from "@/lib/auth";
import { AuthInlineLoading } from "../_components/AuthInlineLoading";
import { AuthNavigationLink } from "../_components/AuthNavigationLink";
import { AUTH_PATHS } from "../constants";
import { authInputFieldStyles, signInButtonStyles } from "../auth-layout.styles";
import {
  forgotPasswordLabelStyles,
  formControlLabelStyles,
  checkboxStyles,
  loginFormStackStyles,
  rememberForgotRowStyles,
} from "./login.styles";

interface LoginFormValues {
  email: string;
  licenseKey: string;
  password: string;
  rememberMe: boolean;
}

const defaultValues: LoginFormValues = {
  email: "",
  licenseKey: "",
  password: "",
  rememberMe: false,
};

export default function LoginPage() {
  const theme = useTheme();
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) router.replace(APP_PATHS.dashboard);
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (values: LoginFormValues) => {
    const result = await login({
      email: values.email.trim(),
      password: values.password,
      licenseKey: values.licenseKey.trim() || undefined,
      rememberMe: values.rememberMe,
    });

    if (!result.success) {
      if (result.fieldErrors) {
        const { email, password, licenseKey } = result.fieldErrors;

        if (email) {
          setError("email", { type: "manual", message: email });
        }
        if (password) {
          setError("password", { type: "manual", message: password });
        }
        if (licenseKey) {
          setError("licenseKey", { type: "manual", message: licenseKey });
        }
      } else if (result.error) {
        setError("password", {
          type: "manual",
          message: result.error,
        });
      }
    }
  };

  if (isLoading || isAuthenticated) {
    return <AuthInlineLoading message="Redirecting…" />;
  }

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
    >
      <Stack direction="column" spacing={0} sx={loginFormStackStyles}>
        <Controller
          name="email"
          control={control}
          rules={getAuthEmailRules<LoginFormValues, "email">()}
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
        <Controller
          name="licenseKey"
          control={control}
          rules={{
            required: "License key is required",
          }}
          render={({ field, fieldState }) => (
            <InputField
              label="License Key"
              type="text"
              placeholder="Enter your license key"
              {...field}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              sx={authInputFieldStyles}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          rules={{
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          }}
          render={({ field, fieldState }) => (
            <InputField
              label="Password"
              type="password"
              placeholder="Enter your password"
              {...field}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              sx={authInputFieldStyles}
            />
          )}
        />

        <Box
          className="remember-forgot-row"
          sx={rememberForgotRowStyles}
        >
          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                sx={formControlLabelStyles}
                control={
                  <Checkbox
                    sx={checkboxStyles}
                    checked={field.value}
                    onChange={(_, v) => field.onChange(v)}
                    onBlur={field.onBlur}
                  />
                }
                label={
                  <Label variant="regular">Remember me</Label>
                }
              />
            )}
          />
          <AuthNavigationLink href={AUTH_PATHS.forgotPassword}>
            <Label variant="mediumSmall" component="span" sx={forgotPasswordLabelStyles}>
              Forgot Password?
            </Label>
          </AuthNavigationLink>
        </Box>

        <Button
          fullWidth
          type="submit"
          disabled={isSubmitting}
          sx={signInButtonStyles(theme) as SxProps<Theme>}
        >
          Sign In
        </Button>
      </Stack>
    </Box>
  );
}
