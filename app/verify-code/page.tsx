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
  resendTextStyles,
  resendLinkStyles,
} from "./verify-code.styles";

export default function VerifyCodePage() {
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
            alt="Verify code illustration"
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
                  Verify code
                </Box>

                <Box component="p" sx={descriptionStyles as SxProps<Theme>}>
                  An authentication code has been sent to your email.
                </Box>

                <InputField
                  label="Enter Code"
                  name="code"
                  type="text"
                  placeholder="Enter your code"
                />

                <Box component="p" sx={resendTextStyles as SxProps<Theme>}>
                  Didn&apos;t receive a code?{" "}
                  <TextLink href="#" sx={resendLinkStyles as SxProps<Theme>}>
                    Resend
                  </TextLink>
                </Box>

                <Button fullWidth type="submit" sx={signInButtonStyles as SxProps<Theme>}>
                  Confirm
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
