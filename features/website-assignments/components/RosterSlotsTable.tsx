"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { SelectField, Typography } from "@/components/common";
import type { ServiceChannel, WebsiteAssignmentTier } from "@/api/types/website-assignments.types";
import { useDepartmentRosterHrmsContextQuery, useUsersListQuery } from "@/lib/hooks";
import { useQaRosterExclusionsQuery } from "@/features/chat-settings/hooks/useChatSettings";
import {
  buildRosterUserOptions,
  formatRosterSelectLabel,
  type RosterUserOption,
} from "../utils/roster-user-options";
import { ROSTER_TIERS } from "../utils/roster-draft.utils";
import type { SlotDraft } from "./RosterSlotPicker";
import {
  formatSelectedUserShiftLine,
  formatWebsiteServiceHoursLabel,
  rosterHrmsStatusLabel,
} from "../utils/roster-hrms-display.utils";
import type { RosterUserHrmsContext } from "@/api/types/roster-hrms-context.types";
import { formatHm12Label } from "../utils/schedule-time.utils";

const TIER_LABELS: Record<WebsiteAssignmentTier, string> = {
  Primary: "First agent for new chats",
  Secondary: "Used when Primary is busy",
  Backup: "Last resort after Primary and Secondary",
};

export type RosterSlotsTableProps = {
  websiteId: string;
  channel: ServiceChannel;
  departmentId: string;
  departmentName?: string;
  topicPoolId?: string;
  draft: SlotDraft;
  disabled?: boolean;
  canEdit: boolean;
  onChange: (draft: SlotDraft) => void;
  coverageBlockHours?: {
    startTime: string;
    endTime: string;
    timezone: string;
    daysOfWeekLabels: string[];
  };
  hoursBannerMode?: "chat-service" | "coverage-block" | "hidden";
  blockedInOtherBlocks?: Map<string, string>;
};

