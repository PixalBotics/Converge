"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import SupervisorDashboardOverview from "./supervisor-dashboard/SupervisorDashboardOverview";
import AgentDashboardOverview from "./agent-dashboard/AgentDashboardOverview";
import QaDashboardOverview from "./qa-dashboard/QaDashboardOverview";
import CompanyAdminOverview from "./company-admin-dashboard/CompanyAdminOverview";
import SupperDashboardOverview from "./supper-dashboard/SupperDashboardOverview";

export default function DashboardPage() {
  const { user } = useAuth();

  const isHrAdmin = user?.role === "hr-admin";
  const isNetworkAdmin = user?.role === "network-admin";
  const isManager = user?.role === "manager";
  const isEmployee = user?.role === "user";

  if (isHrAdmin) {
    return <SupervisorDashboardOverview />;
  }

  if (isNetworkAdmin) {
    return <AgentDashboardOverview />;
  }

  if (isManager) {
    return <QaDashboardOverview />;
  }

  if (isEmployee) {
    return <CompanyAdminOverview />;
  }

  return <SupperDashboardOverview />;
}
