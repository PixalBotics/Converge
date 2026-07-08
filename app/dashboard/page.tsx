"use client";

import Box from "@mui/material/Box";
import { useAuth } from "@/lib/auth/AuthContext";
import SupervisorDashboardOverview from "./supervisor-dashboard/SupervisorDashboardOverview";
import AgentDashboardOverview from "./agent-dashboard/AgentDashboardOverview";
import QaDashboardOverview from "./qa-dashboard/QaDashboardOverview";
import CompanyAdminOverview from "./company-admin-dashboard/CompanyAdminOverview";
import SupperDashboardOverview from "./supper-dashboard/SupperDashboardOverview";
import { pageWrapper } from "./dashboard.styles";

export default function DashboardPage() {
  const { user } = useAuth();

  const isHrAdmin = user?.role === "hr-admin";
  const isNetworkAdmin = user?.role === "network-admin";
  const isManager = user?.role === "manager";
  const isEmployee = user?.role === "user";

  const overview = isHrAdmin ? (
    <SupervisorDashboardOverview />
  ) : isNetworkAdmin ? (
    <AgentDashboardOverview />
  ) : isManager ? (
    <QaDashboardOverview />
  ) : isEmployee ? (
    <CompanyAdminOverview />
  ) : (
    <SupperDashboardOverview />
  );

  return (
    <Box sx={pageWrapper}>
      {overview}
    </Box>
  );
}
