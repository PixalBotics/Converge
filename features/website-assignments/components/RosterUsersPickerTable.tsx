"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Radio from "@mui/material/Radio";
import Checkbox from "@mui/material/Checkbox";
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
import type { OperatingChannels } from "@/api/types/website-assignments.types";
import { rosterVisibleTiers } from "@/lib/website-assignments/roster-assignment-channels";
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
import { ROSTER_TIERS, isUserInOtherTier, isUserInTier, isUserSelectedInDraft, toggleTierUser } from "../utils/roster-draft.utils";
import type { SlotDraft } from "./RosterSlotPicker";

type RosterUserTypeFilter = "all" | "Internal" | "External";

type RosterUsersPickerTableProps = {
  websiteId: string;
  operatingChannels: OperatingChannels;
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
  operatingChannels,
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
  const [userTypeFilter, setUserTypeFilter] = useState<RosterUserTypeFilter>("all");
  const showDualUserTypes =
    operatingChannels === "internal_only" && channel === "Internal";
  const visibleTiers = rosterVisibleTiers(operatingChannels);

  const internalUsersQuery = useUsersListQuery(
    { all: true, userType: "Internal" },
    { enabled: !disabled && showDualUserTypes },
  );

  const externalUsersQuery = useUsersListQuery(
    { all: true, userType: "External" },
    { enabled: !disabled && showDualUserTypes },
  );

  const channelUsersQuery = useUsersListQuery(
    {
      all: true,
      userType: channel,
      ...(departmentId.trim() ? { departmentId } : {}),
    },
    { enabled: !disabled && !showDualUserTypes && departmentId.trim().length > 0 },
  );

  const qaExclusionsQuery = useQaRosterExclusionsQuery(
    websiteId,
    Boolean(websiteId.trim()) && !disabled,
  );

  const usersLoading =
    showDualUserTypes
      ? internalUsersQuery.isLoading || externalUsersQuery.isLoading
      : channelUsersQuery.isLoading;

  const userOptions = useMemo(() => {
    const deptKey = departmentId.trim();
    const raw =
      showDualUserTypes
        ? [
            ...buildRosterUserOptions(internalUsersQuery.data, deptKey, "Internal"),
            ...buildRosterUserOptions(externalUsersQuery.data, deptKey, "External"),
          ]
        : buildRosterUserOptions(channelUsersQuery.data, deptKey, channel);

    const merged = new Map<string, (typeof raw)[number]>();
    for (const u of raw) {
      if (!merged.has(u.id)) merged.set(u.id, u);
    }

    const qaIds = new Set(qaExclusionsQuery.data?.qaReviewerUserIds ?? []);
    return [...merged.values()].map((u) =>
      qaIds.has(u.id)
        ? {
            ...u,
            disabled: true,
            disabledReason: "QA reviewer — use QA inbox, not live chat slots",
          }
        : u,
    );
  }, [
    showDualUserTypes,
    internalUsersQuery.data,
    externalUsersQuery.data,
    channelUsersQuery.data,
    departmentId,
    channel,
    qaExclusionsQuery.data?.qaReviewerUserIds,
  ]);

  const eligibleCount = useMemo(
    () => userOptions.filter((u) => !u.disabled).length,
    [userOptions],
  );

  const channelChipColor =
    channel === "External" ? theme.palette.warning.main : theme.palette.info.main;

  const hrmsUserIds = useMemo(() => {
    const ids = new Set<string>();
    for (const u of userOptions) ids.add(u.id);
    for (const tier of ROSTER_TIERS) {
      for (const id of draft[tier]) ids.add(id);
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
    const selectedIds = new Set(ROSTER_TIERS.flatMap((t) => draft[t]));
    return userOptions.filter((u) => {
      const blockedReason = blockedInOtherBlocks?.get(u.id);
      if (blockedReason && !selectedIds.has(u.id)) return false;
      if (showDualUserTypes && userTypeFilter !== "all" && u.userType !== userTypeFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [u.name, u.email, u.department, u.pool, u.userType, u.label]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [userOptions, userSearch, blockedInOtherBlocks, draft, showDualUserTypes, userTypeFilter]);

  const hiddenByBlockCount = useMemo(() => {
    if (!blockedInOtherBlocks?.size) return 0;
    const selectedIds = new Set(ROSTER_TIERS.flatMap((t) => draft[t]));
    let n = 0;
    for (const userId of blockedInOtherBlocks.keys()) {
      if (!selectedIds.has(userId)) n += 1;
    }
    return n;
  }, [blockedInOtherBlocks, draft]);

  const assignTier = (tier: WebsiteAssignmentTier, userId: string) => {
    if (!canEdit || disabled) return;
    onChange(toggleTierUser(draft, tier, userId));
  };

  const selectedSummary = visibleTiers.flatMap((tier) =>
    draft[tier].map((id) => {
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
    }),
  );

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
          {showDualUserTypes ? (
            <Chip label="External allowed for Backup" size="small" variant="outlined" />
          ) : null}
          {!usersLoading ? (
            <Chip
              label={`${eligibleCount} eligible user${eligibleCount === 1 ? "" : "s"}`}
              size="small"
              variant="outlined"
            />
          ) : null}
        </Box>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
          {showDualUserTypes ? (
            <>
              Pick <strong>Primary</strong> and <strong>Secondary</strong> internal agents.{" "}
              <strong>Backup</strong> may be internal or external.
            </>
          ) : operatingChannels === "both" ? (
            <>
              Select <strong>Primary</strong> and <strong>Backup</strong> agents. Only{" "}
              <strong>{channel.toLowerCase()}</strong> users
              {departmentName ? (
                <>
                  {" "}
                  for <strong>{departmentName}</strong>
                </>
              ) : null}{" "}
              are shown.
            </>
          ) : (
            <>
              Select agents per column (checkbox). Multiple primaries allowed. Only{" "}
              <strong>{channel.toLowerCase()}</strong> users
              {departmentName ? (
                <>
                  {" "}
                  for <strong>{departmentName}</strong>
                </>
              ) : null}{" "}
              are shown.
            </>
          )}
        </Typography>
      </Box>

      {showDualUserTypes ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5, alignItems: "center" }}>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mr: 0.5 }}>
            Show:
          </Typography>
          {(
            [
              { value: "all" as const, label: "All users" },
              { value: "Internal" as const, label: "Internal" },
              { value: "External" as const, label: "External" },
            ] as const
          ).map(({ value, label }) => (
            <Chip
              key={value}
              label={label}
              size="small"
              clickable
              onClick={() => setUserTypeFilter(value)}
              variant={userTypeFilter === value ? "filled" : "outlined"}
              color={userTypeFilter === value ? "primary" : "default"}
              sx={{ fontWeight: userTypeFilter === value ? 700 : 500 }}
            />
          ))}
        </Box>
      ) : null}

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

      <InputField
        label="Search users"
        value={userSearch}
        onChange={(e) => setUserSearch((e.target as HTMLInputElement).value)}
        placeholder="Name, email, pool…"
        disabled={!canEdit || disabled}
        sx={{ mb: 1.5, maxWidth: 360 }}
      />

      {usersLoading ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
          Loading users…
        </Typography>
      ) : null}

      {!usersLoading && userOptions.length === 0 ? (
        <Typography variant="body2" sx={{ color: theme.palette.warning.light, py: 1 }}>
          {showDualUserTypes
            ? "No internal or external users found. Add users under User management first."
            : `No ${channel.toLowerCase()} users in this department. Add users under User management first.`}
        </Typography>
      ) : null}

      {!usersLoading && userOptions.length > 0 ? (
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
                <TableCell sx={{ fontWeight: 700, minWidth: 160 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 88 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 100 }}>Pool</TableCell>
                {showHrmsColumn ? (
                  <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>HRMS shift</TableCell>
                ) : null}
                <TableCell sx={{ fontWeight: 700, width: 72 }} align="center">
                  Primary
                </TableCell>
                {visibleTiers.includes("Secondary") ? (
                  <TableCell sx={{ fontWeight: 700, width: 72 }} align="center">
                    Secondary
                  </TableCell>
                ) : null}
                <TableCell sx={{ fontWeight: 700, width: 72 }} align="center">
                  Backup
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={(showHrmsColumn ? 5 : 4) + visibleTiers.length}>
                    <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 1 }}>
                      No users match your search.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const blocked = user.disabled;
                  const hrms = hrmsByUserId.get(user.id);
                  const isSelected = isUserSelectedInDraft(draft, user.id);
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
                          {user.name}
                        </Typography>
                        {user.email ? (
                          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                            {user.email}
                          </Typography>
                        ) : null}
                        {blocked ? (
                          <Typography variant="caption" sx={{ color: theme.palette.warning.light, display: "block" }}>
                            {user.disabledReason ?? "Not eligible"}
                          </Typography>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.userType}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: 11,
                            fontWeight: 700,
                            bgcolor:
                              user.userType === "External"
                                ? `${theme.palette.warning.main}22`
                                : `${theme.palette.info.main}22`,
                            color:
                              user.userType === "External"
                                ? theme.palette.warning.light
                                : theme.palette.info.light,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                          {user.department ?? "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                          {user.pool ?? "—"}
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
                      {visibleTiers.map((tier) => {
                        const checked = isUserInTier(draft, tier, user.id);
                        const takenElsewhere = isUserInOtherTier(draft, tier, user.id);
                        const externalBackupOnly =
                          showDualUserTypes &&
                          user.userType === "External" &&
                          tier !== "Backup";
                        const cellDisabled =
                          !canEdit ||
                          disabled ||
                          blocked ||
                          externalBackupOnly ||
                          (takenElsewhere && !checked);
                        const useCheckbox =
                          tier === "Primary" ||
                          (tier === "Secondary" && visibleTiers.includes("Secondary"));
                        return (
                          <TableCell key={tier} align="center" padding="checkbox">
                            {useCheckbox ? (
                              <Checkbox
                                size="small"
                                checked={checked}
                                disabled={cellDisabled}
                                onChange={() => assignTier(tier, user.id)}
                                inputProps={{
                                  "aria-label": `${tier} — ${user.label}`,
                                }}
                                sx={{ p: 0.5 }}
                              />
                            ) : (
                              <Radio
                                size="small"
                                checked={checked}
                                disabled={cellDisabled}
                                onChange={() => assignTier(tier, user.id)}
                                inputProps={{
                                  "aria-label": `${tier} — ${user.label}`,
                                }}
                                sx={{ p: 0.5 }}
                              />
                            )}
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

      {selectedSummary.length > 0 ? (
        <Box sx={{ mt: 2.5 }}>
          <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
            Selected agents ({selectedSummary.length})
          </Typography>
          <TableContainer
            sx={{
              maxHeight: 280,
              borderRadius: 2,
              border: `1px solid ${theme.palette.primary.main}44`,
              bgcolor: `${theme.palette.primary.main}08`,
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, minWidth: 160 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 88 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 100 }}>Pool</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 100 }}>Tier</TableCell>
                  {showHrmsColumn ? (
                    <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>HRMS shift</TableCell>
                  ) : null}
                  <TableCell sx={{ fontWeight: 700, minWidth: 140 }}>Service hours</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedSummary.map(
                  ({ tier, userId, label, shiftLine, statusLabel, missingShift }) => {
                    const user = userOptions.find((o) => o.id === userId);
                    const tierColor =
                      tier === "Primary"
                        ? theme.palette.success.main
                        : tier === "Secondary"
                          ? theme.palette.info.main
                          : theme.palette.warning.main;
                    return (
                      <TableRow key={`${tier}-${userId}`}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {user?.name ?? label}
                          </Typography>
                          {user?.email ? (
                            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                              {user.email}
                            </Typography>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          {user?.userType ? (
                            <Chip
                              label={user.userType}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: 11,
                                fontWeight: 700,
                                bgcolor:
                                  user.userType === "External"
                                    ? `${theme.palette.warning.main}22`
                                    : `${theme.palette.info.main}22`,
                                color:
                                  user.userType === "External"
                                    ? theme.palette.warning.light
                                    : theme.palette.info.light,
                              }}
                            />
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                            {user?.department ?? "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                            {user?.pool ?? "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tier}
                            size="small"
                            sx={{
                              height: 24,
                              fontWeight: 700,
                              bgcolor: `${tierColor}22`,
                              color: tierColor,
                            }}
                          />
                        </TableCell>
                        {showHrmsColumn ? (
                          <TableCell>
                            {showHrmsShift ? (
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "block",
                                    lineHeight: 1.45,
                                    color: missingShift ? theme.palette.warning.light : undefined,
                                  }}
                                >
                                  {shiftLine ?? "—"}
                                  {statusLabel ? ` · ${statusLabel}` : ""}
                                </Typography>
                                {missingShift ? (
                                  <Link
                                    component={NextLink}
                                    href={hrmsSchedulingHref(userId)}
                                    variant="caption"
                                    sx={{
                                      display: "inline-block",
                                      mt: 0.35,
                                      color: theme.palette.primary.light,
                                      textDecoration: "underline",
                                    }}
                                  >
                                    Assign shift in HRMS
                                  </Link>
                                ) : null}
                              </Box>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        ) : null}
                        <TableCell>
                          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}>
                            {websiteHoursLabel ?? blockHoursLabel ?? "—"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  },
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : null}
    </Box>
  );
}
