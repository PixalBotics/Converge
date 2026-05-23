"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { EmailConfigCardTitleRow, EmailConfigIconBox } from "../styles/email-configuration.styled";
import { departmentsCardHeader } from "../styles/email-page.styles";

export function EmailTableCardHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const theme = useTheme() as AppTheme;

  return (
    <Box
      sx={{
        ...departmentsCardHeader,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
        mb: 0,
      }}
    >
      <EmailConfigCardTitleRow>
        <EmailConfigIconBox>{icon}</EmailConfigIconBox>
        <div>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mt: 0.25, display: "block" }}>
              {subtitle}
            </Typography>
          ) : null}
        </div>
      </EmailConfigCardTitleRow>
      {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
    </Box>
  );
}
