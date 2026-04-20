"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { AccessTime as AccessTimeIcon, CalendarMonth as CalendarMonthIcon } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Typography, DashboardCard, DataTable, TablePagination, Button, SearchBar, FilterButton } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { rolesCard, rolesFooterRow, rolesIconBox, rolesPageWrapper, rolesPaginationWrapper } from "../../roles/roles.styles";
import { footerMutedText, pageWrapper } from "../../companies/overview.styles";
import { departmentsCardHeader, departmentsSearchFieldWrapper, departmentsSearchRow } from "../../website-assigning/website-assigning.styles";
import type { AppTheme } from "@/theme/theme";
import { useTheme } from "@mui/material/styles";
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
const DISPLAY_TOTAL_ENTRIES = 256_000;

type AttendanceRow = {
  id: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  status: string;
};

const MOCK_ATTENDANCE_ROWS: AttendanceRow[] = Array.from({ length: 32 }, (_, i) => ({
  id: `attendance-${i + 1}`,
  date: "12 Jun Wednesday",
  checkInTime: "08:52 AM",
  checkOutTime: "06:15 PM",
  status: "Present",
}));

function formatCompactEntryTotal(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m % 1 === 0 ? m : m.toFixed(1)}M`;
  }
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k : k.toFixed(0)}K`;
  }
  return String(n);
}

export default function MyAttendancePage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MOCK_ATTENDANCE_ROWS;
    return MOCK_ATTENDANCE_ROWS.filter(
      (r) =>
        r.date.toLowerCase().includes(q) ||
        r.checkInTime.toLowerCase().includes(q) ||
        r.checkOutTime.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q),
    );
  }, [search]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_LIMIT));

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const tableRows = useMemo(() => {
    const start = (page - 1) * PAGE_LIMIT;
    return filteredRows.slice(start, start + PAGE_LIMIT);
  }, [filteredRows, page]);

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
            Generate and distribute licenses to client companies
          </Typography>
        </Box>
        <Box sx={attendanceHeaderActionsSx}>
          <Button variant="secondary" startIcon={<CalendarMonthIcon fontSize="small" />} sx={attendanceDateButtonSx}>
            1 Jun - 30 Jun, 2025
          </Button>
          <Button
            variant="primary"
            sx={attendanceMarkButtonSx}
            onClick={() => router.push("/dashboard/attendance/mark-attendance")}
          >
            Mark Attendance
          </Button>
        </Box>
      </Box>

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
            <FilterButton />
          </Box>
        </Box>

        <DataTable<AttendanceRow>
          columns={columns}
          rows={tableRows}
          getRowId={(row) => row.id}
          minWidth={780}
        />

        <Box sx={rolesFooterRow}>
          <Typography variant="medium" sx={footerMutedText(theme)}>
            {`Showing data ${footerRangeStart} to ${footerRangeEnd} of ${formatCompactEntryTotal(DISPLAY_TOTAL_ENTRIES)} entries`}
          </Typography>
          <Box sx={rolesPaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
}
