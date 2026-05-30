"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { ReactNode } from "react";
import type { RuntimeChatAppearance } from "@/lib/widget-runtime/widget-runtime-appearance";

/**
 * Isolates embed iframe from dashboard MUI theme (purple input glow, dark text defaults).
 */
export function EmbedWidgetTheme({
  appearance,
  children,
}: {
  appearance: RuntimeChatAppearance;
  children: ReactNode;
}) {
  const c = appearance.colors;
  const theme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: c.primary,
        dark: appearance.launcher.buttonHoverColor,
        contrastText: c.outgoingBubbleText,
      },
      secondary: { main: c.secondary, contrastText: c.inquiryIdleText },
      text: {
        primary: c.labelText,
        secondary: c.mutedText,
      },
      background: {
        default: c.panelBackground,
        paper: c.panelBackground,
      },
      divider: c.inputBorder,
    },
    typography: {
      fontFamily: c.fontFamily,
      fontSize: c.bodyFontSizePx,
    },
    shape: { borderRadius: appearance.borderRadiusPx },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            color: c.bodyText,
            backgroundColor: "transparent",
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: "inherit",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontFamily: c.fontFamily,
            boxShadow: "none",
          },
        },
      },
      MuiIconButton: {
        defaultProps: {
          disableRipple: true,
        },
        styleOverrides: {
          root: {
            boxShadow: "none !important",
            backgroundImage: "none",
            filter: "none",
            "&:hover": { boxShadow: "none !important" },
            "&:active": { boxShadow: "none !important" },
            "&:focus": { boxShadow: "none !important" },
            "&:focus-visible": { boxShadow: "none !important" },
            "&.Mui-focusVisible": { boxShadow: "none !important" },
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundImage: "none",
            boxShadow: "none",
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            "& fieldset": { borderColor: c.inputBorder },
            "&:hover fieldset": { borderColor: c.primary },
            "&.Mui-focused fieldset": { borderColor: c.primary },
            "&::before, &::after": { display: "none" },
          },
          input: {
            color: c.inputText,
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { color: c.labelText },
        },
      },
    },
  });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
