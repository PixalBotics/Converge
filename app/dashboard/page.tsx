"use client";

import Box from "@mui/material/Box";
import { DashboardHrmsSection } from "./components/DashboardHrmsSection";
import { DashboardOverviewSections } from "./components/DashboardOverviewSections";
import { DashboardPageHeader } from "./components/DashboardPageHeader";
import { DashboardPersonalSection } from "./components/DashboardPersonalSection";
import { pageWrapper } from "./dashboard.styles";

export default function DashboardPage() {
  return (
    <Box sx={pageWrapper}>
      <DashboardPageHeader />
      <DashboardPersonalSection />
      <DashboardOverviewSections />
      <DashboardHrmsSection />
    </Box>
  );
}
