"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { logoSvg } from "@/assets";
import { Typography } from "@/components/common";
import { payPageContentSx, payPageHeaderSx, payPageShellSx } from "@/features/billing/pay-page.styles";

type Props = {
  children: ReactNode;
  title?: string;
};

export function PayPageShell({ children, title }: Props) {
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={payPageShellSx}>
      <Box sx={payPageHeaderSx}>
        <Box component="img" src={logoSvg} alt="Logo" sx={{ height: 32 }} />
        {title ? (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            {title}
          </Typography>
        ) : null}
      </Box>
      <Box sx={payPageContentSx}>{children}</Box>
    </Box>
  );
}
