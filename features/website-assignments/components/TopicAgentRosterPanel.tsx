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
  resolveRosterDepartmentId,
  rosterAssignmentUiChannels,
} from "@/lib/website-assignments/roster-assignment-channels";
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
  allowedAssignmentChannels: ServiceChannel[];
  departmentRoster: WebsiteDepartmentRosterRow[];
  topics: ServiceSchedulingTopic[];
  canEdit: boolean;
  onSaved?: () => void;
  initialChannel?: ServiceChannel;
  initialTopicKey?: string;
};

const CHANNEL_LABELS: Record<ServiceChannel, string> = {
  Internal: "Internal",
  External: "External",
};

export function TopicAgentRosterPanel({
  websiteId,
  operatingChannels,
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

  const channelOptions = useMemo(() => {
    return rosterAssignmentUiChannels(operatingChannels).map((value) => ({
      value,
      label: CHANNEL_LABELS[value],
    }));
  }, [operatingChannels]);

  const [channel, setChannel] = useState<ServiceChannel>(initialChannel ?? "Internal");
  const [topicKey, setTopicKey] = useState("");
  const [directDepartmentId, setDirectDepartmentId] = useState("");

  const isInternalChannel = channel === "Internal";
  const showExternalTopicPicker = !isInternalChannel && topicContexts.length > 0;
  const useTopicRouting = showExternalTopicPicker && Boolean(topicKey.trim());

  const typedDepartmentOptions = useMemo(() => {
    const wantType = channel === "External" ? "External" : "Internal";
    return departmentRoster
      .filter((d) => d.departmentType === wantType)
      .map((d) => ({ value: d.departmentId, label: d.departmentName }));
  }, [departmentRoster, channel]);

  const departmentSelectOptions = useMemo(
    () => [
      { value: "", label: "Optional — website default routing" },
      ...typedDepartmentOptions,
    ],
    [typedDepartmentOptions],
  );

  useEffect(() => {
    if (channelOptions.length === 0) return;
    const allowed = channelOptions.map((o) => o.value);
    const preferred =
      initialChannel && allowed.includes(initialChannel) ? initialChannel : channel;
    if (!allowed.includes(preferred)) setChannel(allowed[0]!);
    else if (preferred !== channel) setChannel(preferred);
  }, [channelOptions, channel, initialChannel]);

  useEffect(() => {
    if (isInternalChannel) setTopicKey("");
  }, [isInternalChannel]);

  useEffect(() => {
    if (!showExternalTopicPicker) {
      setTopicKey("");
      return;
    }
    if (
      initialTopicKey?.trim() &&
      topicContexts.some((t) => t.routingKey === initialTopicKey.trim())
    ) {
      setTopicKey(initialTopicKey.trim());
    }
  }, [showExternalTopicPicker, initialTopicKey, topicContexts]);

  const selectedTopic = useMemo(
    () => (useTopicRouting ? topicContexts.find((t) => t.routingKey === topicKey) : undefined),
    [useTopicRouting, topicContexts, topicKey],
  );

  const effectiveDepartmentId = useMemo(() => {
    if (useTopicRouting && selectedTopic) {
      return departmentIdForTopicChannel(selectedTopic, "External");
    }
    return resolveRosterDepartmentId(channel, directDepartmentId, departmentRoster);
  }, [useTopicRouting, selectedTopic, channel, directDepartmentId, departmentRoster]);

  const activeDepartmentLabel = useMemo(() => {
    if (useTopicRouting && selectedTopic) {
      return departmentLabelForTopicChannel(selectedTopic, "External");
    }
    if (directDepartmentId.trim()) {
      return (
        departmentRoster.find((d) => d.departmentId === directDepartmentId)?.departmentName ?? ""
      );
    }
    const resolved = departmentRoster.find((d) => d.departmentId === effectiveDepartmentId);
    return resolved ? `${resolved.departmentName} (default)` : "Website default";
  }, [
    useTopicRouting,
    selectedTopic,
    directDepartmentId,
    departmentRoster,
    effectiveDepartmentId,
  ]);

  const activeTopicPoolId =
    useTopicRouting && selectedTopic ? poolIdForTopicChannel(selectedTopic, "External") : null;

  const topicOptions = useMemo(
    () => [
      { value: "", label: "No topic — assign by channel" },
      ...topicContexts.map((t) => ({
        value: t.routingKey,
        label: `${t.clientLabel} (${t.routingKey})`,
      })),
    ],
    [topicContexts],
  );

  const canShowRoster = Boolean(effectiveDepartmentId);

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
          Assignment follows your <strong>service scheduling mode</strong>:
          <br />
          <strong>Internal only</strong> — Internal channel; external users allowed as Backup only.
          <br />
          <strong>External only</strong> — External channel; external users only.
          <br />
          <strong>Both</strong> — Internal and External channels; Primary and Backup tiers only.
          <br />
          Department is optional. Inquire topics are optional (external visitor routing only).
        </Typography>
      </Box>

      <Box sx={assignmentStepRowSx}>
        <Chip label="1. Channel" size="small" sx={assignmentStepChipSx(Boolean(channel))} />
        <Chip
          label={
            isInternalChannel
              ? "2. Department (optional)"
              : showExternalTopicPicker
                ? "2. Topic (optional)"
                : "2. Department (optional)"
          }
          size="small"
          sx={assignmentStepChipSx(true)}
        />
        <Chip
          label="3. Team"
          size="small"
          sx={assignmentStepChipSx(canShowRoster)}
        />
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
        {showExternalTopicPicker ? (
          <SelectField
            label="Inquire topic (optional)"
            value={topicKey}
            onChange={setTopicKey}
            options={topicOptions}
            disabled={!canEdit}
            menuMaxRows={4}
            searchPlaceholder="Search topic…"
          />
        ) : (
          <SelectField
            label="Department (optional)"
            value={directDepartmentId}
            onChange={setDirectDepartmentId}
            options={
              typedDepartmentOptions.length
                ? departmentSelectOptions
                : [{ value: "", label: "No departments — using website default" }]
            }
            disabled={!canEdit || typedDepartmentOptions.length === 0}
            menuMaxRows={6}
            searchPlaceholder="Search department…"
          />
        )}
      </Box>

      {showExternalTopicPicker && !useTopicRouting ? (
        <Box sx={{ mb: 2 }}>
          <SelectField
            label="Department (optional)"
            value={directDepartmentId}
            onChange={setDirectDepartmentId}
            options={
              typedDepartmentOptions.length
                ? departmentSelectOptions
                : [{ value: "", label: "No external departments" }]
            }
            disabled={!canEdit || typedDepartmentOptions.length === 0}
            menuMaxRows={6}
            searchPlaceholder="Search department…"
          />
        </Box>
      ) : null}

      {useTopicRouting && selectedTopic ? (
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
            External routing for this topic
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            Topic <strong>{selectedTopic.routingKey}</strong> → department{" "}
            <strong>{activeDepartmentLabel}</strong>
          </Typography>
        </Box>
      ) : null}

      {!canShowRoster ? (
        <Typography variant="body2" sx={{ color: theme.palette.warning.light }}>
          No department exists under this parent company. Create at least one Internal or External
          department in HRMS, then assign agents here.
        </Typography>
      ) : (
        <CoverageBlocksPanel
          websiteId={websiteId}
          operatingChannels={operatingChannels}
          departmentId={effectiveDepartmentId}
          departmentName={activeDepartmentLabel}
          channel={channel}
          topicPoolId={activeTopicPoolId ?? undefined}
          canEdit={canEdit}
          onSaved={onSaved}
        />
      )}
    </Box>
  );
}
