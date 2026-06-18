"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { rolesPageWrapper } from "../../roles/roles.styles";
import { pageWrapper } from "../../companies/overview.styles";
import { useAuth } from "@/lib/auth";
import { HRMS } from "@/lib/permissions";
import {
  useDepartmentHeadsListQuery,
  useDepartmentHeadsAttendanceQuery,
  usePoolHeadsAttendanceQuery,
} from "@/lib/hooks/query";
import {
  approvalLeaveHeaderWrapSx,
  approvalLeaveSubtextSx,
} from "../../leave/_approval-leave/approval-leave.styles";
import { TeamAttendanceTableCard } from "../_team-attendance/components";
import {
  extractAttendanceItems,
  extractAttendanceTotal,
  extractAttendanceTotalPages,
  mapAttendanceQueueRow,
  type TeamAttendanceTableRow,
} from "../_team-attendance/utils/attendance-rows";
import {
  buildHeadRosterProfileByUserId,
  extractHeadUserIds,
  extractAttendancePayloadDepartmentName,
  findListedHeadDepartmentId,
  findListedHeadDepartmentName,
  paginateItems,
  userIsListedHead,
} from "../_team-attendance/utils/attendance-roster";
import { resolveTeamAttendanceAccess } from "../_team-attendance/utils/attendance-scope";
import { useHeadRosterDayAttendanceQueries } from "../_team-attendance/utils/use-head-roster-day-attendance";
import {
  teamAttendanceHeaderRowSx,
  teamAttendanceStatusTextSx,
  teamAttendanceSubtextSx,
} from "./team-attendance.styles";

const PAGE_LIMIT = 16;

const SCOPE_SUBTEXT = {
  team_members: "Attendance for pool members in pools you manage.",
  pool_heads: "Attendance for pool heads in your department.",
  department_heads: "Attendance for department heads in your company.",
} as const;

const SCOPE_EMPTY = {
  team_members: {
    title: "No team attendance",
    subtitle: "No pool member attendance for this date. You must be assigned as a pool head.",
  },
  pool_heads: {
    title: "No pool head attendance",
    subtitle: "No pool head attendance for this date in your department scope.",
  },
  department_heads: {
    title: "No department head attendance",
    subtitle: "No department head attendance for this date in your company scope.",
  },
} as const;

