"use client";

import { useLayoutEffect, useRef } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { defaultAppearanceMuiTheme } from "@/lib/theme/default-appearance-theme";

/**
 * Login always uses the built-in Default appearance, not the user’s dashboard theme / pick color.
 */
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  const prevBodyBg = useRef<string | undefined>(undefined);

  useLayoutEffect(() => {
    prevBodyBg.current = document.body.style.background;
    document.body.style.background = defaultAppearanceMuiTheme.appBackground;
    return () => {
      document.body.style.background = prevBodyBg.current ?? "";
    };
  }, []);

  return <ThemeProvider theme={defaultAppearanceMuiTheme}>{children}</ThemeProvider>;
}
