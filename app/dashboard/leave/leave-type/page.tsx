"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Typography,
  DashboardCard,
  DataTable,
  dataTableActionButton,
  TablePagination,
  Button,
  InputField,
  SelectField,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesCard, rolesFooterRow, rolesIconBox, rolesPageWrapper, rolesPaginationWrapper } from "../../roles/roles.styles";
import { footerMutedText, pageWrapper } from "../../companies/overview.styles";
import { publishAppToast } from "@/lib/notify";
import {
  leaveTypeActionsSx,
  leaveTypeCardHeaderSx,
  leaveTypeFormGridSx,
  leaveTypeHeaderWrapSx,
  leaveTypeIconSx,
  leaveTypeSubtextSx,
} from "./leave-type.styles";

const PAGE_LIMIT = 10;
const DISPLAY_TOTAL_ENTRIES = 256_000;

type LeaveTypeRow = {
  id: string;
  leaveTypeName: string;
  daysAllowed: string;
};

const TOTAL_DAYS_OPTIONS = [
  { label: "Assign Department Head", value: "" },
  { label: "7 Days", value: "7" },
  { label: "15 Days", value: "15" },
  { label: "23 Days", value: "23" },
];

const MOCK_LEAVE_ROWS: LeaveTypeRow[] = Array.from({ length: 20 }, (_, i) => ({
  id: `leave-type-${i + 1}`,
  leaveTypeName: "Medical Emergency",
  daysAllowed: "23 Days",
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

export default function LeaveTypePage() {
  const theme = useTheme() as AppTheme;
  const [leaveName, setLeaveName] = useState("");
  const [totalDays, setTotalDays] = useState("");
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(MOCK_LEAVE_ROWS.length / PAGE_LIMIT));

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const tableRows = useMemo(() => {
    const start = (page - 1) * PAGE_LIMIT;
    return MOCK_LEAVE_ROWS.slice(start, start + PAGE_LIMIT);
  }, [page]);

  const footerRangeStart = tableRows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + tableRows.length;

  const columns = useMemo<DataTableColumn<LeaveTypeRow>[]>(
    () => [
      { id: "leaveTypeName", label: "Leave Type Name" },
      { id: "daysAllowed", label: "Days Allowed" },
    ],
    [],
  );

  const handleCancel = () => {
    setLeaveName("");
    setTotalDays("");
  };

  const handleSave = () => {
    if (!leaveName.trim()) {
      publishAppToast({ variant: "error", message: "Please enter leave name." });
      return;
    }
    if (!totalDays) {
      publishAppToast({ variant: "error", message: "Please select total days." });
      return;
    }
    publishAppToast({ variant: "success", message: "Leave type saved successfully." });
    handleCancel();
  };

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={leaveTypeHeaderWrapSx}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Leave Types
        </Typography>
        <Typography variant="body2" sx={leaveTypeSubtextSx}>
          Generate and distribute licenses to client companies
        </Typography>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={leaveTypeCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <AttachMoneyIcon sx={leaveTypeIconSx} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Leave Type
          </Typography>
        </Box>

        <Box sx={leaveTypeFormGridSx}>
          <InputField
            label="Leave Name"
            placeholder="Food"
            value={leaveName}
            onChange={(e) => setLeaveName(e.target.value)}
          />
          <SelectField
            label="Total Days"
            value={totalDays}
            onChange={setTotalDays}
            options={TOTAL_DAYS_OPTIONS}
          />
        </Box>

        <Box sx={leaveTypeActionsSx}>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" sx={gradientPrimaryButtonSx} onClick={handleSave}>
            Leave Type
          </Button>
        </Box>
      </DashboardCard>

      <DashboardCard sx={rolesCard}>
        <Box sx={leaveTypeCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <AttachMoneyIcon sx={leaveTypeIconSx} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Leave Type
          </Typography>
        </Box>

        <DataTable<LeaveTypeRow>
          columns={columns}
          rows={tableRows}
          getRowId={(row) => row.id}
          minWidth={700}
          actionColumn={{
            label: "Action",
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