export default function TeamAttendancePage() {
  const { hasOperational: h, user, isPlatformAdmin } = useAuth();

  const skipDeptHeadRoster = user?.isPoolHead === true || user?.role === "manager";

  const deptHeadsRosterQuery = useDepartmentHeadsListQuery(
    {
      all: true,
      ...(user?.parentCompanyId?.trim() ? { parentCompanyId: user.parentCompanyId.trim() } : {}),
    },
    { enabled: h(HRMS.ATTENDANCE_VIEW) && !skipDeptHeadRoster, scope: "attendance-role-detect" },
  );

  const isDepartmentHead = useMemo(() => {
    if (user?.isPoolHead || user?.role === "manager") return false;
    return userIsListedHead(deptHeadsRosterQuery.data, user?.id);
  }, [deptHeadsRosterQuery.data, user?.id, user?.isPoolHead, user?.role]);

  const access = useMemo(
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

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [scope, setScope] = useState<"team_members" | "pool_heads" | "department_heads">("team_members");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(today);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (access.scope) setScope(access.scope);
  }, [access.scope]);

  const departmentHeadDepartmentId = useMemo(
    () => findListedHeadDepartmentId(deptHeadsRosterQuery.data, user?.id),
    [deptHeadsRosterQuery.data, user?.id],
  );

  const departmentHeadUserIds = useMemo(
    () => extractHeadUserIds(deptHeadsRosterQuery.data),
    [deptHeadsRosterQuery.data],
  );

  const departmentHeadProfileByUserId = useMemo(
    () => buildHeadRosterProfileByUserId(deptHeadsRosterQuery.data),
    [deptHeadsRosterQuery.data],
  );

  const teamMembersQuery = usePoolHeadsAttendanceQuery(
    {
      page,
      limit: PAGE_LIMIT,
      ...(date.trim() ? { date: date.trim() } : {}),
      ...(search.trim() ? { memberName: search.trim() } : {}),
    },
    {
      enabled: scope === "team_members" && access.canUseTeamMembers,
      scope: "attendance-team-members",
    },
  );

  const poolHeadsScopeQuery = useDepartmentHeadsAttendanceQuery(
    {
      page,
      limit: PAGE_LIMIT,
      ...(departmentHeadDepartmentId?.trim()
        ? { departmentId: departmentHeadDepartmentId.trim() }
        : {}),
      ...(date.trim() ? { date: date.trim() } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
    },
    {
      enabled:
        scope === "pool_heads" &&
        access.canUsePoolHeads &&
        Boolean(departmentHeadDepartmentId?.trim()),
      scope: "attendance-pool-heads",
    },
  );

  const departmentHeadDepartmentName = useMemo(
    () =>
      findListedHeadDepartmentName(deptHeadsRosterQuery.data, user?.id) ||
      extractAttendancePayloadDepartmentName(poolHeadsScopeQuery.data),
    [deptHeadsRosterQuery.data, user?.id, poolHeadsScopeQuery.data],
  );

  const departmentHeadRosterAttendance = useHeadRosterDayAttendanceQueries(departmentHeadUserIds, date, {
    enabled: scope === "department_heads" && access.canUseDepartmentHeads,
  });

  const scopedSearch = search.trim().toLowerCase();

  const filteredDepartmentHeadItems = useMemo(() => {
    const raw = departmentHeadRosterAttendance.items;
    if (!scopedSearch) return raw;
    return raw.filter((row) => {
      const mapped = mapAttendanceQueueRow(row, 0, "filter", {
        rosterProfileByUserId: departmentHeadProfileByUserId,
      });
      return (
        mapped.employeeName.toLowerCase().includes(scopedSearch) ||
        mapped.departmentName.toLowerCase().includes(scopedSearch)
      );
    });
  }, [departmentHeadRosterAttendance.items, scopedSearch, departmentHeadProfileByUserId]);

  const activeItems = useMemo(() => {
    if (scope === "team_members") return extractAttendanceItems(teamMembersQuery.data);
    if (scope === "pool_heads") return extractAttendanceItems(poolHeadsScopeQuery.data);
    return paginateItems(filteredDepartmentHeadItems, page, PAGE_LIMIT);
  }, [scope, teamMembersQuery.data, poolHeadsScopeQuery.data, filteredDepartmentHeadItems, page]);

  const rows = useMemo<TeamAttendanceTableRow[]>(
    () =>
      activeItems.map((row, idx) =>
        mapAttendanceQueueRow(row, idx, scope, {
          fallbackDepartmentName: scope === "pool_heads" ? departmentHeadDepartmentName : undefined,
          rosterProfileByUserId: scope === "department_heads" ? departmentHeadProfileByUserId : undefined,
        }),
      ),
    [activeItems, scope, departmentHeadDepartmentName, departmentHeadProfileByUserId],
  );

  const total = useMemo(() => {
    if (scope === "team_members") {
      return extractAttendanceTotal(teamMembersQuery.data, rows.length);
    }
    if (scope === "pool_heads") {
      return extractAttendanceTotal(poolHeadsScopeQuery.data, rows.length);
    }
    return filteredDepartmentHeadItems.length;
  }, [scope, teamMembersQuery.data, poolHeadsScopeQuery.data, rows.length, filteredDepartmentHeadItems.length]);

  const pageCount = useMemo(() => {
    if (scope === "team_members") return extractAttendanceTotalPages(teamMembersQuery.data);
    if (scope === "pool_heads") return extractAttendanceTotalPages(poolHeadsScopeQuery.data);
    return Math.max(1, Math.ceil(total / PAGE_LIMIT));
  }, [scope, teamMembersQuery.data, poolHeadsScopeQuery.data, total]);

  const isLoading =
    scope === "team_members"
      ? teamMembersQuery.isLoading || teamMembersQuery.isFetching
      : scope === "pool_heads"
        ? poolHeadsScopeQuery.isLoading ||
          poolHeadsScopeQuery.isFetching ||
          deptHeadsRosterQuery.isLoading
        : departmentHeadRosterAttendance.isLoading || deptHeadsRosterQuery.isLoading;

  useEffect(() => {
    setPage(1);
  }, [scope, search, date]);

  useEffect(() => {
    setPage((prev) => (prev > pageCount ? pageCount : prev));
  }, [pageCount]);

  const footerRangeStart = rows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + rows.length;

  const columns = useMemo<DataTableColumn<TeamAttendanceTableRow>[]>(() => {
    const statusCol: DataTableColumn<TeamAttendanceTableRow> = {
      id: "status",
      label: "Status",
      render: (value) => (
        <Box component="span" sx={teamAttendanceStatusTextSx}>
          {String(value)}
        </Box>
      ),
    };
    const base: DataTableColumn<TeamAttendanceTableRow>[] = [
      { id: "employeeName", label: "Employee" },
      { id: "date", label: "Date (UTC)" },
      statusCol,
      { id: "checkIn", label: "Check-in" },
      { id: "checkOut", label: "Check-out" },
      { id: "login", label: "Login" },
      { id: "logout", label: "Logout" },
      { id: "breakSummary", label: "Break" },
      { id: "workedMinutes", label: "Worked" },
      { id: "startChat", label: "Start chat" },
      { id: "chatPause", label: "Chat pause" },
      { id: "chatMinutes", label: "Chat min" },
      { id: "meetingMinutes", label: "Meeting min" },
    ];

    if (scope === "team_members") {
      return [{ id: "poolName", label: "Pool" }, ...base];
    }
    if (scope === "pool_heads") {
      return [
        { id: "poolName", label: "Pool" },
        { id: "departmentName", label: "Department" },
        ...base,
      ];
    }
    return [
      { id: "employeeName", label: "Employee" },
      { id: "departmentName", label: "Department" },
      { id: "date", label: "Date (UTC)" },
      statusCol,
      { id: "checkIn", label: "Check-in" },
      { id: "checkOut", label: "Check-out" },
      { id: "login", label: "Login" },
      { id: "logout", label: "Logout" },
      { id: "breakSummary", label: "Break" },
      { id: "workedMinutes", label: "Worked" },
      { id: "startChat", label: "Start chat" },
      { id: "chatPause", label: "Chat pause" },
      { id: "chatMinutes", label: "Chat min" },
      { id: "meetingMinutes", label: "Meeting min" },
    ];
  }, [scope]);

  if (!access.scope) {
    return (
      <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Attendance
        </Typography>
        <Typography variant="body2" sx={teamAttendanceSubtextSx}>
          You do not have permission to view attendance.
        </Typography>
      </Box>
    );
  }

  const emptyCopy = SCOPE_EMPTY[scope];

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={[approvalLeaveHeaderWrapSx, teamAttendanceHeaderRowSx] as SxProps<Theme>}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Attendance
          </Typography>
          <Typography variant="body2" sx={[approvalLeaveSubtextSx, teamAttendanceSubtextSx] as SxProps<Theme>}>
            {SCOPE_SUBTEXT[scope]}
          </Typography>
        </Box>
      </Box>

      <TeamAttendanceTableCard
        scope={scope}
        onScopeChange={setScope}
        search={search}
        onSearchChange={setSearch}
        date={date}
        onDateChange={setDate}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        footerText={
          isLoading ? "Loading…" : `Showing data ${footerRangeStart} to ${footerRangeEnd} of ${total} entries`
        }
        isLoading={isLoading}
        rows={rows}
        columns={columns}
        canUseTeamMembers={access.canUseTeamMembers}
        canUsePoolHeads={access.canUsePoolHeads}
        canUseDepartmentHeads={access.canUseDepartmentHeads}
        emptyTitle={emptyCopy.title}
        emptySubtitle={emptyCopy.subtitle}
      />
    </Box>
  );
}
