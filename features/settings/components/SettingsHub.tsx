"use client";

import Box from "@mui/material/Box";
import NextLink from "next/link";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { PAGE } from "@/lib/permissions/permission-constants";

type SettingsCard = {
  href: string;
  title: string;
  description: string;
  visible: boolean;
};

export function SettingsHub() {
  const theme = useTheme() as AppTheme;
  const { hasPage, isPlatformAdmin } = useAuth();

  const cards: SettingsCard[] = [
    {
      href: "/dashboard/settings/profile",
      title: "Profile",
      description: "Your name, email, and account details.",
      visible: hasPage(PAGE.SETTINGS),
    },
    {
      href: "/dashboard/security",
      title: "Security",
      description: "Sessions and security preferences (coming soon).",
      visible: hasPage(PAGE.SETTINGS),
    },
    {
      href: "/dashboard/settings/logs",
      title: "System logs",
      description: "Platform audit and analytics events.",
      visible: isPlatformAdmin || hasPage(PAGE.OBSERVABILITY_LOGS),
    },
  ].filter((c) => c.visible);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: { xs: 1.5, md: 2.5 } }}>
      <Box>
        <Typography variant="h6" fontWeight={600} color="white">
          Settings
        </Typography>
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.5 }}>
          Account and platform configuration.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
          gap: 2,
        }}
      >
        {cards.map((card) => (
          <NextLink key={card.href} href={card.href} style={{ textDecoration: "none" }}>
            <DashboardCard
              sx={{
                p: 2,
                height: "100%",
                cursor: "pointer",
                transition: "border-color 0.15s",
                "&:hover": { borderColor: theme.app.dashboard.cardBorder },
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} color="white">
                {card.title}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 1 }}>
                {card.description}
              </Typography>
            </DashboardCard>
          </NextLink>
        ))}
      </Box>
    </Box>
  );
}
