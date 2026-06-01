"use client";

import { useEffect, useMemo, useState } from "react";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { SelectField, Typography } from "@/components/common";
import type {
  OperatingChannels,
  ServiceChannel,
  WebsiteDepartmentRosterRow,
} from "@/api/types/website-assignments.types";
import type { ServiceSchedulingTopic } from "@/services/chat/service-scheduling.types";
import {
  canShowExternalSlots,
  canShowInternalSlots,
  isChannelAllowed,
} from "@/lib/website-assignments/channel-helpers";
import { assignmentStepChipSx, assignmentStepRowSx } from "../styles/website-assignment-ui.styles";
import {
  buildVisitorTopicContexts,
  departmentIdForTopicChannel,
  departmentLabelForTopicChannel,
  poolIdForTopicChannel,
} from "../utils/roster-topic.utils";
import { CoverageBlocksPanel } from "./CoverageBlocksPanel";

type TopicAgentRosterPanelProps = {
  websiteId: string;
  operatingChannels: OperatingChannels;
  allowedChannels: ServiceChannel[];
  departmentRoster: WebsiteDepartmentRosterRow[];
  topics: ServiceSchedulingTopic[];
  canEdit: boolean;
  onSaved?: () => void;
  initialChannel?: ServiceChannel;
  initialTopicKey?: string;
};

const CHANNEL_OPTIONS: { value: ServiceChannel; label: string }[] = [
  { value: "Internal", label: "Internal" },
  { value: "External", label: "External" },
];

export function TopicAgentRosterPanel({
  websiteId,
  operatingChannels,
  allowedChannels,
  departmentRoster,
  topics,
  canEdit,
  onSaved,
  initialChannel,
  initialTopicKey,
}: TopicAgentRosterPanelProps) {
  const theme = useTheme() as AppTheme;
  const topicContexts = useMemo(
    () => buildVisitorTopicContexts(topics, departmentRoster),
    [topics, departmentRoster],
  );

  const showInternal =
    canShowInternalSlots(operatingChannels) && isChannelAllowed("Internal", allowedChannels);
  const showExternal =
    canShowExternalSlots(operatingChannels) && isChannelAllowed("External", allowedChannels);

  const channelOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    if (showInternal) opts.push(CHANNEL_OPTIONS[0]);
    if (showExternal) opts.push(CHANNEL_OPTIONS[1]);
    return opts;
  }, [showInternal, showExternal]);

  const [channel, setChannel] = useState<ServiceChannel>(initialChannel ?? "Internal");
  const [topicKey, setTopicKey] = useState(initialTopicKey ?? "");

  useEffect(() => {
    if (channelOptions.length === 0) return;
    const allowed = channelOptions.map((o) => o.value as ServiceChannel);
    const preferred =
      initialChannel && allowed.includes(initialChannel) ? initialChannel : channel;
    if (!allowed.includes(preferred)) setChannel(allowed[0]!);
    else if (preferred !== channel) setChannel(preferred);
  }, [channelOptions, channel, initialChannel]);

  useEffect(() => {
    if (topicContexts.length === 0) {
      setTopicKey("");
      return;
    }
    const preferred =
      initialTopicKey && topicContexts.some((t) => t.routingKey === initialTopicKey)
        ? initialTopicKey
        : topicKey;
    if (!topicContexts.some((t) => t.routingKey === preferred)) {
      setTopicKey(topicContexts[0]!.routingKey);
    } else if (preferred !== topicKey) {
      setTopicKey(preferred);
    }
  }, [topicContexts, topicKey, initialTopicKey]);

  const selectedTopic = useMemo(
    () => topicContexts.find((t) => t.routingKey === topicKey),
    [topicContexts, topicKey],
  );

  const activeDepartmentId = selectedTopic
    ? departmentIdForTopicChannel(selectedTopic, channel)
    : "";

  const activeDepartmentLabel = selectedTopic
    ? departmentLabelForTopicChannel(selectedTopic, channel)
    : "";

  const activeTopicPoolId = selectedTopic
    ? poolIdForTopicChannel(selectedTopic, channel)
    : null;

  const topicOptions = useMemo(
    () => [
      { value: "", label: topicContexts.length ? "Select visitor topic…" : "No topics configured" },
      ...topicContexts.map((t) => ({
        value: t.routingKey,
        label: `${t.clientLabel} (${t.routingKey})`,
      })),
    ],
    [topicContexts],
  );

  if (topicContexts.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
        Add at least one active visitor topic in service scheduling (with internal and external
        departments) before assigning agents.
      </Typography>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          p: 1.5,
          mb: 2,
          borderRadius: 2,
          display: "flex",
          gap: 1.25,
          alignItems: "flex-start",
          bgcolor: `${theme.palette.info.main}12`,
          border: `1px solid ${theme.palette.info.main}40`,
        }}
      >
        <InfoOutlined sx={{ color: theme.palette.info.light, fontSize: 22, mt: 0.25 }} />
        <Typography variant="body2" sx={{ lineHeight: 1.6, color: theme.app.dashboard.textMuted }}>
          <strong>Step 3 — Assign agents:</strong> Choose <strong>same team all day</strong> or{" "}
          <strong>duty periods</strong> (morning / afternoon teams). Routing uses Primary → Secondary →
          Backup for the active period. With HRMS, internal agents only get chats when chat hours, duty
          period, and HRMS shift overlap.
        </Typography>
      </Box>

      <Box sx={assignmentStepRowSx}>
        <Chip label="1. Channel" size="small" sx={assignmentStepChipSx(Boolean(channel))} />
        <Chip label="2. Visitor topic" size="small" sx={assignmentStepChipSx(Boolean(topicKey))} />
        <Chip label="3. Coverage & team" size="small" sx={assignmentStepChipSx(Boolean(activeDepartmentId))} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 1.5,
          mb: 2,
        }}
      >
        <SelectField
          label="Assignment channel"
          value={channel}
          onChange={(v) => setChannel(v as ServiceChannel)}
          options={channelOptions}
          disabled={!canEdit || channelOptions.length <= 1}
          menuMaxRows={4}
        />
        <SelectField
          label="Visitor topic (inquire)"
          value={topicKey}
          onChange={setTopicKey}
          options={topicOptions}
          disabled={!canEdit}
          menuMaxRows={4}
          searchPlaceholder="Search topic…"
        />
      </Box>

      {selectedTopic ? (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            bgcolor: "rgba(99, 102, 241, 0.08)",
          }}
        >
          <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>
            Routing for this selection
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 0.75 }}>
            <Chip
              label={channel}
              size="small"
              color={channel === "External" ? "warning" : "info"}
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label={`Topic: ${selectedTopic.clientLabel}`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`Dept: ${activeDepartmentLabel}`}
              size="small"
              variant="outlined"
            />
            {activeTopicPoolId ? (
              <Chip label="Pool-restricted roster" size="small" variant="outlined" />
            ) : null}
          </Box>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
            Visitor topic <strong>{selectedTopic.routingKey}</strong> routes{" "}
            <strong>{channel.toLowerCase()}</strong> chats to department{" "}
            <strong>{activeDepartmentLabel}</strong>
            {activeTopicPoolId ? " (linked pool members only)" : ""}.
          </Typography>
        </Box>
      ) : null}

      {selectedTopic && activeDepartmentId ? (
        <CoverageBlocksPanel
          websiteId={websiteId}
          departmentId={activeDepartmentId}
          departmentName={activeDepartmentLabel}
          channel={channel}
          topicPoolId={activeTopicPoolId ?? undefined}
          canEdit={canEdit}
          onSaved={onSaved}
        />
      ) : null}
    </Box>
  );
}
