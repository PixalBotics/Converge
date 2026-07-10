"use client";

import Box from "@mui/material/Box";
import { DashboardPageHeader } from "./components/DashboardPageHeader";
import { DashboardWidgetLayout } from "./components/DashboardWidgetLayout";
import { pageWrapper } from "./dashboard.styles";

export default function DashboardPage() {
  return (
    <Box sx={pageWrapper}>
      <Box component="section" data-dashboard-section="header">
        <DashboardPageHeader />
      </Box>
      <DashboardWidgetLayout />
    </Box>
  );
}
