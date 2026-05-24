"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { AccessTime as AccessTimeIcon, CalendarMonth as CalendarMonthIcon } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Typography, DashboardCard, DataTable, TablePagination, Button, SearchBar, Calendar } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { rolesCard, rolesFooterRow, rolesIconBox, rolesPageWrapper, rolesPaginationWrapper } from "../../roles/roles.styles";
import { footerMutedText, pageWrapper } from "../../companies/overview.styles";
import { departmentsCardHeader, departmentsSearchFieldWrapper, departmentsSearchRow } from "../../website-assigning/website-assigning.styles";
import type { AppTheme } from "@/theme/theme";
import { useTheme } from "@mui/material/styles";
import { useAttendanceMeQuery } from "@/lib/hooks/query";
import { publishAppToast } from "@/lib/notify";
import { isRecord, unwrapApiData } from "@/lib/utils/core";
import { formatAttendanceStatus, formatBreakSummary } from "@/lib/utils/hrms/attendance-display";
import { EmptyAttendanceState } from "../components/EmptyAttendanceState";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions";
import {
  attendanceCardTitleSx,
  attendanceDateButtonSx,
  attendanceHeaderActionsSx,
  attendanceHeaderRowSx,
  attendanceMarkButtonSx,
  attendanceStatusTextSx,
  attendanceSubtextSx,
} from "./my-attendance.styles";

const PAGE_LIMIT = 16;

type AttendanceRow = {
  id: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  status: string;
  breakSummary: string;
  workedMinutes: string;
};

