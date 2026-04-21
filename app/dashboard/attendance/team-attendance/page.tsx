"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { AccessTime as AccessTimeIcon } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import { Typography, DashboardCard, DataTable, TablePagination, Button, Calendar, SelectField } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { rolesCard, rolesFooterRow, rolesIconBox, rolesPageWrapper, rolesPaginationWrapper } from "../../roles/roles.styles";
import { footerMutedText, pageWrapper } from "../../companies/overview.styles";
import type { AppTheme } from "@/theme/theme";
import { useAttendanceUserQuery, useUsersListQuery } from "@/lib/hooks/query";
import { isRecord, unwrapApiData } from "@/lib/utils";
import { extractUsersRows } from "@/app/dashboard/user-page/utils";
import { EmptyAttendanceState } from "../components/EmptyAttendanceState";
import {
  teamAttendanceApplyButtonSx,
  teamAttendanceCardTitleSx,
  teamAttendanceDateRangeFieldSx,
  teamAttendanceFilterGridSx,
  teamAttendanceGenerateLicenseButtonSx,
  teamAttendanceHeaderActionsSx,
  teamAttendanceHeaderRowSx,
  teamAttendanceSendSelectedButtonSx,
  teamAttendanceStatusTextSx,
  teamAttendanceSubtextSx,
} from "./team-attendance.styles";

const PAGE_LIMIT = 16;

type TeamAttendanceRow = {
  id: string;
  employeeName: string;
  date: string;
  status: string;
  checkIn: string;
  checkOut: string;
};

export default function TeamAttendancePage() {
  const theme = useTheme() as AppTheme;
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const startOfMonth = useMemo(() => `${today.slice(0, 7)}-01`, [today]);
  const [from, setFrom] = useState(startOfMonth);
  const [to, setTo] = useState(today);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [page, setPage] = useState(1);

  const usersQuery = useUsersListQuery({ page: 1, limit: 200 }, { enabled: true });
  const userRows = useMemo(() => extractUsersRows(usersQuery.data), [usersQuery.data]);
  const userOptions = useMemo(() => {
    const base = userRows.map((u) => ({ value: u.id, label: `${u.user} · ${u.email}` }));
    return [{ value: "", label: usersQuery.isLoading ? "Loading users…" : "— Select user —" }, ...base];
  }, [userRows, usersQuery.isLoading]);

  const attendanceQuery = useAttendanceUserQuery(
    selectedUserId,
    { from, to, page, limit: PAGE_LIMIT },
    { enabled: Boolean(selectedUserId.trim() && from.trim() && to.trim()) },
  );

  const apiItems = useMemo(() => {
    const data = unwrapApiData(attendanceQuery.data);
    if (!data) return [];
    if (Array.isArray(data)) return data.filter(isRecord);
    if (!isRecord(data)) return [];
    const items = data["items"];
    return Array.isArray(items) ? items.filter(isRecord) : [];
  }, [attendanceQuery.data]);

  const total = useMemo(() => {
    const data = unwrapApiData(attendanceQuery.data);
    if (!isRecord(data)) return apiItems.length;
    const n = Number(data["total"]);
    return Number.isFinite(n) ? n : apiItems.length;
  }, [attendanceQuery.data, apiItems.length]);

  const totalPages = useMemo(() => {
    const data = unwrapApiData(attendanceQuery.data);
    if (!isRecord(data)) return 1;
    const n = Number(data["totalPages"]);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [attendanceQuery.data]);

  useEffect(() => {
    setPage(1);
  }, [selectedUserId, from, to]);

  useEffect(() => {
    setPage((p) => (p > totalPages ? totalPages : p));
  }, [totalPages]);

  const tableRows = useMemo<TeamAttendanceRow[]>(() => {
    const pick = (row: Record<string, unknown>, keys: string[]) => {
      for (const k of keys) {
        const v = row[k];
        if (typeof v === "string" && v.trim()) return v.trim();
      }
      return "";
    };
    const userLabel = userOptions.find((o) => o.value === selectedUserId)?.label ?? "—";
    return apiItems.map((row, idx) => ({
      id: pick(row, ["id", "attendanceId"]) || `team-${idx}`,
      employeeName: pick(row, ["employeeName", "userName", "name"]) || userLabel,
      date: pick(row, ["date", "day", "attendanceDate"]) || "—",
      status: pick(row, ["status"]) || "—",
      checkIn: pick(row, ["checkIn", "checkInTime", "inTime"]) || "—",
      checkOut: pick(row, ["checkOut", "checkOutTime", "outTime"]) || "—",
    }));
  }, [apiItems, selectedUserId, userOptions]);

  const footerRangeStart = tableRows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + tableRows.length;

  const columns = useMemo<DataTableColumn<TeamAttendanceRow>[]>(
    () => [
      { id: "employeeName", label: "Employee Name" },
      { id: "date", label: "Date" },
      {
        id: "status",
        label: "Status",
        render: (value) => <Box component="span" sx={teamAttendanceStatusTextSx}>{String(value)}</Box>,
      },
      { id: "checkIn", label: "Check-in" },
      { id: "checkOut", label: "Check-out" },
    ],
    [],
  );

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={teamAttendanceHeaderRowSx}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Team Attendance
          </Typography>
          <Typography variant="body2" sx={teamAttendanceSubtextSx}>
            Review attendance for a selected team member and date range.
          </Typography>
        </Box>
        <Box sx={teamAttendanceHeaderActionsSx} />
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={teamAttendanceCardTitleSx}>
          <Box sx={rolesIconBox}>
            <AccessTimeIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Select Filter
          </Typography>
        </Box>

        <Box sx={teamAttendanceFilterGridSx}>
          <SelectField
            label="User"
            value={selectedUserId}
            onChange={setSelectedUserId}
            options={userOptions}
            menuMaxRows={8}
          />
          <Box sx={teamAttendanceDateRangeFieldSx}>
            <Calendar label="From" value={from} onChange={setFrom} />
          </Box>
          <Box sx={teamAttendanceDateRangeFieldSx}>
            <Calendar label="To" value={to} onChange={setTo} />
          </Box>
          <Button variant="primary" sx={teamAttendanceApplyButtonSx}>
            Apply Filter
          </Button>
        </Box>
      </DashboardCard>

      <DashboardCard sx={rolesCard}>
        <Box sx={teamAttendanceCardTitleSx}>
          <Box sx={rolesIconBox}>
            <AccessTimeIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Attendance Records
          </Typography>
        </Box>

        {attendanceQuery.isLoading || attendanceQuery.isFetching ? (
          <DataTable<TeamAttendanceRow>
            columns={columns}
            rows={tableRows}
            getRowId={(row) => row.id}
            isLoading
            minWidth={860}
          />
        ) : !selectedUserId.trim() ? (
          <EmptyAttendanceState
            title="Select a user to view attendance"
            subtitle="Choose a user from the filter above, then apply the date range."
          />
        ) : tableRows.length === 0 ? (
          <EmptyAttendanceState />
        ) : (
          <DataTable<TeamAttendanceRow>
            columns={columns}
            rows={tableRows}
            getRowId={(row) => row.id}
            minWidth={860}
          />
        )}

        <Box sx={rolesFooterRow}>
          <Typography variant="medium" sx={footerMutedText(theme)}>
            {attendanceQuery.isLoading ? "Loading…" : `Showing data ${footerRangeStart} to ${footerRangeEnd} of ${total} entries`}
          </Typography>
          <Box sx={rolesPaginationWrapper}>
            <TablePagination page={page} pageCount={totalPages} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
}
