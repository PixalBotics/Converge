"use client";

import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

function appTheme(theme: object): AppTheme {
  return theme as AppTheme;
}

/** Popover inner root: caps height so the footer (Done) stays visible; body scrolls. */
export const ToolbarFilterPopoverPanelRoot = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  width: "100%",
  maxHeight: "min(72dvh, 520px)",
}));

export const ToolbarFilterPopoverPanelBody = styled(Box)(({ theme }) => ({
  flex: "1 1 auto",
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  padding: theme.spacing(2),
  color: appTheme(theme).app.text.primary,
}));

export const ToolbarFilterPopoverPanelFooter = styled(Box)(({ theme }) => {
  const t = appTheme(theme);
  return {
    flexShrink: 0,
    width: "100%",
    boxSizing: "border-box",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    borderTop: `1px solid ${t.app.dashboard.cardBorder}`,
    backgroundColor:
      theme.palette.mode === "light" ? "rgba(255, 255, 255, 0.08)" : "rgba(8, 12, 22, 0.38)",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "stretch",
      "& > *": {
        width: "100%",
      },
    },
  };
});