function formatDateOnly(value: string): string {
  const raw = value.trim();
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function formatTimeOnly(value: string): string {
  const raw = value.trim();
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
}

export default function MyAttendancePage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canViewSelfAttendance =
    hasOperational(OP.hrms.attendance.selfView) ||
    hasOperational(OP.hrms.attendance.self) ||
    hasOperational(OP.hrms.attendance.view);
  const canMarkAttendance =
    hasOperational(OP.hrms.attendance.checkIn) ||
    hasOperational(OP.hrms.attendance.checkOut) ||
    hasOperational(OP.hrms.attendance.breakIn) ||
    hasOperational(OP.hrms.attendance.breakOut) ||
    hasOperational(OP.hrms.attendance.self);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const startOfMonth = useMemo(() => `${today.slice(0, 7)}-01`, [today]);
  const [from, setFrom] = useState(startOfMonth);
  const [to, setTo] = useState(today);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const attendanceQuery = useAttendanceMeQuery(
    { from, to, page, limit: PAGE_LIMIT },
    { enabled: Boolean(from.trim() && to.trim()) },
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

  const toBaseRows = useMemo(() => {
    return apiItems.map((row, idx) => {
      const pick = (keys: string[]) => {
        for (const k of keys) {
          const v = row[k];
          if (typeof v === "string" && v.trim()) return v.trim();
        }
        return "";
      };
      const pickNum = (keys: string[]) => {
        for (const k of keys) {
          const v = row[k];
          if (typeof v === "number" && Number.isFinite(v)) return v;
        }
        return null;
      };
      const taken = pickNum(["breakMinutesTaken"]);
      const allowed = pickNum(["breakMinutesAllowed"]);
      const over = pickNum(["overBreakMinutes"]);
      const worked = pickNum(["workedMinutes"]);
      const rawStatus = pick(["status"]);
      return {
        id: pick(["id", "attendanceId"]) || `attendance-${idx}`,
        date: formatDateOnly(pick(["date", "day", "attendanceDate"])),
        checkInTime: formatTimeOnly(pick(["checkInAt", "checkIn", "checkInTime", "inTime"])),
        checkOutTime: formatTimeOnly(pick(["checkOutAt", "checkOut", "checkOutTime", "outTime"])),
        status: rawStatus ? formatAttendanceStatus(rawStatus) : "—",
        breakSummary: formatBreakSummary(taken, allowed, over),
        workedMinutes: worked != null ? `${worked} min` : "—",
      } as AttendanceRow;
    });
  }, [apiItems]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = toBaseRows;
    if (!q) return base;
    return base.filter(
      (r) =>
        r.date.toLowerCase().includes(q) ||
        r.checkInTime.toLowerCase().includes(q) ||
        r.checkOutTime.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        r.breakSummary.toLowerCase().includes(q) ||
        r.workedMinutes.toLowerCase().includes(q),
    );
  }, [search, toBaseRows]);

  useEffect(() => {
    setPage(1);
  }, [search, from, to]);

  useEffect(() => {
    setPage((p) => (p > totalPages ? totalPages : p));
  }, [totalPages]);

  const tableRows = useMemo(() => {
    // API already paginates; filtering is local within current page.
    return filteredRows;
  }, [filteredRows]);

  const footerRangeStart = tableRows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + tableRows.length;

  const columns = useMemo<DataTableColumn<AttendanceRow>[]>(
    () => [
      { id: "date", label: "Date" },
      { id: "checkInTime", label: "Check-in Time" },
      { id: "checkOutTime", label: "Check-out Time" },
      {
        id: "status",
        label: "Status",
        render: (value) => <Box component="span" sx={attendanceStatusTextSx}>{String(value)}</Box>,
      },
      { id: "breakSummary", label: "Break" },
      { id: "workedMinutes", label: "Worked" },
    ],
    [],
  );

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={attendanceHeaderRowSx}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            My Attendance
          </Typography>
          <Typography variant="body2" sx={attendanceSubtextSx}>
            View your attendance history for the selected date range.
          </Typography>
        </Box>
        <Box sx={attendanceHeaderActionsSx}>
          <Button
            variant="secondary"
            startIcon={<CalendarMonthIcon fontSize="small" />}
            sx={attendanceDateButtonSx}
            onClick={() => {
              setFrom(startOfMonth);
              setTo(today);
            }}
          >
            {from} → {to}
          </Button>
          {canMarkAttendance ? (
            <Button
              variant="primary"
              sx={attendanceMarkButtonSx}
              onClick={() => router.push("/dashboard/attendance/mark-attendance")}
            >
              Mark Attendance
            </Button>
          ) : null}
        </Box>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={departmentsCardHeader}>
          <Box sx={attendanceCardTitleSx}>
            <Box sx={rolesIconBox}>
              <AccessTimeIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
            </Box>
            <Typography variant="mediumLarge" fontWeight={600} color="white">
              Select Filter
            </Typography>
          </Box>
          <Box />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr) 180px" },
            gap: 1.5,
            alignItems: "end",
          }}
        >
          <Calendar label="From" value={from} onChange={setFrom} />
          <Calendar label="To" value={to} onChange={setTo} />
          <Button
            variant="primary"
            sx={attendanceMarkButtonSx}
            onClick={() => publishAppToast({ variant: "success", message: "Filter applied." })}
          >
            Apply Filter
          </Button>
        </Box>
      </DashboardCard>

      <DashboardCard sx={rolesCard}>
        <Box sx={departmentsCardHeader}>
          <Box sx={attendanceCardTitleSx}>
            <Box sx={rolesIconBox}>
              <AccessTimeIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
            </Box>
            <Typography variant="mediumLarge" fontWeight={600} color="white">
              Attendance Records
            </Typography>
          </Box>

          <Box sx={departmentsSearchRow}>
            <Box sx={departmentsSearchFieldWrapper}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search anything.." />
            </Box>
          </Box>
        </Box>

        {!canViewSelfAttendance ? (
          <Typography variant="body2" sx={{ px: 2, py: 3, color: theme.app.dashboard.textMuted, lineHeight: 1.6 }}>
            You do not have permission to view self attendance. This area expects operational permissions such as{" "}
            <Box component="span" sx={{ color: "white", fontWeight: 600 }}>
              {OP.hrms.attendance.selfView}
            </Box>{" "}
            or{" "}
            <Box component="span" sx={{ color: "white", fontWeight: 600 }}>
              {OP.hrms.attendance.self}
            </Box>
            .
          </Typography>
        ) : attendanceQuery.isLoading || attendanceQuery.isFetching ? (
          <DataTable<AttendanceRow>
            columns={columns}
            rows={tableRows}
            getRowId={(row) => row.id}
            isLoading
            minWidth={960}
          />
        ) : tableRows.length === 0 ? (
          <EmptyAttendanceState />
        ) : (
          <DataTable<AttendanceRow>
            columns={columns}
            rows={tableRows}
            getRowId={(row) => row.id}
            minWidth={960}
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
