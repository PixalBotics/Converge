"use client";

import { useMemo } from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import type { ShiftCoverage } from "@/api/types/shift-coverage.types";
import type {
  OperatingChannels,
  ServiceChannel,
  WebsiteDepartmentRosterRow,
} from "@/api/types/website-assignments.types";
import type { ServiceSchedulingTopic } from "@/services/chat/service-scheduling.types";
import { useServiceSchedulingQuery } from "@/features/chat-settings/hooks/useServiceScheduling";
import { emptyStatePanelSx } from "../styles/website-assignment-ui.styles";
import { buildVisitorTopicContexts } from "../utils/roster-topic.utils";
import { TopicAgentRosterPanel } from "./TopicAgentRosterPanel";

interface WebsiteDepartmentRosterProps {
  websiteId: string;
  operatingChannels: OperatingChannels;
  allowedAssignmentChannels: ServiceChannel[];
  departmentRoster: WebsiteDepartmentRosterRow[];
  canAssign: boolean;
}

function TopicRosterSummary({
  topics,
  departmentRoster,
}: {
  topics: ServiceSchedulingTopic[];
  departmentRoster: WebsiteDepartmentRosterRow[];
}) {
  const theme = useTheme() as AppTheme;
  const contexts = useMemo(
    () => buildVisitorTopicContexts(topics, departmentRoster),
    [topics, departmentRoster],
  );

  if (contexts.length === 0) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography fontWeight={700} sx={{ fontSize: 14, mb: 1 }}>
        Topic map (service scheduling)
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {contexts.map((t) => (
          <Box
            key={t.routingKey}
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1.2fr 1fr 1fr" },
              gap: 1,
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {t.clientLabel}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                {t.routingKey}
              </Typography>
            </Box>
            <Chip label={`Internal → ${t.internalDepartmentName}`} size="small" sx={{ justifyContent: "flex-start" }} />
            <Chip label={`External → ${t.externalDepartmentName}`} size="small" sx={{ justifyContent: "flex-start" }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function WebsiteDepartmentRoster({
  websiteId,
  operatingChannels,
  allowedAssignmentChannels,
  departmentRoster,
  canAssign,
}: WebsiteDepartmentRosterProps) {
  const theme = useTheme() as AppTheme;
  const schedulingQuery = useServiceSchedulingQuery(websiteId, true);
  const topics = schedulingQuery.data?.topics ?? [];

  if (departmentRoster.length === 0 && topics.length === 0) {
    const schedulingHref = `/dashboard/website-assigning/website/${encodeURIComponent(websiteId)}/service-scheduling`;
    return (
      <Box sx={emptyStatePanelSx}>
        <Typography variant="body2" sx={{ mb: 1.5, color: theme.app.dashboard.textMuted }}>
          No visitor topics yet. In service scheduling, add a topic (e.g. sale inquire) and link it to
          one internal and one external department — then assign agents by channel and topic below.
        </Typography>
        <Button type="button" variant="primary" size="small" component={NextLink} href={schedulingHref}>
          Open service scheduling
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 2, lineHeight: 1.6 }}>
        Pick <strong>Internal</strong> or <strong>External</strong>, then the visitor topic. Agents you
        assign apply only to that topic&apos;s department for that channel — matching service scheduling.
      </Typography>

      <TopicAgentRosterPanel
        websiteId={websiteId}
        operatingChannels={operatingChannels}
        allowedChannels={allowedAssignmentChannels}
        departmentRoster={departmentRoster}
        topics={topics}
        canEdit={canAssign}
      />

      <TopicRosterSummary topics={topics} departmentRoster={departmentRoster} />
    </Box>
  );
}
