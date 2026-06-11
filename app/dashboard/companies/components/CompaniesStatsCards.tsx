"use client";

import Box from "@mui/material/Box";
import { Typography, DashboardCard } from "@/components/common";
import type { AppTheme } from "@/theme/theme";
import { overviewCardsRow, overviewCard, overviewStatValue } from "../overview.styles";

export function CompaniesStatsCards({
  theme,
  resellerCount,
  parentCompanyCount,
  childCompanyCount,
}: {
  theme: AppTheme;
  resellerCount: number;
  parentCompanyCount: number;
  childCompanyCount: number;
}) {
  return (
    <Box sx={overviewCardsRow}>
      <DashboardCard sx={overviewCard}>
        <Typography variant="mediumLarge" color="white" fontWeight={500}>
          Resellers
        </Typography>
        <Box sx={overviewStatValue}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: theme.app.dashboard.accentBlue, lineHeight: 1.2 }}
          >
            {resellerCount}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            /Total
          </Typography>
        </Box>
      </DashboardCard>

      <DashboardCard sx={overviewCard}>
        <Typography variant="mediumLarge" color="white" fontWeight={500}>
          Parent companies
        </Typography>
        <Box sx={overviewStatValue}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: theme.app.dashboard.accentBlue, lineHeight: 1.2 }}
          >
            {parentCompanyCount}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            /Total
          </Typography>
        </Box>
      </DashboardCard>

      <DashboardCard sx={overviewCard}>
        <Typography variant="mediumLarge" color="white" fontWeight={500}>
          Child companies
        </Typography>
        <Box sx={overviewStatValue}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: theme.app.dashboard.accentBlue, lineHeight: 1.2 }}
          >
            {childCompanyCount}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            /Total
          </Typography>
        </Box>
      </DashboardCard>
    </Box>
  );
}
