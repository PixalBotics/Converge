"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Radio from "@mui/material/Radio";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import NextLink from "next/link";
import { InputField, Typography } from "@/components/common";
import type { ServiceChannel, WebsiteAssignmentTier } from "@/api/types/website-assignments.types";
import type { RosterUserHrmsContext } from "@/api/types/roster-hrms-context.types";
import { useDepartmentRosterHrmsContextQuery, useUsersListQuery } from "@/lib/hooks";
import { useQaRosterExclusionsQuery } from "@/features/chat-settings/hooks/useChatSettings";
import { buildRosterUserOptions } from "../utils/roster-user-options";
import {
  formatRosterShiftLabel,
  formatSelectedUserShiftLine,
  formatWebsiteServiceHoursLabel,
  hrmsSchedulingHref,
  rosterHrmsStatusLabel,
  rosterScheduleOverlapHint,
} from "../utils/roster-hrms-display.utils";
import { formatHm12Label } from "../utils/schedule-time.utils";
import { ROSTER_TIERS } from "../utils/roster-draft.utils";
import type { SlotDraft } from "./RosterSlotPicker";

type RosterUsersPickerTableProps = {
  websiteId: string;
  channel: ServiceChannel;
  departmentId: string;
  departmentName?: string;
  /** When topic links a pool, only those members are eligible for roster save. */
  topicPoolId?: string;
  draft: SlotDraft;
  disabled?: boolean;
  canEdit: boolean;
  onChange: (draft: SlotDraft) => void;
  /** When set, show block duty window instead of full chat service hours. */
  coverageBlockHours?: {
    startTime: string;
    endTime: string;
    timezone: string;
    daysOfWeekLabels: string[];
  };
  hoursBannerMode?: "chat-service" | "coverage-block" | "hidden";
  /** Hide users rostered on overlapping coverage blocks (still show if selected here). */
  blockedInOtherBlocks?: Map<string, string>;
};

