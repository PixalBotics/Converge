"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import BlurOnRounded from "@mui/icons-material/BlurOnRounded";
import AddIcCallRounded from "@mui/icons-material/AddIcCallRounded";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, DataTable, SelectField, TablePagination, Typography, dataTableActionButton } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { pageWrapper, footerMutedText } from "../companies/overview.styles";
import { rolesCard, rolesFooterRow, rolesIconBox, rolesPageWrapper, rolesPaginationWrapper } from "../roles/roles.styles";
import {
  phoneNumberSetupAddButtonSx,
  phoneNumberSetupCardHeaderSx,
  phoneNumberSetupFilterGridSx,
  phoneNumberSetupHeaderSx,
  phoneNumberSetupStatusApprovedSx,
  phoneNumberSetupSubtextSx,
} from "./phone-number-setup.styles";

type PhoneNumberSetupRow = {
  id: string;
  phoneNumber: string;
  assignedTo: string;
  resellerName: string;
  parentCompany: string;
  childCompany: string;
  status: "Approved";
};

const RESELLER_OPTIONS = [
  { label: "TechDistributors", value: "tech-distributors" },
  { label: "Alpha Reseller", value: "alpha-reseller" },
];
const PARENT_OPTIONS = [
  { label: "ABC Group", value: "abc-group" },
  { label: "Vertex Group", value: "vertex-group" },
];
const CHILD_OPTIONS = [
  { label: "Native Group", value: "native-group" },
  { label: "Matrix Group", value: "matrix-group" },
];

const PAGE_SIZE = 10;
const DISPLAY_TOTAL_ENTRIES = 256_000;

const ROWS: PhoneNumberSetupRow[] = Array.from({ length: 18 }, (_, i) => ({
  id: `pn-${i + 1}`,
  phoneNumber: "IV-2024",
  assignedTo: "Raja Saif",
  resellerName: "Jhon Wick",
  parentCompany: "Netflix",
  childCompany: "Amazon",
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

export default function PhoneNumberSetupPage() {
  const theme = useTheme() as AppTheme;
  const [reseller, setReseller] = useState("tech-distributors");
  const [parentCompany, setParentCompany] = useState("abc-group");
  const [childCompany, setChildCompany] = useState("native-group");
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(ROWS.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return ROWS.slice(start, start + PAGE_SIZE);
  }, [page]);

  const rangeStart = paginatedRows.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = (page - 1) * PAGE_SIZE + paginatedRows.length;

  const columns = useMemo<DataTableColumn<PhoneNumberSetupRow>[]>(
    () => [
      { id: "phoneNumber", label: "Phone Number" },
      { id: "assignedTo", label: "Assigned To" },
      { id: "resellerName", label: "Reseller Name" },
      { id: "parentCompany", label: "Parent Company" },
      { id: "childCompany", label: "Child Company" },
      {
        id: "status",
        label: "Status",
        render: (value) => (
          <Typography component="span" sx={phoneNumberSetupStatusApprovedSx}>
            {String(value)}
          </Typography>
        ),
      },
    ],
    [],
  );

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={phoneNumberSetupHeaderSx}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Phone Number Setup (Main Page)
          </Typography>
          <Typography variant="body2" sx={phoneNumberSetupSubtextSx}>
            Generate and distribute licenses to client companies
          </Typography>
        </Box>
        <Button
          type="button"
          component={Link}
          href="/dashboard/phone-number-setup/add"
          variant="primary"
          startIcon={<AddIcCallRounded sx={{ fontSize: 17 }} />}
          sx={{ ...phoneNumberSetupAddButtonSx, ...(gradientPrimaryButtonSx as object) }}
        >
          Add Phone Number
        </Button>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={phoneNumberSetupCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <BlurOnRounded sx={{ fontSize: 18, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Select Filter
          </Typography>
        </Box>
        <Box sx={phoneNumberSetupFilterGridSx}>
          <SelectField label="Reseller (Dropdown)" value={reseller} onChange={setReseller} options={RESELLER_OPTIONS} />
          <SelectField label="Parent Company" value={parentCompany} onChange={setParentCompany} options={PARENT_OPTIONS} />
          <SelectField label="Child Company" value={childCompany} onChange={setChildCompany} options={CHILD_OPTIONS} />
          <Button
            type="button"
            variant="primary"
            sx={{ minWidth: 126, width: { xs: "100%", lg: "auto" }, ...(gradientPrimaryButtonSx as object) }}
          >
            Apply Filter
          </Button>
        </Box>
      </DashboardCard>

      <DashboardCard sx={rolesCard}>
        <Box sx={phoneNumberSetupCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <BlurOnRounded sx={{ fontSize: 18, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Phone Number Setup
          </Typography>
        </Box>

        <DataTable<PhoneNumberSetupRow>
          columns={columns}
          rows={paginatedRows}
          getRowId={(row) => row.id}
          minWidth={1100}
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
            {`Showing data ${rangeStart} to ${rangeEnd} of ${formatCompactEntryTotal(DISPLAY_TOTAL_ENTRIES)} entries`}
          </Typography>
          <Box sx={rolesPaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
}
