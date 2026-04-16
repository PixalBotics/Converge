"use client";

import { useEffect, useRef } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { defaultAppearanceMuiTheme } from "@/lib/theme/default-appearance-theme";
import { FULL_PAGE_LOADER_BACKGROUND_GRADIENT } from "@/lib/theme/full-page-loader-background";
import { AuthShell } from "./_components/AuthShell";

/**
 * Auth segment: theme + body chrome + persistent split shell.
 * Route `page.tsx` files only swap the inner form slot (SPA-like feel).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const prevBodyBg = useRef<string | undefined>(undefined);

  // `useEffect` (not `useLayoutEffect`) so this never runs during SSR / non-browser runtimes.
  useEffect(() => {
    if (typeof document === "undefined") return;
    prevBodyBg.current = document.body.style.background;
    document.body.style.background = FULL_PAGE_LOADER_BACKGROUND_GRADIENT;
    return () => {
      if (typeof document === "undefined") return;
      document.body.style.background = prevBodyBg.current ?? "";
    };
  }, []);

  return (
    <ThemeProvider theme={defaultAppearanceMuiTheme}>
      <AuthShell>{children}</AuthShell>
    </ThemeProvider>
  );
}
