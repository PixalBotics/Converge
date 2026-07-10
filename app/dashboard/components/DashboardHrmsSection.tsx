"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { useQueries } from "@tanstack/react-query";
import {
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  PendingActions as PendingActionsIcon,
} from "@mui/icons-material";
import type { AppTheme } from "@/theme/theme";
import { listPoolHeadsAttendance } from "@/api";
import { MetricCard } from "@/components/common";
import { Button, DashboardCard, Dropdown, SegmentedControl, Typography } from "@/components/common";
import { ChatAnalyticsBarChart, ChatVolumeChart } from "@/components/common";
import { useAuth } from "@/lib/auth";
import {
  HRMS,
  HRMS_LEAVE_APPROVE_ANY,
  hasAnyOperational,
} from "@/lib/permissions";
import { useDashboardWidgets } from "@/lib/permissions/use-dashboard-widgets";
import {
  useDecideLeaveDepartmentMutation,
  useDecideLeavePoolMutation,
  useDecideLeaveTenantMutation,
  useDepartmentHeadsAttendanceQuery,
  useDepartmentHeadsListQuery,
  usePendingLeaveDepartmentQueueQuery,
  usePendingLeavePoolQueueQuery,
  usePendingLeaveTenantQueueQuery,
  usePoolHeadsAttendanceQuery,
  usePoolsListQuery,
} from "@/lib/hooks/query";
import { hrmsPoolHeadsKeys } from "@/lib/hooks/query/hrms/pool-heads/keys";
import { publishAppToast } from "@/lib/notify";
import { isRecord, unwrapApiData } from "@/lib/utils/core";
import { resolveApprovalInboxAccess } from "../leave/_approval-leave/utils/approval-inbox-scope";
import { userIsListedHead } from "../attendance/_team-attendance/utils/attendance-roster";
import { resolveTeamAttendanceAccess } from "../attendance/_team-attendance/utils/attendance-scope";
import { mapAttendanceQueueRow } from "../attendance/_team-attendance/utils/attendance-rows";
import {
  approvalActions,
  approvalRow,
  approvalsList,
  approveButtonSx,
  chartCard,
  chartGrid,
  chartHeaderRow,
  chartIcon,
  chartTitleRow,
  lowerGrid,
  metricGrid,
  rejectButtonSx,
  segmentedWrap,
  statusPill,
} from "../hrms/styles";
import { last30DaysButton } from "../dashboard.styles";
import {
  HRMS_DATE_RANGE_OPTIONS,
  attendanceItemsFromUnknown,
  buildDateStringsEndingToday,
  countAttendanceByStatus,
  extractListItems,
  extractListTotal,
  extractPoolFilterOptions,
  mapAttendanceLogEntry,
  mapPendingLeaveEntry,
  resolveHrmsTrendDayCount,
  summarizeAttendanceTrend,
  type HrmsDateRangeLabel,
} from "./dashboard-hrms.utils";

