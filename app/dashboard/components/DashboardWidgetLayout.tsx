"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { OP, hasAttendanceSelfOperational } from "@/lib/permissions";
import {
  collectEnabledDashboardWidgetCodes,
  resolveOrderedDashboardWidgets,
} from "@/lib/permissions/dashboard-widget-layout";
import { DASHBOARD_WIDGET } from "@/lib/permissions/dashboard-widget-permissions";
import { useDashboardWidgets } from "@/lib/permissions/use-dashboard-widgets";
import AgentDashboardOverview from "../agent-dashboard/AgentDashboardOverview";
import CompanyAdminOverview from "../company-admin-dashboard/CompanyAdminOverview";
import QaDashboardOverview from "../qa-dashboard/QaDashboardOverview";
import SupervisorDashboardOverview from "../supervisor-dashboard/SupervisorDashboardOverview";
import SupperDashboardOverview from "../supper-dashboard/SupperDashboardOverview";
import { dashboardHomeStack } from "../dashboard.styles";
import { DashboardHrmsSection } from "./DashboardHrmsSection";
import { DashboardPersonalSection } from "./DashboardPersonalSection";
import { DashboardUnvisitedBanner } from "./DashboardUnvisitedBanner";
import { DashboardWidgetSection } from "./DashboardWidgetSection";

function DashboardWelcomeFallback() {
  const theme = useTheme() as AppTheme;
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: "12px",
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
        bgcolor: theme.app.dashboard.overlayLight,
        color: theme.app.dashboard.textMuted,
        fontSize: 14,
        lineHeight: 1.55,
      }}
    >
      <Typography variant="body2" sx={{ color: theme.app.text.primary, fontWeight: 600, mb: 0.75 }}>
        No dashboard widgets are assigned for your role yet.
      </Typography>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, fontSize: 13 }}>
        An administrator can enable widgets under Roles → Dashboard widgets (attendance, chat, HRMS,
        platform, etc.). Use the menu on the left to open Live chat, HRMS, and other areas.
      </Typography>
    </Box>
  );
}

function renderDashboardWidget(code: string): ReactNode {
  switch (code) {
    case DASHBOARD_WIDGET.ATTENDANCE_SELF:
      return <DashboardPersonalSection />;
    case DASHBOARD_WIDGET.HRMS_ATTENDANCE:
      return <DashboardHrmsSection widgetScope="attendance" />;
    case DASHBOARD_WIDGET.HRMS_LEAVE:
      return <DashboardHrmsSection widgetScope="leave" />;
    case DASHBOARD_WIDGET.CHAT_AGENT:
      return <AgentDashboardOverview embedded />;
    case DASHBOARD_WIDGET.CHAT_SUPERVISOR:
      return <SupervisorDashboardOverview embedded />;
    case DASHBOARD_WIDGET.CHAT_QA:
      return <QaDashboardOverview embedded />;
    case DASHBOARD_WIDGET.CHAT_COMPANY:
      return <CompanyAdminOverview embedded />;
    case DASHBOARD_WIDGET.PLATFORM_OVERVIEW:
      return (
        <SupperDashboardOverview
          embedded
          blocks={["user-metrics", "chat-charts", "status-metrics", "activity-log"]}
        />
      );
    case DASHBOARD_WIDGET.REVENUE:
      return <SupperDashboardOverview embedded blocks={["revenue"]} />;
    case DASHBOARD_WIDGET.ORG_SUMMARY:
      return <SupperDashboardOverview embedded blocks={["primary-metrics"]} />;
    default:
      return null;
  }
}

/** Renders dashboard cards in the order saved on the user's role. */
export function DashboardWidgetLayout() {
  const { dashboardWidgetOrder, hasOperational } = useAuth();
  const widgets = useDashboardWidgets();

  const hasAttendanceOps =
    hasOperational(OP.hrms.attendance.selfView) ||
    hasAttendanceSelfOperational(hasOperational) ||
    hasOperational(OP.hrms.attendance.view);

  const orderedCodes = useMemo(() => {
    const enabled = collectEnabledDashboardWidgetCodes(widgets, {
      includeAttendanceByOps: hasAttendanceOps,
    });
    return resolveOrderedDashboardWidgets(dashboardWidgetOrder, enabled);
  }, [dashboardWidgetOrder, widgets, hasAttendanceOps]);

  if (orderedCodes.length === 0) {
    return (
      <Box sx={dashboardHomeStack}>
        <DashboardUnvisitedBanner />
        <DashboardWelcomeFallback />
      </Box>
    );
  }

  return (
    <Box sx={dashboardHomeStack}>
      <DashboardUnvisitedBanner />
      {orderedCodes.map((code) => {
        const node = renderDashboardWidget(code);
        if (!node) return null;
        return (
          <DashboardWidgetSection key={code} widgetCode={code}>
            {node}
          </DashboardWidgetSection>
        );
      })}
    </Box>
  );
}
