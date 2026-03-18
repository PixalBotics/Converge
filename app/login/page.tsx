"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  AppCard,
  Button,
  Checkbox,
  InputField,
  Label,
  TextLink,
  SocialAuthButton,
} from "@/components/common";
import {
  GoogleIcon,
  GitHubIcon,
  FacebookIcon,
} from "@/components/common/SocialAuthButton/social-icons";
import { loginSvg, logoSvg } from "@/assets";
import { useAuth } from "@/lib/auth";
import {
  pageWrapperStyles,
  contentWrapperStyles,
  illustrationWrapperStyles,
  illustrationImgStyles,
  formWrapperStyles,
  formCardStyles,
  formStackStyles,
  logoWrapperStyles,
  logoImgStyles,
  rememberForgotRowStyles,
  formControlLabelStyles,
  checkboxStyles,
  signInButtonStyles,
  dividerStyles,
  orTextStyles,
  forgotPasswordLabelStyles,
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
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = (values: LoginFormValues) => {
    const result = login({
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

  if (isLoading || isAuthenticated) return null;

  return (
    <Box sx={pageWrapperStyles as SxProps<Theme>}>
      <Box sx={contentWrapperStyles}>
        <Box sx={illustrationWrapperStyles}>
          <Box
            component="img"
            src={loginSvg}
            alt="Login illustration"
            sx={illustrationImgStyles}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </Box>

        <Box sx={formWrapperStyles}>
          <AppCard sx={formCardStyles}>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit(onSubmit)}
            >
              <Stack spacing={2.5} sx={formStackStyles}>
                <Box sx={logoWrapperStyles}>
                  <Box
                    component="img"
                    src={logoSvg}
                    alt="interchanges"
                    sx={logoImgStyles}
                  />
                </Box>

                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <InputField
                      label="Email"
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="licenseKey"
                  control={control}
                  render={({ field, fieldState }) => (
                    <InputField
                      label="License Key"
                      type="text"
                      placeholder="License key (optional for demo)"
                      {...field}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
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
                  <TextLink href="/forgot-password">
                    <Label variant="mediumSmall" component="span" sx={forgotPasswordLabelStyles}>
                      Forgot Password?
                    </Label>
                  </TextLink>
                </Box>

                <Button
                  fullWidth
                  type="submit"
                  disabled={isSubmitting}
                  sx={signInButtonStyles as SxProps<Theme>}
                >
                  Sign In
                </Button>

                <Divider sx={dividerStyles as SxProps<Theme>}>
                  <Typography component="span" variant="body2" sx={orTextStyles as SxProps<Theme>}>
                    OR
                  </Typography>
                </Divider>

                <Stack
                  direction="row"
                  spacing={{ xs: 1, sm: 2 }}
                  justifyContent="center"
                  alignItems="center"
                >
                  <SocialAuthButton
                    provider="google"
                    icon={<GoogleIcon />}
                    aria-label="Sign in with Google"
                  />
                  <SocialAuthButton
                    provider="github"
                    icon={<GitHubIcon />}
                    aria-label="Sign in with GitHub"
                  />
                  <SocialAuthButton
                    provider="facebook"
                    icon={<FacebookIcon />}
                    aria-label="Sign in with Facebook"
                  />
                </Stack>

                <Typography variant="body2" sx={{ textAlign: "center", color: "rgba(203, 213, 225, 0.8)", pt: 0.5 }}>
                  Don&apos;t have an account?{" "}
                  <TextLink href="/signup" sx={{ color: "primary.main" }}>Sign Up</TextLink>
                </Typography>
              </Stack>
            </Box>
          </AppCard>
        </Box>
      </Box>
    </Box>
  );
}