export function DashboardHrmsSection() {
  const theme = useTheme() as AppTheme;
  const { hasOperational: h, user, isPlatformAdmin } = useAuth();
  const widgets = useDashboardWidgets();
  const canViewSection = widgets.hrmsAttendance || widgets.hrmsLeave;

  const [dateRange, setDateRange] = useState<HrmsDateRangeLabel>("Last 30 Days");
  const [poolFilter, setPoolFilter] = useState("");
  const [chartMode, setChartMode] = useState<"week" | "monthly">("week");

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const trendDayCount = useMemo(() => resolveHrmsTrendDayCount(dateRange), [dateRange]);
  const trendDates = useMemo(() => buildDateStringsEndingToday(trendDayCount), [trendDayCount]);
  const selectedDate = today;

  const skipDeptHeadRoster = user?.isPoolHead === true || user?.role === "manager";
  const deptHeadsRosterQuery = useDepartmentHeadsListQuery(
    {
      all: true,
      ...(user?.parentCompanyId?.trim() ? { parentCompanyId: user.parentCompanyId.trim() } : {}),
    },
    { enabled: canViewSection && h(HRMS.ATTENDANCE_VIEW) && !skipDeptHeadRoster, scope: "dashboard-hrms" },
  );

  const isDepartmentHead = useMemo(() => {
    if (user?.isPoolHead || user?.role === "manager") return false;
    return userIsListedHead(deptHeadsRosterQuery.data, user?.id);
  }, [deptHeadsRosterQuery.data, user?.id, user?.isPoolHead, user?.role]);

  const teamAccess = useMemo(
    () =>
      resolveTeamAttendanceAccess({
        hasAttendanceView: h(HRMS.ATTENDANCE_VIEW),
        isPlatformAdmin,
        isDepartmentHead,
        user,
        hasOperational: h,
      }),
    [h, isPlatformAdmin, isDepartmentHead, user],
  );

  const inboxAccess = useMemo(
    () => resolveApprovalInboxAccess({ hasOperational: h, isPlatformAdmin, isDepartmentHead, user }),
    [h, isPlatformAdmin, isDepartmentHead, user],
  );

  const canViewTeamAttendance = teamAccess.canUseTeamMembers;
  const canViewPoolHeadAttendance = teamAccess.canUsePoolHeads;
  const canViewDeptHeadAttendance = teamAccess.canUseDepartmentHeads;
  const canViewAnyAttendance =
    canViewTeamAttendance || canViewPoolHeadAttendance || canViewDeptHeadAttendance;

  const poolsQuery = usePoolsListQuery(
    { all: true, ...(user?.parentCompanyId?.trim() ? { parentCompanyId: user.parentCompanyId.trim() } : {}) },
    { enabled: canViewSection && canViewTeamAttendance, scope: "dashboard-hrms-pools" },
  );

  const poolOptions = useMemo(() => extractPoolFilterOptions(poolsQuery.data), [poolsQuery.data]);

  useEffect(() => {
    if (poolFilter && !poolOptions.some((p) => p.id === poolFilter)) {
      setPoolFilter("");
    }
  }, [poolFilter, poolOptions]);

  const attendanceLogQuery = usePoolHeadsAttendanceQuery(
    {
      all: true,
      limit: 8,
      ...(selectedDate ? { date: selectedDate } : {}),
      ...(poolFilter ? { poolId: poolFilter } : {}),
    },
    { enabled: canViewSection && canViewTeamAttendance, scope: "dashboard-hrms-log" },
  );

  const poolHeadsLogQuery = useDepartmentHeadsAttendanceQuery(
    {
      all: true,
      limit: 8,
      ...(selectedDate ? { date: selectedDate } : {}),
    },
    { enabled: canViewSection && canViewPoolHeadAttendance, scope: "dashboard-hrms-pool-heads-log" },
  );

  const deptHeadsLogQuery = useDepartmentHeadsAttendanceQuery(
    {
      all: true,
      limit: 8,
      ...(selectedDate ? { date: selectedDate } : {}),
    },
    { enabled: canViewSection && canViewDeptHeadAttendance, scope: "dashboard-hrms-dept-heads-log" },
  );

  const activeLogQuery = canViewTeamAttendance
    ? attendanceLogQuery
    : canViewPoolHeadAttendance
      ? poolHeadsLogQuery
      : canViewDeptHeadAttendance
        ? deptHeadsLogQuery
        : null;

  const trendQueries = useQueries({
    queries: trendDates.map((date) => ({
      queryKey: [
        ...hrmsPoolHeadsKeys.attendance({ date, poolId: poolFilter || undefined, all: true }),
        "dashboard-trend",
      ] as const,
      queryFn: () =>
        listPoolHeadsAttendance({
          date,
          all: true,
          ...(poolFilter ? { poolId: poolFilter } : {}),
        }),
      enabled: canViewSection && canViewTeamAttendance && chartMode === "week",
    })),
  });

  const attendanceLogItems = useMemo(() => {
    if (!activeLogQuery?.data) return [];
    return attendanceItemsFromUnknown(activeLogQuery.data).slice(0, 8);
  }, [activeLogQuery?.data]);

  const attendanceLogRows = useMemo(
    () =>
      attendanceLogItems.map((row, idx) => {
        const mapped = mapAttendanceQueueRow(row, idx, "dash-hrms", {});
        return mapAttendanceLogEntry(
          {
            ...row,
            status: mapped.status,
            checkInAt: mapped.checkIn,
            memberName: mapped.employeeName,
          },
          idx,
        );
      }),
    [attendanceLogItems],
  );

  const attendanceStats = useMemo(
    () => countAttendanceByStatus(attendanceLogItems),
    [attendanceLogItems],
  );

  const attendanceTotal = useMemo(
    () => (activeLogQuery?.data ? extractListTotal(activeLogQuery.data, attendanceLogItems.length) : 0),
    [activeLogQuery?.data, attendanceLogItems.length],
  );

  const trendChartData = useMemo(() => {
    const dayResults = trendDates.map((date, index) => ({
      date,
      items: attendanceItemsFromUnknown(trendQueries[index]?.data),
    }));
    return summarizeAttendanceTrend(dayResults);
  }, [trendDates, trendQueries]);

  const barChartData = useMemo(
    () =>
      trendChartData.map((point) => ({
        name: point.name,
        value: point.value,
        fill: (point.value >= point.total / 2 ? "second" : "first") as "first" | "second",
      })),
    [trendChartData],
  );

  const volumeChartData = useMemo(
    () => trendChartData.map((point, index) => ({ day: index + 1, value: point.value })),
    [trendChartData],
  );

  const approvalQueue = inboxAccess.queue;
  const canApprovePool = h(HRMS.LEAVE_APPROVE_POOL);
  const canApproveDept = h(HRMS.LEAVE_APPROVE_DEPT);
  const canApproveTenant = h(HRMS.LEAVE_APPROVE_TENANT);
  const canDecideLeave = hasAnyOperational(h, HRMS_LEAVE_APPROVE_ANY);

  const poolQueueQuery = usePendingLeavePoolQueueQuery(
    { all: true, limit: 8, ...(poolFilter ? { poolId: poolFilter } : {}) },
    {
      enabled:
        canViewSection &&
        widgets.hrmsLeave &&
        approvalQueue === "pool" &&
        inboxAccess.canUsePoolQueue,
      scope: "dashboard-hrms-leave",
    },
  );
  const deptQueueQuery = usePendingLeaveDepartmentQueueQuery(
    { all: true, limit: 8 },
    {
      enabled:
        canViewSection &&
        widgets.hrmsLeave &&
        approvalQueue === "department" &&
        inboxAccess.canUseDepartmentQueue,
      scope: "dashboard-hrms-leave",
    },
  );
  const tenantQueueQuery = usePendingLeaveTenantQueueQuery(
    { all: true, limit: 8 },
    {
      enabled:
        canViewSection &&
        widgets.hrmsLeave &&
        approvalQueue === "tenant" &&
        inboxAccess.canUseTenantQueue,
      scope: "dashboard-hrms-leave",
    },
  );

  const activeLeaveQuery =
    approvalQueue === "pool"
      ? poolQueueQuery
      : approvalQueue === "department"
        ? deptQueueQuery
        : approvalQueue === "tenant"
          ? tenantQueueQuery
          : null;

  const pendingLeaveRows = useMemo(() => {
    const payload = unwrapApiData(activeLeaveQuery?.data);
    const items = isRecord(payload) ? extractListItems(payload) : [];
    return items
      .map((row, idx) => mapPendingLeaveEntry(row, idx))
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .slice(0, 8);
  }, [activeLeaveQuery?.data]);

  const pendingLeaveTotal = useMemo(
    () => extractListTotal(activeLeaveQuery?.data, pendingLeaveRows.length),
    [activeLeaveQuery?.data, pendingLeaveRows.length],
  );

  const decidePoolMutation = useDecideLeavePoolMutation();
  const decideDeptMutation = useDecideLeaveDepartmentMutation();
  const decideTenantMutation = useDecideLeaveTenantMutation();

  const handleLeaveDecision = async (id: string, status: "approved" | "rejected") => {
    const body = { status };
    try {
      if (approvalQueue === "pool" && canApprovePool) {
        await decidePoolMutation.mutateAsync({ id, body });
      } else if (approvalQueue === "department" && canApproveDept) {
        await decideDeptMutation.mutateAsync({ id, body });
      } else if (approvalQueue === "tenant" && canApproveTenant) {
        await decideTenantMutation.mutateAsync({ id, body });
      } else {
        publishAppToast({ variant: "error", message: "You do not have permission to decide this leave." });
        return;
      }
      publishAppToast({
        variant: "success",
        message: status === "approved" ? "Leave approved." : "Leave rejected.",
      });
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: err instanceof Error ? err.message : "Could not update leave application.",
      });
    }
  };

  const poolFilterOptions = useMemo(
    () => ["All pools", ...poolOptions.map((p) => p.name)],
    [poolOptions],
  );

  const poolFilterValue = useMemo(() => {
    if (!poolFilter) return "All pools";
    return poolOptions.find((p) => p.id === poolFilter)?.name ?? "All pools";
  }, [poolFilter, poolOptions]);

  if (!canViewSection) return null;

  const showPoolFilter = canViewTeamAttendance && poolOptions.length > 0;
  const showAttendanceBlock = widgets.hrmsAttendance && canViewAnyAttendance;
  const showLeaveBlock =
    widgets.hrmsLeave &&
    Boolean(approvalQueue) &&
    hasAnyOperational(h, HRMS_LEAVE_APPROVE_ANY);

  return (
    <Box sx={{ mt: 3 }}>
      {(showPoolFilter || showAttendanceBlock || showLeaveBlock) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            mb: 2,
          }}
        >
          {showPoolFilter ? (
            <Dropdown
              id="dashboard-hrms-pool-filter"
              options={poolFilterOptions}
              value={poolFilterValue}
              onChange={(label) => {
                if (label === "All pools") {
                  setPoolFilter("");
                  return;
                }
                const match = poolOptions.find((p) => p.name === label);
                setPoolFilter(match?.id ?? "");
              }}
              buttonSx={last30DaysButton}
              endIcon="▾"
            />
          ) : null}
          <Dropdown
            id="dashboard-hrms-date-range"
            options={[...HRMS_DATE_RANGE_OPTIONS]}
            value={dateRange}
            onChange={(value) => setDateRange(value as HrmsDateRangeLabel)}
            buttonSx={last30DaysButton}
            endIcon="▾"
          />
        </Box>
      )}

      {(showAttendanceBlock || showLeaveBlock) && (
        <Box sx={metricGrid}>
          {showAttendanceBlock ? (
            <MetricCard
              title="Today's attendance"
              value={
                activeLogQuery?.isLoading
                  ? "…"
                  : `${attendanceStats.checkedIn}/${attendanceTotal || attendanceStats.total || "—"}`
              }
              subtitle={`Present ${attendanceStats.present} · Late ${attendanceStats.late}`}
              icon={<BarChartIcon sx={{ fontSize: 22 }} />}
              iconBgColor={theme.app.dashboard.accentBlue}
              valueColor={theme.app.dashboard.accentCyan}
              showTrendArrow={false}
            />
          ) : null}
          {showLeaveBlock ? (
            <MetricCard
              title="Pending leave requests"
              value={activeLeaveQuery?.isLoading ? "…" : String(pendingLeaveTotal)}
              subtitle="Awaiting your approval"
              icon={<PendingActionsIcon sx={{ fontSize: 22 }} />}
              iconBgColor={theme.app.dashboard.accentOrange}
              valueColor={theme.app.dashboard.accentOrange}
              showTrendArrow={false}
            />
          ) : null}
          {showAttendanceBlock ? (
            <MetricCard
              title="Roster size"
              value={activeLogQuery?.isLoading ? "…" : String(attendanceTotal || attendanceStats.total)}
              subtitle={`Snapshot for ${selectedDate}`}
              icon={<BarChartIcon sx={{ fontSize: 22 }} />}
              iconBgColor={theme.app.dashboard.accentPurple}
              showTrendArrow={false}
            />
          ) : null}
          {showLeaveBlock ? (
            <MetricCard
              title="Approval queue"
              value={
                approvalQueue === "pool"
                  ? "Pool"
                  : approvalQueue === "department"
                    ? "Department"
                    : approvalQueue === "tenant"
                      ? "Company"
                      : "—"
              }
              subtitle="Based on your HRMS role"
              icon={<PendingActionsIcon sx={{ fontSize: 22 }} />}
              iconBgColor={theme.app.dashboard.accentPink}
              showTrendArrow={false}
            />
          ) : null}
        </Box>
      )}

      {showAttendanceBlock && canViewTeamAttendance ? (
        <Box sx={chartGrid}>
          <DashboardCard sx={chartCard}>
            <Box sx={chartHeaderRow}>
              <Box sx={chartTitleRow}>
                <Box sx={chartIcon}>
                  <BarChartIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="subtitle1" color="white" fontWeight={600}>
                  Attendance check-ins
                </Typography>
              </Box>
              <Box sx={segmentedWrap}>
                <SegmentedControl
                  options={[
                    { value: "week", label: "Daily" },
                    { value: "monthly", label: "Summary" },
                  ]}
                  value={chartMode}
                  onChange={(value) => setChartMode(value as "week" | "monthly")}
                />
              </Box>
            </Box>
            <Box sx={{ minHeight: 320 }}>
              {chartMode === "week" ? (
                <ChatAnalyticsBarChart
                  data={barChartData}
                  height={320}
                  yDomain={[0, Math.max(10, ...barChartData.map((d) => d.value))]}
                  yTickFormatter={(v) => String(v)}
                  tooltipFormatter={(v) => `${v} checked in`}
                />
              ) : (
                <ChatVolumeChart
                  data={volumeChartData}
                  height={320}
                  yDomain={[0, Math.max(10, ...volumeChartData.map((d) => d.value))]}
                  yTickFormatter={(v) => String(v)}
                  tooltipFormatter={(v) => `${v} checked in`}
                />
              )}
            </Box>
          </DashboardCard>

          <DashboardCard sx={chartCard}>
            <Box sx={chartHeaderRow}>
              <Box sx={chartTitleRow}>
                <Box sx={chartIcon}>
                  <TimelineIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="subtitle1" color="white" fontWeight={600}>
                  Attendance trend
                </Typography>
              </Box>
            </Box>
            <Box sx={{ minHeight: 320 }}>
              <ChatVolumeChart
                data={volumeChartData}
                height={320}
                yDomain={[0, Math.max(10, ...volumeChartData.map((d) => d.value))]}
                yTickFormatter={(v) => String(v)}
                tooltipFormatter={(v) => `${v} checked in`}
              />
            </Box>
          </DashboardCard>
        </Box>
      ) : null}

      {(showAttendanceBlock || showLeaveBlock) && (
        <Box sx={lowerGrid}>
          {showAttendanceBlock ? (
            <DashboardCard sx={chartCard}>
              <Box sx={chartHeaderRow}>
                <Box sx={chartTitleRow}>
                  <Box sx={chartIcon}>
                    <TimelineIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Typography variant="subtitle1" color="white" fontWeight={600}>
                    Attendance log
                  </Typography>
                </Box>
              </Box>
              {activeLogQuery?.isLoading ? (
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                  Loading attendance…
                </Typography>
              ) : attendanceLogRows.length === 0 ? (
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                  No attendance records for this date and filter.
                </Typography>
              ) : (
                <Box sx={approvalsList}>
                  {attendanceLogRows.map((entry) => {
                    const isLate = entry.status === "Late";
                    const isAbsent = entry.status === "Absent";
                    const bg = isAbsent
                      ? "rgba(239,68,68,0.22)"
                      : isLate
                        ? "rgba(249,115,22,0.24)"
                        : "rgba(34,197,94,0.22)";
                    const color = isAbsent ? "#F87171" : isLate ? "#FB923C" : "#22C55E";
                    const border = isAbsent
                      ? "rgba(239,68,68,0.45)"
                      : isLate
                        ? "rgba(249,115,22,0.45)"
                        : "rgba(34,197,94,0.45)";
                    return (
                      <Box key={entry.id} sx={approvalRow}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                          <Box>
                            <Typography variant="body2" color="white" fontWeight={600}>
                              {entry.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.app.dashboard.white60 }}>
                              {entry.time}
                            </Typography>
                          </Box>
                          <Box sx={statusPill(bg, color, border)}>{entry.status}</Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </DashboardCard>
          ) : null}

          {showLeaveBlock ? (
            <DashboardCard sx={chartCard}>
              <Box sx={chartHeaderRow}>
                <Box sx={chartTitleRow}>
                  <Box sx={chartIcon}>
                    <PendingActionsIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Typography variant="subtitle1" color="white" fontWeight={600}>
                    Pending approvals
                  </Typography>
                </Box>
              </Box>
              {activeLeaveQuery?.isLoading ? (
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                  Loading leave queue…
                </Typography>
              ) : pendingLeaveRows.length === 0 ? (
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                  No pending leave requests in your queue.
                </Typography>
              ) : (
                <Box sx={approvalsList}>
                  {pendingLeaveRows.map((entry) => (
                    <Box key={entry.id} sx={approvalRow}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                        <Box>
                          <Typography variant="body2" color="white" fontWeight={600}>
                            {entry.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.app.dashboard.white60 }}>
                            {entry.leave} · {entry.days}
                          </Typography>
                        </Box>
                        <Box sx={statusPill("rgba(245,158,11,0.24)", "#FBBF24", "rgba(245,158,11,0.45)")}>
                          Pending
                        </Box>
                      </Box>
                      <Box sx={approvalActions}>
                        <Button
                          variant="primary"
                          sx={approveButtonSx}
                          disabled={!canDecideLeave}
                          onClick={() => void handleLeaveDecision(entry.id, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          sx={rejectButtonSx}
                          disabled={!canDecideLeave}
                          onClick={() => void handleLeaveDecision(entry.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </DashboardCard>
          ) : null}
        </Box>
      )}
    </Box>
  );
}