export function RosterUsersPickerTable({
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
  hoursBannerMode = "chat-service",
  blockedInOtherBlocks,
}: RosterUsersPickerTableProps) {
  const theme = useTheme() as AppTheme;
  const [userSearch, setUserSearch] = useState("");

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
    const base = buildRosterUserOptions(usersQuery.data, departmentId);
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
  }, [usersQuery.data, departmentId, qaExclusionsQuery.data?.qaReviewerUserIds]);

  const hrmsUserIds = useMemo(() => {
    const ids = new Set<string>();
    for (const u of userOptions) ids.add(u.id);
    for (const tier of ROSTER_TIERS) {
      const id = draft[tier]?.trim();
      if (id) ids.add(id);
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

  const hrmsEnabled = hrmsQuery.data?.hrmsEnabled === true;
  const showHrmsShift = channel === "Internal" && hrmsEnabled;

  const hrmsByUserId = useMemo(() => {
    const map = new Map<string, RosterUserHrmsContext>();
    if (hrmsQuery.data?.hrmsEnabled) {
      for (const row of hrmsQuery.data.users) {
        map.set(row.userId, row);
      }
    }
    return map;
  }, [hrmsQuery.data]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    const selectedIds = new Set(
      ROSTER_TIERS.map((t) => draft[t]?.trim()).filter(Boolean) as string[],
    );
    return userOptions.filter((u) => {
      const blockedReason = blockedInOtherBlocks?.get(u.id);
      if (blockedReason && !selectedIds.has(u.id)) return false;
      if (!q) return true;
      return u.label.toLowerCase().includes(q);
    });
  }, [userOptions, userSearch, blockedInOtherBlocks, draft]);

  const hiddenByBlockCount = useMemo(() => {
    if (!blockedInOtherBlocks?.size) return 0;
    const selectedIds = new Set(
      ROSTER_TIERS.map((t) => draft[t]?.trim()).filter(Boolean) as string[],
    );
    let n = 0;
    for (const userId of blockedInOtherBlocks.keys()) {
      if (!selectedIds.has(userId)) n += 1;
    }
    return n;
  }, [blockedInOtherBlocks, draft]);

  const assignTier = (tier: WebsiteAssignmentTier, userId: string) => {
    if (!canEdit || disabled) return;
    const next = { ...draft };
    if (next[tier] === userId) {
      next[tier] = "";
    } else {
      for (const t of ROSTER_TIERS) {
        if (t !== tier && next[t] === userId) next[t] = "";
      }
      next[tier] = userId;
    }
    onChange(next);
  };

  const tierTakenByOther = (tier: WebsiteAssignmentTier, userId: string) => {
    for (const t of ROSTER_TIERS) {
      if (t === tier) continue;
      if (draft[t] === userId) return true;
    }
    return false;
  };

  const selectedSummary = ROSTER_TIERS.map((tier) => {
    const id = draft[tier];
    if (!id) return null;
    const u = userOptions.find((o) => o.id === id);
    const hrms = hrmsByUserId.get(id);
    const shiftLine = formatSelectedUserShiftLine(hrms, showHrmsShift);
    return {
      tier,
      userId: id,
      label: u?.label ?? "Assigned user",
      hrms,
      shiftLine,
      statusLabel: showHrmsShift && hrms ? rosterHrmsStatusLabel(hrms) : null,
      missingShift: showHrmsShift && Boolean(hrms && !hrms.shift),
    };
  }).filter(Boolean) as {
    tier: WebsiteAssignmentTier;
    userId: string;
    label: string;
    hrms: RosterUserHrmsContext | undefined;
    shiftLine: string | null;
    statusLabel: string | null;
    missingShift: boolean;
  }[];

  const showHrmsColumn = showHrmsShift;

  const websiteHoursLabel = formatWebsiteServiceHoursLabel(
    hrmsQuery.data?.websiteServiceHours ?? null,
  );

  const blockHoursLabel = coverageBlockHours
    ? `${formatHm12Label(coverageBlockHours.startTime)} – ${formatHm12Label(coverageBlockHours.endTime)} (${coverageBlockHours.timezone}) · ${coverageBlockHours.daysOfWeekLabels.join(", ")}`
    : null;

  const showHoursBanner =
    hoursBannerMode !== "hidden" &&
    (hoursBannerMode === "coverage-block" ? blockHoursLabel : websiteHoursLabel);

  return (
    <Box sx={{ opacity: disabled ? 0.5 : 1 }}>
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
          <Typography variant="caption" sx={{ display: "block", color: theme.app.dashboard.textMuted, mt: 0.75, lineHeight: 1.45 }}>
            {rosterScheduleOverlapHint(showHrmsShift, channel, hoursBannerMode === "coverage-block")}
          </Typography>
        </Box>
      ) : null}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5, alignItems: "center" }}>
        <Typography variant="body2" fontWeight={600}>
          {channel} team
          {departmentName ? ` · ${departmentName}` : ""}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          Pick one user per column (click again to clear).
          {showHrmsShift ?
            " Internal agents chat only during their HRMS shift (break/leave skipped)."
          : channel === "External" ?
            " External agents: no HRMS shift — assign from the linked pool."
          : null}
        </Typography>
        {poolId ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, width: "100%" }}>
            Only members of the topic-linked pool can be saved to this roster.
          </Typography>
        ) : null}
      </Box>

      {hiddenByBlockCount > 0 ? (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 1.5,
            color: theme.app.dashboard.textMuted,
            lineHeight: 1.45,
          }}
        >
          {hiddenByBlockCount} agent{hiddenByBlockCount === 1 ? "" : "s"} hidden — already assigned
          to an overlapping duty period. They appear again in later periods after their slot ends.
        </Typography>
      ) : null}

      {selectedSummary.length > 0 ? (
        <Box
          sx={{
            mb: 1.5,
            p: 1.25,
            borderRadius: 1.5,
            bgcolor: `${theme.palette.primary.main}10`,
            border: `1px solid ${theme.palette.primary.main}33`,
          }}
        >
          {selectedSummary.map(({ tier, userId, label, shiftLine, statusLabel, missingShift }) => (
            <Box key={tier} sx={{ mb: selectedSummary.length > 1 ? 0.75 : 0 }}>
              <Typography variant="caption" sx={{ display: "block", lineHeight: 1.5 }}>
                <strong>{tier}:</strong> {label}
              </Typography>
              {websiteHoursLabel ? (
                <Typography
                  variant="caption"
                  sx={{ display: "block", lineHeight: 1.45, color: theme.app.dashboard.textMuted }}
                >
                  Chat service hours: {websiteHoursLabel}
                </Typography>
              ) : null}
              {showHrmsShift ? (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    lineHeight: 1.45,
                    color: missingShift ? theme.palette.warning.light : theme.app.dashboard.textMuted,
                  }}
                >
                  HRMS shift: {shiftLine ?? "—"}
                  {statusLabel ? ` · ${statusLabel}` : ""}
                  {missingShift ? (
                    <>
                      {" · "}
                      <Box
                        component={NextLink}
                        href={hrmsSchedulingHref(userId)}
                        sx={{
                          display: "inline",
                          color: theme.palette.primary.light,
                          textDecoration: "underline",
                          fontSize: "inherit",
                        }}
                      >
                        Assign shift in HRMS
                      </Box>
                    </>
                  ) : null}
                </Typography>
              ) : null}
            </Box>
          ))}
        </Box>
      ) : null}

      <InputField
        label="Search users"
        value={userSearch}
        onChange={(e) => setUserSearch((e.target as HTMLInputElement).value)}
        placeholder="Name, email, pool…"
        disabled={!canEdit || disabled}
        sx={{ mb: 1.5, maxWidth: 360 }}
      />

      {usersQuery.isLoading ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
          Loading {channel.toLowerCase()} users…
        </Typography>
      ) : null}

      {!usersQuery.isLoading && userOptions.length === 0 ? (
        <Typography variant="body2" sx={{ color: theme.palette.warning.light, py: 1 }}>
          No {channel.toLowerCase()} users
          {poolId ? " in the linked pool" : " in this department"}. Add users under User management
          first{poolId ? ", or update the topic pool in service scheduling" : ""}.
        </Typography>
      ) : null}

      {!usersQuery.isLoading && userOptions.length > 0 ? (
        <TableContainer
          sx={{
            maxHeight: 360,
            borderRadius: 2,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            bgcolor: "rgba(255,255,255,0.02)",
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, minWidth: 140 }}>User</TableCell>
                {showHrmsColumn ? (
                  <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>HRMS shift</TableCell>
                ) : null}
                <TableCell sx={{ fontWeight: 700, width: 72 }} align="center">
                  Primary
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: 72 }} align="center">
                  Secondary
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: 72 }} align="center">
                  Backup
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showHrmsColumn ? 5 : 4}>
                    <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 1 }}>
                      No users match your search.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const blocked = user.disabled;
                  const hrms = hrmsByUserId.get(user.id);
                  const isSelected =
                    draft.Primary === user.id ||
                    draft.Secondary === user.id ||
                    draft.Backup === user.id;
                  return (
                    <TableRow
                      key={user.id}
                      hover={canEdit && !disabled && !blocked}
                      sx={{
                        opacity: blocked ? 0.45 : 1,
                        bgcolor: isSelected ? `${theme.palette.primary.main}0c` : undefined,
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {user.label.split(" · ")[0]}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                          {user.label.includes(" · ")
                            ? user.label.split(" · ").slice(1).join(" · ")
                            : user.id.slice(0, 8)}
                          {blocked ? ` · ${user.disabledReason ?? "Not eligible"}` : ""}
                        </Typography>
                      </TableCell>
                      {showHrmsColumn ? (
                        <TableCell>
                          {hrmsQuery.isLoading ? (
                            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                              …
                            </Typography>
                          ) : hrms ? (
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  lineHeight: 1.45,
                                  color: !hrms.shift ? theme.palette.warning.light : undefined,
                                }}
                              >
                                {formatRosterShiftLabel(hrms.shift)}
                              </Typography>
                              {!hrms.shift ? (
                                <Link
                                  component={NextLink}
                                  href={hrmsSchedulingHref(user.id)}
                                  variant="caption"
                                  sx={{
                                    display: "inline-block",
                                    mt: 0.35,
                                    color: theme.palette.primary.light,
                                    textDecoration: "underline",
                                  }}
                                >
                                  Assign shift in HRMS first
                                </Link>
                              ) : (
                                <Chip
                                  size="small"
                                  label={rosterHrmsStatusLabel(hrms)}
                                  sx={{
                                    mt: 0.5,
                                    height: 22,
                                    fontSize: 11,
                                    bgcolor:
                                      hrms.chatAvailableNow ?
                                        `${theme.palette.success.main}22`
                                      : `${theme.palette.warning.main}22`,
                                    color:
                                      hrms.chatAvailableNow ?
                                        theme.palette.success.light
                                      : theme.palette.warning.light,
                                  }}
                                />
                              )}
                            </Box>
                          ) : (
                            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                              —
                            </Typography>
                          )}
                        </TableCell>
                      ) : null}
                      {ROSTER_TIERS.map((tier) => {
                        const checked = draft[tier] === user.id;
                        const takenElsewhere = tierTakenByOther(tier, user.id);
                        const radioDisabled =
                          !canEdit || disabled || blocked || (takenElsewhere && !checked);
                        return (
                          <TableCell key={tier} align="center" padding="checkbox">
                            <Radio
                              size="small"
                              checked={checked}
                              disabled={radioDisabled}
                              onChange={() => assignTier(tier, user.id)}
                              inputProps={{
                                "aria-label": `${tier} — ${user.label}`,
                              }}
                              sx={{ p: 0.5 }}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
    </Box>
  );
}