export function RosterSlotsTable({
  websiteId,
  channel,
  departmentId,
  departmentName,
  topicPoolId,
  draft,
  disabled = false,
  canEdit,
  onChange,
  coverageBlockHours,
  hoursBannerMode = "hidden",
  blockedInOtherBlocks,
}: RosterSlotsTableProps) {
  const theme = useTheme() as AppTheme;
  const poolId = topicPoolId?.trim() ?? "";

  const usersQuery = useUsersListQuery(
    {
      all: true,
      userType: channel,
      departmentId,
      ...(poolId ? { poolId } : {}),
    },
    { enabled: !disabled && departmentId.trim().length > 0 },
  );

  const qaExclusionsQuery = useQaRosterExclusionsQuery(
    websiteId,
    Boolean(websiteId.trim()) && !disabled,
  );

  const userOptions = useMemo(() => {
    const base = buildRosterUserOptions(usersQuery.data, departmentId, channel);
    const qaIds = new Set(qaExclusionsQuery.data?.qaReviewerUserIds ?? []);
    return base.map((u) =>
      qaIds.has(u.id)
        ? {
            ...u,
            disabled: true,
            disabledReason: "QA reviewer — use QA inbox, not live chat slots",
          }
        : u,
    );
  }, [usersQuery.data, departmentId, channel, qaExclusionsQuery.data?.qaReviewerUserIds]);

  const eligibleCount = useMemo(
    () => userOptions.filter((u) => !u.disabled).length,
    [userOptions],
  );

  const hrmsUserIds = useMemo(() => {
    const ids = new Set<string>();
    for (const u of userOptions) ids.add(u.id);
    for (const tier of ROSTER_TIERS) {
      for (const id of draft[tier]) {
        const trimmed = id.trim();
        if (trimmed) ids.add(trimmed);
      }
    }
    return [...ids].join(",");
  }, [userOptions, draft]);

  const hrmsQuery = useDepartmentRosterHrmsContextQuery(
    websiteId,
    departmentId,
    channel,
    {
      enabled: !disabled && channel === "Internal" && departmentId.trim().length > 0,
      userIds: hrmsUserIds || undefined,
    },
  );

  const showHrmsShift = channel === "Internal" && hrmsQuery.data?.hrmsEnabled === true;

  const hrmsByUserId = useMemo(() => {
    const map = new Map<string, RosterUserHrmsContext>();
    if (hrmsQuery.data?.hrmsEnabled) {
      for (const row of hrmsQuery.data.users) {
        map.set(row.userId, row);
      }
    }
    return map;
  }, [hrmsQuery.data]);

  const selectOptionsForTier = (tier: WebsiteAssignmentTier) => {
    const base = [{ value: "", label: "Not assigned" }];
    const selectedIds = new Set(ROSTER_TIERS.flatMap((t) => draft[t]).filter(Boolean));

    const filtered = userOptions.filter((u) => {
      const blockedReason = blockedInOtherBlocks?.get(u.id);
      if (blockedReason && !selectedIds.has(u.id)) return false;
      if (u.disabled && !draft[tier].includes(u.id)) return false;
      if (takenByOther(tier, u.id)) return false;
      return true;
    });

    return [
      ...base,
      ...filtered.map((u) => ({
        value: u.id,
        label: u.disabled ? `${formatRosterSelectLabel(u)} (not eligible)` : formatRosterSelectLabel(u),
      })),
    ];
  };

  const takenByOther = (tier: WebsiteAssignmentTier, candidateId: string) => {
    if (!candidateId) return false;
    for (const t of ROSTER_TIERS) {
      if (t === tier) continue;
      if (draft[t].includes(candidateId)) return true;
    }
    return false;
  };

  const assignTier = (tier: WebsiteAssignmentTier, userId: string) => {
    if (!canEdit || disabled) return;
    const next: SlotDraft = {
      Primary: [...draft.Primary],
      Secondary: [...draft.Secondary],
      Backup: [...draft.Backup],
    };
    if (!userId) {
      next[tier] = [];
    } else {
      for (const t of ROSTER_TIERS) {
        if (t !== tier) next[t] = next[t].filter((id) => id !== userId);
      }
      next[tier] = [userId];
    }
    onChange(next);
  };

  const findOption = (userId: string): RosterUserOption | undefined =>
    userOptions.find((o) => o.id === userId);

  const websiteHoursLabel = formatWebsiteServiceHoursLabel(
    hrmsQuery.data?.websiteServiceHours ?? null,
  );

  const blockHoursLabel = coverageBlockHours
    ? `${formatHm12Label(coverageBlockHours.startTime)} – ${formatHm12Label(coverageBlockHours.endTime)} (${coverageBlockHours.timezone}) · ${coverageBlockHours.daysOfWeekLabels.join(", ")}`
    : null;

  const showHoursBanner =
    hoursBannerMode !== "hidden" &&
    (hoursBannerMode === "coverage-block" ? blockHoursLabel : websiteHoursLabel);

  const channelChipColor =
    channel === "External" ? theme.palette.warning.main : theme.palette.info.main;

  return (
    <Box sx={{ opacity: disabled ? 0.5 : 1 }}>
      <Box
        sx={{
          mb: 2,
          p: 1.5,
          borderRadius: 2,
          border: `1px solid ${channelChipColor}44`,
          bgcolor: `${channelChipColor}10`,
        }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1 }}>
          <Chip
            label={channel}
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: `${channelChipColor}22`,
              color: channel === "External" ? theme.palette.warning.light : theme.palette.info.light,
            }}
          />
          {departmentName ? (
            <Chip label={`Dept: ${departmentName}`} size="small" variant="outlined" />
          ) : null}
          {poolId ? (
            <Chip label="Pool-restricted list" size="small" variant="outlined" />
          ) : null}
          {!usersQuery.isLoading ? (
            <Chip
              label={`${eligibleCount} eligible user${eligibleCount === 1 ? "" : "s"}`}
              size="small"
              variant="outlined"
            />
          ) : null}
        </Box>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
          Choose one agent per rank using the dropdowns below. Only <strong>{channel.toLowerCase()}</strong>{" "}
          users
          {departmentName ? (
            <>
              {" "}
              for <strong>{departmentName}</strong>
            </>
          ) : null}
          {poolId ? " in the linked pool" : " in this department"} are listed.
          {channel === "Internal" && showHrmsShift
            ? " Internal agents receive chats only during overlapping chat hours and HRMS shifts."
            : channel === "External"
              ? " External agents do not use HRMS shift checks."
              : null}
        </Typography>
      </Box>

      {showHoursBanner ? (
        <Box
          sx={{
            mb: 1.5,
            p: 1.25,
            borderRadius: 1.5,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            bgcolor: `${theme.palette.info.main}10`,
          }}
        >
          <Typography variant="caption" sx={{ display: "block", fontWeight: 700, mb: 0.35 }}>
            {hoursBannerMode === "coverage-block"
              ? "Coverage block duty window"
              : `Chat service hours (${channel.toLowerCase()})`}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
            {hoursBannerMode === "coverage-block" ? blockHoursLabel : websiteHoursLabel}
          </Typography>
        </Box>
      ) : null}

      {usersQuery.isLoading ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1 }}>
          Loading {channel.toLowerCase()} users…
        </Typography>
      ) : null}

      {!usersQuery.isLoading && userOptions.length === 0 ? (
        <Typography variant="body2" sx={{ color: theme.palette.warning.light, mb: 1.5 }}>
          No {channel.toLowerCase()} users
          {poolId ? " in the linked pool" : " in this department"}. Add users under User management
          first{poolId ? ", or update the topic pool in service scheduling" : ""}.
        </Typography>
      ) : null}

      {!usersQuery.isLoading && userOptions.length > 0 && eligibleCount === 0 ? (
        <Typography variant="body2" sx={{ color: theme.palette.warning.light, mb: 1.5 }}>
          No eligible users — department heads cannot take roster slots. Assign pool members instead.
        </Typography>
      ) : null}

      {ROSTER_TIERS.some((t) => draft[t].length > 0) ? (
        <Box
          sx={{
            mb: 1.5,
            p: 1.25,
            borderRadius: 1.5,
            bgcolor: `${theme.palette.primary.main}10`,
            border: `1px solid ${theme.palette.primary.main}33`,
          }}
        >
          {ROSTER_TIERS.map((tier) => {
            const id = draft[tier][0];
            if (!id) return null;
            const opt = findOption(id);
            const hrms = hrmsByUserId.get(id);
            const shiftLine = formatSelectedUserShiftLine(hrms, showHrmsShift);
            return (
              <Box key={tier} sx={{ mb: 0.75 }}>
                <Typography variant="caption" sx={{ display: "block", lineHeight: 1.5 }}>
                  <strong>{tier}:</strong> {opt ? formatRosterSelectLabel(opt) : id.slice(0, 8)}
                </Typography>
                {showHrmsShift && hrms ? (
                  <Typography
                    variant="caption"
                    sx={{ display: "block", color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}
                  >
                    HRMS shift: {shiftLine ?? "—"}
                    {rosterHrmsStatusLabel(hrms) ? ` · ${rosterHrmsStatusLabel(hrms)}` : ""}
                  </Typography>
                ) : null}
              </Box>
            );
          })}
        </Box>
      ) : null}

      <Table
        size="small"
        sx={{
          "& .MuiTableCell-root": {
            borderColor: theme.app.dashboard.cardBorder,
            py: 1.25,
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, width: { xs: "36%", sm: "28%" } }}>Rank</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Team member</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ROSTER_TIERS.map((tier) => {
            const value = draft[tier][0] ?? "";
            return (
              <TableRow key={tier}>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {tier}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                    {TIER_LABELS[tier]}
                  </Typography>
                </TableCell>
                <TableCell>
                  <SelectField
                    label={`Select ${tier.toLowerCase()} agent`}
                    value={value}
                    onChange={(v) => assignTier(tier, v)}
                    options={selectOptionsForTier(tier)}
                    disabled={!canEdit || disabled || usersQuery.isLoading}
                    menuMaxRows={6}
                    searchPlaceholder="Search by name or email…"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
