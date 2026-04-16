"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import { usePathname } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import { AppCard } from "@/components/common";
import { loginSvg, logoSvg } from "@/assets";
import { LoginParticles } from "../login/LoginParticles";
import { getAuthCardCopy } from "../auth-card-copy";
import {
  authShellCardStyles,
  contentWrapperStyles,
  descriptionStyles,
  formWrapperStyles,
  illustrationImgStyles,
  illustrationWrapperStyles,
  logoImgStyles,
  logoWrapperStyles,
  pageWrapperStyles,
  titleStyles,
} from "../auth-layout.styles";

type AuthShellProps = {
  children: ReactNode;
};

const cardBodyStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
  width: "100%",
};

const slotStyles: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  width: "100%",
};

/**
 * Auth chrome: particles, illustration, and glass card (logo + route title + slot) stay mounted.
 * Route pages only render the form body inside the slot.
 */
export function AuthShell({ children }: AuthShellProps) {
  const pathname = usePathname() ?? "";
  const theme = useTheme();
  const copy = getAuthCardCopy(pathname);

  return (
    <Box sx={pageWrapperStyles}>
      <LoginParticles />
      <Box sx={contentWrapperStyles}>
        <Box sx={illustrationWrapperStyles} aria-hidden>
          <Box
            component="img"
            src={loginSvg}
            alt=""
            sx={illustrationImgStyles}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </Box>
        <Box sx={formWrapperStyles}>
          <AppCard elevation={0} sx={authShellCardStyles(theme) as SxProps<Theme>}>
            <Box sx={cardBodyStyles}>
              <Box sx={logoWrapperStyles}>
                <Box
                  component="img"
                  src={logoSvg}
                  alt="interchanges"
                  sx={logoImgStyles}
                />
              </Box>
              <Fade
                key={pathname}
                in
                timeout={220}
                easing={theme.transitions.easing.easeOut}
                appear
              >
                <Box sx={{ ...slotStyles, outline: "none" }}>
                  {copy.heading ? (
                    <Box
                      component="h1"
                      sx={titleStyles(theme) as SxProps<Theme>}
                    >
                      {copy.heading}
                    </Box>
                  ) : null}
                  {copy.subheading ? (
                    <Box
                      component="p"
                      sx={descriptionStyles(theme) as SxProps<Theme>}
                    >
                      {copy.subheading}
                    </Box>
                  ) : null}
                  <Box sx={{ ...slotStyles, transform: "translateZ(0)" }}>
                    {children}
                  </Box>
                </Box>
              </Fade>
            </Box>
          </AppCard>
        </Box>
      </Box>
    </Box>
  );
}
