"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { partitionNavItemsByVisit } from "@/lib/dashboard/dashboard-module-visits";
import {
  DASHBOARD_UNVISITED_CHIP_LIMIT,
  useDashboardActivityNavItems,
} from "@/lib/hooks/useDashboardActivityNavItems";
import { useDashboardModuleVisits } from "@/lib/hooks/useDashboardModuleVisits";

/**
 * Compact reminder for modules the user has not opened yet.
 * Full navigation stays in the sidebar — we never dump the whole module tree here.
 */
export function DashboardUnvisitedBanner() {
  const theme = useTheme() as AppTheme;
  const items = useDashboardActivityNavItems();
  const { visited, markVisited } = useDashboardModuleVisits();

  const { unvisited } = partitionNavItemsByVisit(items, visited);
  if (unvisited.length === 0) return null;

  const visible = unvisited.slice(0, DASHBOARD_UNVISITED_CHIP_LIMIT);
  const hiddenCount = unvisited.length - visible.length;

  return (
    <Box
      component="section"
      data-dashboard-section="unvisited-banner"
      sx={{
        p: { xs: 1.25, sm: 1.5 },
        borderRadius: "12px",
        border: `1px solid ${alpha(theme.app.dashboard.accentOrange, 0.35)}`,
        bgcolor: alpha(theme.app.dashboard.accentOrange, 0.08),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, mb: 1.25 }}>
        <ExploreOutlinedIcon
          sx={{ fontSize: 20, color: theme.app.dashboard.accentOrange, mt: 0.15, flexShrink: 0 }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.text.primary, fontSize: 14 }}>
            {unvisited.length} area{unvisited.length === 1 ? "" : "s"} you haven&apos;t opened yet
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 12 }}>
            Pick one below or use the menu on the left for everything else.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "center" }}>
        {visible.map((item) => (
          <Box
            key={item.href}
            component={Link}
            href={item.href}
            onClick={() => markVisited(item.href)}
            sx={{
              px: 1.1,
              py: 0.55,
              borderRadius: "999px",
              border: `1px solid ${alpha(theme.app.dashboard.accentOrange, 0.4)}`,
              bgcolor: alpha(theme.app.dashboard.cardBg, 0.55),
              color: theme.app.text.primary,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
              lineHeight: 1.35,
              transition: "background-color 0.15s ease, border-color 0.15s ease",
              "&:hover": {
                bgcolor: alpha(theme.app.dashboard.accentOrange, 0.14),
                borderColor: alpha(theme.app.dashboard.accentOrange, 0.65),
              },
            }}
          >
            {item.label}
          </Box>
        ))}
        {hiddenCount > 0 ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 12, px: 0.5 }}>
            +{hiddenCount} more in the sidebar
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
