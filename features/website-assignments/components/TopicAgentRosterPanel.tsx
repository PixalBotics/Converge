"use client";

import { useEffect, useMemo, useState } from "react";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, SelectField, Typography } from "@/components/common";
import type { ShiftCoverage } from "@/api/types/shift-coverage.types";
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
import { usePutDepartmentRosterMutation } from "@/lib/hooks";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { extractShiftCoverageFromAssignResponse } from "@/lib/website-assignments/shift-coverage";
import { ShiftCoverageBanner } from "@/components/common/ShiftCoverageBanner/ShiftCoverageBanner";
import { assignmentStepChipSx, assignmentStepRowSx } from "../styles/website-assignment-ui.styles";
import { buildDepartmentPutBody, clearChannelDraft, slotsFromRoster } from "../utils/roster-draft.utils";
import {
  buildVisitorTopicContexts,
  departmentIdForTopicChannel,
  departmentLabelForTopicChannel,
  findRosterRow,
} from "../utils/roster-topic.utils";
import { emptySlotDraft, type SlotDraft } from "./RosterSlotPicker";
import { RosterUsersPickerTable } from "./RosterUsersPickerTable";

type TopicAgentRosterPanelProps = {
  websiteId: string;
  operatingChannels: OperatingChannels;
  allowedChannels: ServiceChannel[];
  departmentRoster: WebsiteDepartmentRosterRow[];
  topics: ServiceSchedulingTopic[];
  canEdit: boolean;
  onCoverage?: (coverage: ShiftCoverage | null) => void;
  onSaved?: () => void;
  /** Edit flow: pre-select channel + topic when opening from table. */
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
  onCoverage,
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
  const [draft, setDraft] = useState<SlotDraft>(emptySlotDraft);
  const [baseline, setBaseline] = useState<SlotDraft>(emptySlotDraft);
  const [shiftCoverage, setShiftCoverage] = useState<ShiftCoverage | null>(null);

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

  const rosterRow = useMemo(
    () => findRosterRow(departmentRoster, activeDepartmentId),
    [departmentRoster, activeDepartmentId],
  );

  useEffect(() => {
    if (!rosterRow) {
      setDraft(emptySlotDraft());
      setBaseline(emptySlotDraft());
      return;
    }
    const slots =
      channel === "Internal" ? rosterRow.roster.internal : rosterRow.roster.external;
    const next = slotsFromRoster(slots);
    setDraft(next);
    setBaseline(next);
    setShiftCoverage(null);
  }, [rosterRow, channel, activeDepartmentId]);

  const putRosterMutation = usePutDepartmentRosterMutation(websiteId);

  const channelOnlyChanges =
    draft.Primary !== baseline.Primary ||
    draft.Secondary !== baseline.Secondary ||
    draft.Backup !== baseline.Backup;

  const handleSave = async () => {
    if (!canEdit || !selectedTopic || !activeDepartmentId || !channelOnlyChanges) return;
    try {
      const res = await putRosterMutation.mutateAsync({
        departmentId: activeDepartmentId,
        body: buildDepartmentPutBody({
          showInternal: channel === "Internal",
          showExternal: channel === "External",
          internalDraft: channel === "Internal" ? draft : emptySlotDraft(),
          externalDraft: channel === "External" ? draft : emptySlotDraft(),
        }),
      });
      const cov = extractShiftCoverageFromAssignResponse(res);
      if (cov) {
        setShiftCoverage(cov);
        onCoverage?.(cov);
      }
      setBaseline(draft);
      publishAppToast({ message: "Team assignments saved", variant: "success" });
      onSaved?.();
    } catch (e) {
      publishAppToast({
        message: extractApiErrorMessageForToast(e, "Could not save team assignments"),
        variant: "error",
      });
    }
  };

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
          <strong>How chat routing works:</strong> When a visitor picks a topic (e.g.{" "}
          <em>sale inquire</em>), the widget sends that topic&apos;s <strong>routing key</strong> plus
          channel <strong>Internal</strong> or <strong>External</strong>. The system looks up the
          department you mapped in service scheduling for that topic and channel, then offers the
          chat to agents assigned here for that exact department ID — Primary, then Secondary, then
          Backup.
        </Typography>
      </Box>

      <Box sx={assignmentStepRowSx}>
        <Chip
          label="1. Channel"
          size="small"
          sx={assignmentStepChipSx(Boolean(channel))}
        />
        <Chip
          label="2. Visitor topic"
          size="small"
          sx={assignmentStepChipSx(Boolean(topicKey))}
        />
        <Chip
          label="3. Team members"
          size="small"
          sx={assignmentStepChipSx(channelOnlyChanges)}
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
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
            Topic <strong>{selectedTopic.clientLabel}</strong> ({selectedTopic.routingKey}) ·{" "}
            <strong>{channel}</strong> chats use department{" "}
            <strong>{activeDepartmentLabel}</strong>
            {channel === "Internal" ? (
              <>
                {" "}
                (not {selectedTopic.externalDepartmentName} — that is for External only).
              </>
            ) : (
              <>
                {" "}
                (not {selectedTopic.internalDepartmentName} — that is for Internal only).
              </>
            )}
          </Typography>
        </Box>
      ) : null}

      <ShiftCoverageBanner coverage={shiftCoverage} onDismiss={() => setShiftCoverage(null)} />

      {selectedTopic && activeDepartmentId ? (
        <>
          <RosterUsersPickerTable
            channel={channel}
            departmentId={activeDepartmentId}
            departmentName={activeDepartmentLabel}
            draft={draft}
            canEdit={canEdit}
            onChange={setDraft}
          />
          {canEdit ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
              <Button
                type="button"
                variant="primary"
                disabled={!channelOnlyChanges || putRosterMutation.isPending}
                onClick={() => void handleSave()}
              >
                {putRosterMutation.isPending ? "Saving…" : "Save team assignments"}
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="small"
                disabled={putRosterMutation.isPending}
                onClick={() => setDraft(clearChannelDraft(channel))}
              >
                Clear {channel.toLowerCase()} slots
              </Button>
            </Box>
          ) : null}
        </>
      ) : null}
    </Box>
  );
}
