"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import {
  DashboardAppearanceProvider,
  useDashboardMuiTheme,
} from "@/lib/dashboard-appearance/context";

function MuiThemeBridge({ children }: { children: React.ReactNode }) {
  const muiTheme = useDashboardMuiTheme();
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <DashboardAppearanceProvider>
      <MuiThemeBridge>{children}</MuiThemeBridge>
    </DashboardAppearanceProvider>
  );
}
