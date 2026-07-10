"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import {
  DASHBOARD_WIDGET_SECTION_TITLES,
} from "@/lib/permissions/dashboard-widget-layout";
import type { DashboardWidgetPermission } from "@/lib/permissions/dashboard-widget-permissions";
import {
  dashboardWidgetSection,
  dashboardWidgetSectionBody,
  dashboardWidgetSectionHeader,
} from "../dashboard.styles";

export type DashboardWidgetSectionProps = {
  widgetCode: string;
  title?: string;
  children: ReactNode;
};

export function DashboardWidgetSection({
  widgetCode,
  title,
  children,
}: DashboardWidgetSectionProps) {
  const theme = useTheme() as AppTheme;
  const sectionTitle =
    title ??
    DASHBOARD_WIDGET_SECTION_TITLES[widgetCode as DashboardWidgetPermission] ??
    "Dashboard";

  return (
    <Box
      component="section"
      data-dashboard-widget={widgetCode}
      sx={dashboardWidgetSection}
    >
      <Box sx={dashboardWidgetSectionHeader}>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{
            color: theme.app.text.primary,
            fontSize: { xs: 15, sm: 16 },
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
          }}
        >
          {sectionTitle}
        </Typography>
      </Box>
      <Box sx={dashboardWidgetSectionBody}>{children}</Box>
    </Box>
  );
}
