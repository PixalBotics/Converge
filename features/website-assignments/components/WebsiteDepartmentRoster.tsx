"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type {
  OperatingChannels,
  ServiceChannel,
  WebsiteDepartmentRosterRow,
} from "@/api/types/website-assignments.types";
import type { ServiceSchedulingTopic } from "@/services/chat/service-scheduling.types";
import { useVisitorTopicsQuery } from "@/features/chat-settings/hooks/useServiceScheduling";
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
        Inquire topic map (external routing)
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
              gridTemplateColumns: { xs: "1fr", sm: "1.2fr 1fr" },
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
            <Chip
              label={`External → ${t.externalDepartmentName}`}
              size="small"
              sx={{ justifyContent: "flex-start" }}
            />
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
  const visitorTopicsQuery = useVisitorTopicsQuery(websiteId, true);
  const topics = visitorTopicsQuery.data?.topics ?? [];

  return (
    <Box>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 2, lineHeight: 1.6 }}>
        Choose channel, optionally department or inquire topic, then assign Primary / Secondary /
        Backup agents. Department is not required — chats route to assigned agents on that channel.
      </Typography>

      <TopicAgentRosterPanel
        websiteId={websiteId}
        operatingChannels={operatingChannels}
        allowedAssignmentChannels={allowedAssignmentChannels}
        departmentRoster={departmentRoster}
        topics={topics}
        canEdit={canAssign}
      />

      <TopicRosterSummary topics={topics} departmentRoster={departmentRoster} />
    </Box>
  );
}
