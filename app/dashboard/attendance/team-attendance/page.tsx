"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { AccessTime as AccessTimeIcon } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import { Typography, DashboardCard, DataTable, TablePagination, Button, InputField, SelectField } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { rolesCard, rolesFooterRow, rolesIconBox, rolesPageWrapper, rolesPaginationWrapper } from "../../roles/roles.styles";
import { footerMutedText, pageWrapper } from "../../companies/overview.styles";
import type { AppTheme } from "@/theme/theme";
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
const DISPLAY_TOTAL_ENTRIES = 256_000;

type TeamAttendanceRow = {
  id: string;
  employeeName: string;
  date: string;
  status: string;
  checkIn: string;
  checkOut: string;
};

const DEPARTMENT_OPTIONS = [
  { label: "Department", value: "" },
  { label: "Operations", value: "operations" },
  { label: "Support", value: "support" },
  { label: "Sales", value: "sales" },
];

const MOCK_TEAM_ATTENDANCE_ROWS: TeamAttendanceRow[] = Array.from({ length: 32 }, (_, i) => ({
  id: `team-attendance-${i + 1}`,
  employeeName: "Raja Saif UI UX",
  date: "12 Jun Wednesday",
  status: "Approved",
  checkIn: "08:52 AM",
  checkOut: "06:15 PM",
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

export default function TeamAttendancePage() {
  const theme = useTheme() as AppTheme;
  const [department, setDepartment] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    if (!department && !dateRange.trim()) return MOCK_TEAM_ATTENDANCE_ROWS;
    return MOCK_TEAM_ATTENDANCE_ROWS.filter((row) => {
      const byDepartment = !department || row.employeeName.toLowerCase().includes(department.toLowerCase());
      const byDate = !dateRange.trim() || row.date.toLowerCase().includes(dateRange.trim().toLowerCase());
      return byDepartment && byDate;
    });
  }, [department, dateRange]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_LIMIT));

  useEffect(() => {
    setPage(1);
  }, [department, dateRange]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const tableRows = useMemo(() => {
    const start = (page - 1) * PAGE_LIMIT;
    return filteredRows.slice(start, start + PAGE_LIMIT);
  }, [filteredRows, page]);

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
            Generate and distribute licenses to client companies
          </Typography>
        </Box>
        <Box sx={teamAttendanceHeaderActionsSx}>
          <Button variant="secondary" sx={teamAttendanceSendSelectedButtonSx}>
            Send Selected
          </Button>
          <Button variant="secondary" sx={teamAttendanceGenerateLicenseButtonSx}>
            Generate License
          </Button>
        </Box>
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
            label="Department"
            value={department}
            onChange={setDepartment}
            options={DEPARTMENT_OPTIONS}
          />
          <InputField
            label="Date Range"
            placeholder="Add Date..."
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            sx={teamAttendanceDateRangeFieldSx}
          />
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
            Departments List
          </Typography>
        </Box>

        <DataTable<TeamAttendanceRow>
          columns={columns}
          rows={tableRows}
          getRowId={(row) => row.id}
          minWidth={860}
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
