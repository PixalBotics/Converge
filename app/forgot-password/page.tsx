"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";
import { AppCard, Button, InputField, TextLink } from "@/components/common";
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
  formInnerStyles,
  logoWrapperStyles,
  logoImgStyles,
  titleStyles,
  descriptionStyles,
  signInButtonStyles,
  footerTextStyles,
  signUpLinkStyles,
} from "./forgot-password.styles";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) return null;

  return (
    <Box sx={pageWrapperStyles as SxProps<Theme>}>
      <Box sx={contentWrapperStyles}>
        <Box sx={illustrationWrapperStyles}>
          <Box
            component="img"
            src={loginSvg}
            alt="Forgot password illustration"
            sx={illustrationImgStyles}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </Box>

        <Box sx={formWrapperStyles}>
          <AppCard sx={formCardStyles}>
            <Box component="form" noValidate sx={formInnerStyles}>
              <Stack spacing={2.5} sx={formStackStyles}>
                <Box sx={logoWrapperStyles}>
                  <Box
                    component="img"
                    src={logoSvg}
                    alt="interchanges"
                    sx={logoImgStyles}
                  />
                </Box>

                <Box component="h1" sx={titleStyles as SxProps<Theme>}>
                  Forgot Password
                </Box>

                <Box component="p" sx={descriptionStyles as SxProps<Theme>}>
                  Don&apos;t worry, happens to all of us. Enter your email below
                  to recover your password
                </Box>

                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                />

                <Button fullWidth type="submit" sx={signInButtonStyles as SxProps<Theme>}>
                  Send OTP
                </Button>
              </Stack>

              <Box component="p" sx={footerTextStyles as SxProps<Theme>}>
                Remember password?{" "}
                <TextLink href="/login" sx={signUpLinkStyles as SxProps<Theme>}>
                  Log in
                </TextLink>
              </Box>
            </Box>
          </AppCard>
        </Box>
      </Box>
    </Box>
  );
}
