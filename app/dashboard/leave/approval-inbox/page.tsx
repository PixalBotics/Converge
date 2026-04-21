"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import FilterList from "@mui/icons-material/FilterList";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Typography,
  DashboardCard,
  DataTable,
  dataTableActionButton,
  TablePagination,
  SearchBar,
  Button,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { rolesCard, rolesFooterRow, rolesPageWrapper, rolesPaginationWrapper } from "../../roles/roles.styles";
import { footerMutedText, pageWrapper } from "../../companies/overview.styles";
import {
  approvalLeaveCardHeaderSx,
  approvalLeaveHeaderWrapSx,
  approvalLeaveIconSx,
  approvalLeaveSearchWrapSx,
  approvalLeaveStatusSx,
  approvalLeaveSubtextSx,
  approvalLeaveTitleRowSx,
  approvalLeaveToolbarSx,
} from "./approval-leave.styles";

const PAGE_LIMIT = 8;
const DISPLAY_TOTAL_ENTRIES = 256_000;

type ApprovalLeaveRow = {
  id: string;
  leaveType: string;
  date: string;
  status: "Approved";
};

const MOCK_ROWS: ApprovalLeaveRow[] = Array.from({ length: 16 }, (_, i) => ({
  id: `approval-leave-${i + 1}`,
  leaveType: "Medical Leave",
  date: "08:52 AM",
  status: "Approved",
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

export default function ApprovalLeavePage() {
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MOCK_ROWS;
    return MOCK_ROWS.filter(
      (row) => row.leaveType.toLowerCase().includes(q) || row.date.toLowerCase().includes(q) || row.status.toLowerCase().includes(q),
    );
  }, [search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_LIMIT));

  useEffect(() => {
    setPage((prev) => (prev > pageCount ? pageCount : prev));
  }, [pageCount]);

  const tableRows = useMemo(() => {
    const start = (page - 1) * PAGE_LIMIT;
    return filtered.slice(start, start + PAGE_LIMIT);
  }, [filtered, page]);

  const footerRangeStart = tableRows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + tableRows.length;

  const columns = useMemo<DataTableColumn<ApprovalLeaveRow>[]>(
    () => [
      { id: "leaveType", label: "Leave Type" },
      { id: "date", label: "Dates" },
      {
        id: "status",
        label: "Status",
        render: (value) => (
          <Typography component="span" sx={approvalLeaveStatusSx(theme)}>
            {String(value)}
          </Typography>
        ),
      },
    ],
    [theme],
  );

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={approvalLeaveHeaderWrapSx}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Approval Inbox (Manager / Pool Head)
        </Typography>
        <Typography variant="body2" sx={approvalLeaveSubtextSx}>
          Generate and distribute licenses to client companies
        </Typography>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={approvalLeaveCardHeaderSx}>
          <Box sx={approvalLeaveTitleRowSx}>
            <Box sx={approvalLeaveIconSx}>
              <AccessTimeRounded sx={{ fontSize: 14 }} />
            </Box>
            <Typography variant="mediumLarge" fontWeight={600} color="white">
              My Leave
            </Typography>
          </Box>

          <Box sx={approvalLeaveToolbarSx}>
            <Box sx={approvalLeaveSearchWrapSx}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search anything..." sx={{ width: "100%" }} />
            </Box>
            <Button type="button" variant="secondary" startIcon={<FilterList sx={{ fontSize: 17 }} />} sx={{ minWidth: 96 }}>
              Filter
            </Button>
          </Box>
        </Box>

        <DataTable<ApprovalLeaveRow>
          columns={columns}
          rows={tableRows}
          getRowId={(row) => row.id}
          minWidth={720}
          actionColumn={{
            label: "Actions",
            render: () => (
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <IconButton size="small" sx={dataTableActionButton}>
                  <MoreHoriz fontSize="small" />
                </IconButton>
              </Box>
            ),
          }}
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
