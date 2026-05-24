"use client";

import Box from "@mui/material/Box";
import { Typography, DashboardCard } from "@/components/common";
import type { AppTheme } from "@/theme/theme";
import {
  overviewCardsRow,
  overviewCard,
  overviewStatValue,
} from "../../overview.styles";

type Props = {
  theme: AppTheme;
  totalContacts: number;
  uniqueResellers: number;
  uniqueOrganizations: number;
  filteredCount: number;
  isFiltering: boolean;
};

export function PocListStatsCards({
  theme,
  totalContacts,
  uniqueResellers,
  uniqueOrganizations,
  filteredCount,
  isFiltering,
}: Props) {
  return (
    <Box
      sx={{
        ...overviewCardsRow,
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
      }}
    >
      <DashboardCard sx={overviewCard}>
        <Typography variant="mediumLarge" color="white" fontWeight={500}>
          Active contacts
        </Typography>
        <Box sx={overviewStatValue}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ color: theme.app.dashboard.accentBlue, lineHeight: 1.2 }}
          >
            {isFiltering ? filteredCount : totalContacts}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            {isFiltering ? `/ ${totalContacts} total` : "/ linked"}
          </Typography>
        </Box>
      </DashboardCard>

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
            {uniqueResellers}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            / with POC
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
            {uniqueOrganizations}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            / covered
          </Typography>
        </Box>
      </DashboardCard>
    </Box>
  );
}
