"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  Button,
  Checkbox,
  InputField,
  Label,
} from "@/components/common";
import { getAuthEmailRules, useAuth } from "@/lib/auth";
import { parseSafeDashboardNextPath } from "@/lib/auth/safe-next-path";
import { resolveDashboardLandingHref } from "@/lib/permissions";
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
  const [safeNextPath, setSafeNextPath] = useState<string | null>(null);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);
  const [passwordResetNotice, setPasswordResetNotice] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSafeNextPath(parseSafeDashboardNextPath(params.get("next")));
    setSessionExpiredNotice(params.get("session") === "expired");
    setPasswordResetNotice(params.get("reset") === "success");
  }, []);

  const {
    login,
    isAuthenticated,
    isLoading,
    user,
    permissionsByType,
    permissionsSyncing,
    isPlatformAdmin,
  } = useAuth();
  const disableForm = isLoading || isAuthenticated;
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;
    if (permissionsSyncing) return;
    const isDemoUser = user?.email?.trim().toLowerCase() === "demo@gmail.com";
    const landing = resolveDashboardLandingHref({
      permissionsByType,
      isPlatformAdmin,
      isDemoUser: Boolean(isDemoUser),
    });
    router.replace(safeNextPath ?? landing);
  }, [
    isAuthenticated,
    isLoading,
    permissionsSyncing,
    permissionsByType,
    isPlatformAdmin,
    user,
    router,
    safeNextPath,
  ]);

  const onSubmit = async (values: LoginFormValues) => {
    const result = await login({
      email: values.email.trim(),
      password: values.password,
      licenseKey: values.licenseKey.trim() || undefined,
      rememberMe: values.rememberMe,
    });

    if (!result.success) {
      if (result.fieldErrors) {
        clearErrors();
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
        clearErrors();
        setError("password", {
          type: "manual",
          message: result.error,
        });
      } else {
        /** API failure was surfaced only via the global toast — clear field error state. */
        clearErrors();
      }
    }
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
    >
      <Stack direction="column" spacing={0} sx={loginFormStackStyles}>
        {sessionExpiredNotice ? (
          <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
            Your session expired. Sign in again to continue.
          </Alert>
        ) : null}
        {passwordResetNotice ? (
          <Alert severity="success" variant="outlined" sx={{ mb: 2 }}>
            Password updated. Sign in with your new password and license key.
          </Alert>
        ) : null}
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
              disabled={disableForm}
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
              disabled={disableForm}
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
              disabled={disableForm}
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
                    disabled={disableForm}
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
          disabled={disableForm || isSubmitting}
          sx={signInButtonStyles(theme) as SxProps<Theme>}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={20} thickness={5} sx={{ color: "currentColor" }} />
              Sign In
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </Stack>
    </Box>
  );
}
