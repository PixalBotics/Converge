"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { useDashboardWidgets } from "@/lib/permissions/use-dashboard-widgets";
import AgentDashboardOverview from "../agent-dashboard/AgentDashboardOverview";
import CompanyAdminOverview from "../company-admin-dashboard/CompanyAdminOverview";
import QaDashboardOverview from "../qa-dashboard/QaDashboardOverview";
import SupervisorDashboardOverview from "../supervisor-dashboard/SupervisorDashboardOverview";
import SupperDashboardOverview from "../supper-dashboard/SupperDashboardOverview";

function DashboardWelcomeFallback() {
  return (
    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.65)" }}>
      Your role has dashboard access. Ask an administrator to assign dashboard widgets for this role.
    </Typography>
  );
}

/** Renders every dashboard overview assigned to the user's role via dashboard widgets. */
export function DashboardOverviewSections() {
  const widgets = useDashboardWidgets();

  const sections: { key: string; node: ReactNode }[] = [];

  if (widgets.platformOverview) {
    sections.push({ key: "platform", node: <SupperDashboardOverview embedded /> });
  }
  if (widgets.chatSupervisor) {
    sections.push({ key: "supervisor", node: <SupervisorDashboardOverview embedded /> });
  }
  if (widgets.chatCompany) {
    sections.push({ key: "company", node: <CompanyAdminOverview embedded /> });
  }
  if (widgets.chatQa) {
    sections.push({ key: "qa", node: <QaDashboardOverview embedded /> });
  }
  if (widgets.chatAgent) {
    sections.push({ key: "agent", node: <AgentDashboardOverview embedded /> });
  }

  if (sections.length === 0) {
    return <DashboardWelcomeFallback />;
  }

  if (sections.length === 1) {
    return <>{sections[0].node}</>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {sections.map((section) => (
        <Box key={section.key}>{section.node}</Box>
      ))}
    </Box>
  );
}
