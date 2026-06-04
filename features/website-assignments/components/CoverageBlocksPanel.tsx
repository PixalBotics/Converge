"use client";

import { useEffect, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import ScheduleIcon from "@mui/icons-material/Schedule";
import GroupsIcon from "@mui/icons-material/Groups";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import type { ServiceChannel } from "@/api/types/website-assignments.types";
import {
  useDepartmentRosterCoverageQuery,
  usePutDepartmentRosterCoverageMutation,
  usePutDepartmentRosterMutation,
} from "@/lib/hooks";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { buildDepartmentPutBody } from "../utils/roster-draft.utils";
import {
  blockedUsersFromOtherBlocks,
  formatBlockPeriodLabel,
  normalizeCoverageBlockDraft,
} from "../utils/coverage-block-overlap.utils";
import {
  blocksDraftChanged,
  blocksFromCoverage,
  blocksToPutPayload,
  formatCoverageBlockHoursLabel,
  legacyDraftFromCoverage,
  newEmptyBlock,
  splitServiceHoursIntoBlocks,
  type CoverageBlockDraft,
} from "../utils/coverage-block-draft.utils";
import { emptySlotDraft, type SlotDraft } from "./RosterSlotPicker";
import { RosterUsersPickerTable } from "./RosterUsersPickerTable";
import { CoverageBlocksTimeline } from "./CoverageBlocksTimeline";
import { CoverageBlockTimePicker } from "./CoverageBlockTimePicker";
import {
  coerceTimeHm24,
  formatHm12Label,
  timesLikelyCrossMidnight,
} from "../utils/schedule-time.utils";

type CoverageBlocksPanelProps = {
  websiteId: string;
  departmentId: string;
  departmentName?: string;
  channel: ServiceChannel;
  topicPoolId?: string;
  canEdit: boolean;
  onSaved?: () => void;
};

const STEP_CHIP_SX = {
  fontWeight: 700,
  height: 24,
};

export function CoverageBlocksPanel({
  websiteId,
  departmentId,
  departmentName,
  channel,
  topicPoolId,
  canEdit,
  onSaved,
}: CoverageBlocksPanelProps) {
  const theme = useTheme() as AppTheme;
  const coverageQuery = useDepartmentRosterCoverageQuery(
    websiteId,
    departmentId,
    channel,
    { enabled: Boolean(departmentId) },
  );

  const [useBlocks, setUseBlocks] = useState(false);
  const [legacyDraft, setLegacyDraft] = useState<SlotDraft>(emptySlotDraft());
  const [legacyBaseline, setLegacyBaseline] = useState<SlotDraft>(emptySlotDraft());
  const [blocks, setBlocks] = useState<CoverageBlockDraft[]>([]);
  const [blocksBaseline, setBlocksBaseline] = useState<CoverageBlockDraft[]>([]);

  useEffect(() => {
    if (!coverageQuery.data) return;
    const data = coverageQuery.data;
    setUseBlocks(data.mode === "blocks");
    const legacy = legacyDraftFromCoverage(data);
    setLegacyDraft(legacy);
    setLegacyBaseline(legacy);
    const loadedBlocks = blocksFromCoverage(data).map(normalizeCoverageBlockDraft);
    setBlocks(loadedBlocks);
    setBlocksBaseline(loadedBlocks);
  }, [coverageQuery.data]);

  const putLegacyMutation = usePutDepartmentRosterMutation(websiteId);
  const putBlocksMutation = usePutDepartmentRosterCoverageMutation(
    websiteId,
    departmentId,
    channel,
  );

  const chatServiceHours = coverageQuery.data?.chatServiceHours ?? null;
  const chatHoursLabel = chatServiceHours
    ? `${formatHm12Label(chatServiceHours.startTime)} – ${formatHm12Label(chatServiceHours.endTime)} (${chatServiceHours.timezone}) · ${chatServiceHours.daysOfWeekLabels.join(", ")}`
    : null;

  const patchBlock = (index: number, patch: Partial<CoverageBlockDraft>) => {
    setBlocks((prev) =>
      prev.map((b, i) => {
        if (i !== index) return b;
        const next = { ...b, ...patch };
        const startTime = coerceTimeHm24(next.startTime);
        const endTime = coerceTimeHm24(next.endTime, "17:00");
        return {
          ...next,
          startTime,
          endTime,
          crossesMidnight: timesLikelyCrossMidnight(startTime, endTime),
        };
      }),
    );
  };

  const legacyChanged =
    legacyDraft.Primary !== legacyBaseline.Primary ||
    legacyDraft.Secondary !== legacyBaseline.Secondary ||
    legacyDraft.Backup !== legacyBaseline.Backup;

  const blocksChanged = useMemo(
    () => blocksDraftChanged(blocks, blocksBaseline),
    [blocks, blocksBaseline],
  );

  const blockedByBlockIndex = useMemo(
    () => blocks.map((_, index) => blockedUsersFromOtherBlocks(blocks, index)),
    [blocks],
  );

  const handleEnableBlocks = () => {
    if (!chatServiceHours) {
      publishAppToast({
        message: "Set chat service hours in service scheduling before configuring duty periods.",
        variant: "error",
      });
      return;
    }
    const split = splitServiceHoursIntoBlocks(chatServiceHours, legacyDraft).map(
      normalizeCoverageBlockDraft,
    );
    setBlocks(split);
    setUseBlocks(true);
  };

  const handleAddBlock = () => {
    setBlocks((prev) => [...prev, newEmptyBlock(chatServiceHours, prev.length)]);
    setUseBlocks(true);
  };

  const handleRemoveBlock = (index: number) => {
    setBlocks((prev) =>
      prev.filter((_, i) => i !== index).map((b, i) => ({ ...b, sortOrder: i, label: b.label || `Period ${i + 1}` })),
    );
  };

  const handleSaveLegacy = async () => {
    if (!canEdit || !legacyChanged) return;
    try {
      await putLegacyMutation.mutateAsync({
        departmentId,
        body: buildDepartmentPutBody({
          showInternal: channel === "Internal",
          showExternal: channel === "External",
          internalDraft: channel === "Internal" ? legacyDraft : emptySlotDraft(),
          externalDraft: channel === "External" ? legacyDraft : emptySlotDraft(),
        }),
      });
      setLegacyBaseline(legacyDraft);
      publishAppToast({ message: "Team saved — same agents for full chat hours", variant: "success" });
      onSaved?.();
    } catch (e) {
      publishAppToast({
        message: extractApiErrorMessageForToast(e, "Could not save team assignments"),
        variant: "error",
      });
    }
  };

  const handleSaveBlocks = async () => {
    if (!canEdit || !blocks.length) return;
    try {
      await putBlocksMutation.mutateAsync(blocksToPutPayload(blocks));
      setBlocksBaseline(blocks);
      setUseBlocks(true);
      publishAppToast({ message: "Duty periods saved", variant: "success" });
      onSaved?.();
    } catch (e) {
      publishAppToast({
        message: extractApiErrorMessageForToast(e, "Could not save coverage blocks"),
        variant: "error",
      });
    }
  };

  const handleRevertToLegacy = async () => {
    if (!canEdit) return;
    try {
      await putBlocksMutation.mutateAsync({ useBlocks: false });
      setUseBlocks(false);
      setBlocks([]);
      setBlocksBaseline([]);
      publishAppToast({ message: "Switched to one team for full chat hours", variant: "success" });
      void coverageQuery.refetch();
      onSaved?.();
    } catch (e) {
      publishAppToast({
        message: extractApiErrorMessageForToast(e, "Could not revert to legacy roster"),
        variant: "error",
      });
    }
  };

  if (coverageQuery.isLoading) {
    return (
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
        Loading roster setup…
      </Typography>
    );
  }

  return (
    <Box>
      {chatHoursLabel ? (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            border: `1px solid ${theme.palette.info.main}40`,
            bgcolor: `${theme.palette.info.main}10`,
            display: "flex",
            gap: 1.25,
            alignItems: "flex-start",
          }}
        >
          <ScheduleIcon sx={{ color: theme.palette.info.light, fontSize: 22, mt: 0.25 }} />
          <Box>
            <Typography variant="body2" fontWeight={700} sx={{ mb: 0.35 }}>
              Chat service hours ({channel})
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
              {chatHoursLabel}
            </Typography>
            <Typography variant="caption" sx={{ display: "block", color: theme.app.dashboard.textMuted, mt: 0.75, lineHeight: 1.45 }}>
              Visitors can start chat only in this window. Your roster controls <strong>who</strong> receives
              chats during that time.
            </Typography>
          </Box>
        </Box>
      ) : null}

      {!useBlocks ? (
        <>
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
              bgcolor: "rgba(255,255,255,0.02)",
            }}
          >
            <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
              How do you want to assign agents?
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 1.5,
                alignItems: "stretch",
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: `2px solid ${theme.palette.primary.main}`,
                  bgcolor: `${theme.palette.primary.main}0c`,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 0.75 }}>
                  <GroupsIcon sx={{ fontSize: 20, color: theme.palette.primary.light }} />
                  <Typography variant="body2" fontWeight={700}>
                    Option A — Same team all day
                  </Typography>
                  <Chip label="Recommended for small teams" size="small" sx={STEP_CHIP_SX} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.55, display: "block", flex: 1 }}
                >
                  Use one Primary, Secondary, and Backup team for the full chat service window. Select
                  agents below and click <strong>Save team (full day)</strong>.
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${theme.app.dashboard.cardBorder}`,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 0.75 }}>
                  <ScheduleIcon sx={{ fontSize: 20, color: theme.palette.info.light }} />
                  <Typography variant="body2" fontWeight={700}>
                    Option B — Different teams by time
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.app.dashboard.textMuted,
                    lineHeight: 1.55,
                    display: "block",
                    mb: 1.25,
                    flex: 1,
                  }}
                >
                  Split the day into duty periods — for example, a morning team (9 AM–1 PM) and an
                  afternoon team (1 PM–6 PM). Each period can have a different roster.
                </Typography>
                {canEdit ? (
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    sx={{ alignSelf: "flex-start" }}
                    onClick={() => void handleEnableBlocks()}
                  >
                    Set up duty periods →
                  </Button>
                ) : null}
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
            <Chip label="Step 1" size="small" color="primary" sx={STEP_CHIP_SX} />
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, alignSelf: "center" }}>
              Pick Primary → Secondary → Backup (one user per column)
            </Typography>
          </Box>

          <RosterUsersPickerTable
            websiteId={websiteId}
            channel={channel}
            departmentId={departmentId}
            departmentName={departmentName}
            topicPoolId={topicPoolId}
            draft={legacyDraft}
            canEdit={canEdit}
            onChange={setLegacyDraft}
            hoursBannerMode="hidden"
          />

          {canEdit ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
              <Button
                type="button"
                variant="primary"
                disabled={!legacyChanged || putLegacyMutation.isPending}
                onClick={() => void handleSaveLegacy()}
              >
                {putLegacyMutation.isPending ? "Saving…" : "Save team (full day)"}
              </Button>
            </Box>
          ) : null}
        </>
      ) : (
        <>
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${theme.palette.info.main}10`,
              border: `1px solid ${theme.palette.info.main}33`,
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
            }}
          >
            <InfoOutlined sx={{ color: theme.palette.info.light, fontSize: 20, mt: 0.2 }} />
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.55 }}>
              <strong>3 steps:</strong> (1) Set start and end times for each period within chat service
              hours. (2) Choose a separate Primary, Secondary, and Backup team for each period. (3) Click{" "}
              <strong>Save all periods</strong> below. Agents assigned to an earlier period are hidden
              from later periods while times overlap; they become available again after their period ends.
            </Typography>
          </Box>

          {chatServiceHours ? (
            <CoverageBlocksTimeline
              serviceStart={chatServiceHours.startTime}
              serviceEnd={chatServiceHours.endTime}
              blocks={blocks}
            />
          ) : null}

          {blocks.map((block, index) => (
            <Box
              key={block.id ?? `draft-${index}`}
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                border: `1px solid ${theme.app.dashboard.cardBorder}`,
                bgcolor: index % 2 === 0 ? "rgba(99,102,241,0.04)" : "rgba(255,255,255,0.02)",
              }}
            >
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", mb: 1.5 }}>
                <Chip
                  label={`Period ${index + 1} of ${blocks.length}`}
                  size="small"
                  color="primary"
                  sx={STEP_CHIP_SX}
                />
                <Typography variant="body2" fontWeight={700} sx={{ mr: 0.5 }}>
                  {formatBlockPeriodLabel(block, index)}
                </Typography>
                <Chip
                  label={`${formatHm12Label(block.startTime)} – ${formatHm12Label(block.endTime)}`}
                  size="small"
                  variant="outlined"
                  sx={{ maxWidth: "100%" }}
                />
                {canEdit && blocks.length > 1 ? (
                  <IconButton
                    size="small"
                    aria-label="Remove period"
                    onClick={() => handleRemoveBlock(index)}
                    sx={{ ml: { xs: 0, sm: "auto" } }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                ) : null}
              </Box>

              {canEdit ? (
                <Box sx={{ mb: 1.5 }}>
                  <InputField
                    label="Period name (e.g. Morning shift)"
                    dense
                    value={block.label}
                    onChange={(e) =>
                      patchBlock(index, { label: (e.target as HTMLInputElement).value })
                    }
                  />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 1.5,
                      alignItems: "stretch",
                    }}
                  >
                    <CoverageBlockTimePicker
                      label="Duty starts"
                      value={block.startTime}
                      disabled={!canEdit}
                      onChange={(hm24) => patchBlock(index, { startTime: hm24 })}
                    />
                    <CoverageBlockTimePicker
                      label="Duty ends"
                      value={block.endTime}
                      disabled={!canEdit}
                      onChange={(hm24) => patchBlock(index, { endTime: hm24 })}
                    />
                  </Box>
                </Box>
              ) : (
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
                  {formatCoverageBlockHoursLabel(block)}
                </Typography>
              )}

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                <Chip label="Step 2" size="small" sx={STEP_CHIP_SX} />
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, alignSelf: "center" }}>
                  Team for this period only — Primary, Secondary, Backup
                </Typography>
              </Box>

              <RosterUsersPickerTable
                websiteId={websiteId}
                channel={channel}
                departmentId={departmentId}
                departmentName={departmentName}
                topicPoolId={topicPoolId}
                draft={block.roster}
                canEdit={canEdit}
                onChange={(next) =>
                  setBlocks((prev) =>
                    prev.map((b, i) => (i === index ? { ...b, roster: next } : b)),
                  )
                }
                hoursBannerMode="coverage-block"
                coverageBlockHours={{
                  startTime: block.startTime,
                  endTime: block.endTime,
                  timezone: block.timezone,
                  daysOfWeekLabels: block.daysOfWeek.map(String),
                }}
                blockedInOtherBlocks={blockedByBlockIndex[index]}
              />
            </Box>
          ))}

          {canEdit ? (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                mt: 1,
                alignItems: "center",
                pt: 1.5,
                borderTop: `1px solid ${theme.app.dashboard.cardBorder}`,
              }}
            >
              <Chip label="Step 3" size="small" color="primary" sx={STEP_CHIP_SX} />
              <Button
                type="button"
                variant="primary"
                disabled={!blocksChanged || putBlocksMutation.isPending || !blocks.length}
                onClick={() => void handleSaveBlocks()}
              >
                {putBlocksMutation.isPending ? "Saving…" : "Save all periods"}
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddBlock}
              >
                Add another period
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="small"
                disabled={putBlocksMutation.isPending}
                onClick={() => void handleRevertToLegacy()}
              >
                ← Back to one team all day
              </Button>
            </Box>
          ) : null}
        </>
      )}
    </Box>
  );
}
