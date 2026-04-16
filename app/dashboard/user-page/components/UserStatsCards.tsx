"use client";

import Box from "@mui/material/Box";
import { Typography, DashboardCard } from "@/components/common";
import type { AppTheme } from "@/theme/theme";
import { overviewCardsRow, overviewCard, overviewStatValue } from "../overview.styles";

export function UserStatsCards({
  theme,
  totalUsers,
  internalCount,
  externalCount,
}: {
  theme: AppTheme;
  totalUsers: number;
  internalCount: number;
  externalCount: number;
}) {
  return (
    <Box sx={overviewCardsRow}>
      <DashboardCard sx={overviewCard}>
        <Typography variant="mediumLarge" color="white" fontWeight={500}>
          Total Users
        </Typography>
        <Box sx={overviewStatValue}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: theme.app.dashboard.accentBlue, lineHeight: 1.2 }}
          >
            {totalUsers}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            /All
          </Typography>
        </Box>
      </DashboardCard>

      <DashboardCard sx={overviewCard}>
        <Typography variant="mediumLarge" color="white" fontWeight={500}>
          Internal Users
        </Typography>
        <Box sx={overviewStatValue}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: theme.app.dashboard.accentBlue, lineHeight: 1.2 }}
          >
            {internalCount}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            /Active
          </Typography>
        </Box>
      </DashboardCard>

      <DashboardCard sx={overviewCard}>
        <Typography variant="mediumLarge" color="white" fontWeight={500}>
          External Users
        </Typography>
        <Box sx={overviewStatValue}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: theme.app.dashboard.accentBlue, lineHeight: 1.2 }}
          >
            {externalCount}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            /Active
          </Typography>
        </Box>
      </DashboardCard>
    </Box>
  );
}
