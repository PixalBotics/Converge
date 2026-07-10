"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { useDashboardWidgets } from "@/lib/permissions/use-dashboard-widgets";
import {
  DASHBOARD_OVERVIEW_SECTION_ORDER,
  type DashboardOverviewSectionKey,
} from "../config/dashboard-layout.config";
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

  const sectionNodes: Partial<Record<DashboardOverviewSectionKey, ReactNode>> = {};

  if (widgets.platformOverview) {
    sectionNodes.platform = <SupperDashboardOverview embedded />;
  }
  if (widgets.chatSupervisor) {
    sectionNodes.supervisor = <SupervisorDashboardOverview embedded />;
  }
  if (widgets.chatCompany) {
    sectionNodes.company = <CompanyAdminOverview embedded />;
  }
  if (widgets.chatQa) {
    sectionNodes.qa = <QaDashboardOverview embedded />;
  }
  if (widgets.chatAgent) {
    sectionNodes.agent = <AgentDashboardOverview embedded />;
  }

  const sections = DASHBOARD_OVERVIEW_SECTION_ORDER.flatMap((key) => {
    const node = sectionNodes[key];
    return node ? [{ key, node }] : [];
  });

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
