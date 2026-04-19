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
  SearchBar,
  FilterButton,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  rolesCard,
  rolesFooterRow,
  rolesIconBox,
  rolesPageWrapper,
  rolesPaginationWrapper,
} from "../roles/roles.styles";
import { footerMutedText, pageWrapper } from "../companies/overview.styles";
import {
  departmentsCardHeader,
  departmentsSearchRow,
  departmentsSearchFieldWrapper,
} from "../website-assigning/website-assigning.styles";
import { publishAppToast } from "@/lib/notify";

const PAGE_LIMIT = 8;
const DISPLAY_TOTAL_ENTRIES = 256_000;

export type PoolRow = {
  id: string;
  poolName: string;
  poolHead: string;
  totalMembers: string;
};

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

const MOCK_POOL_ROWS: PoolRow[] = Array.from({ length: 16 }, (_, i) => ({
  id: `pool-${i + 1}`,
  poolName: "BrickVault Ltd.com",
  poolHead: "Raja Saif UI UX",
  totalMembers: "1224353535",
}));

const POOL_HEAD_SELECT_OPTIONS = [
  { label: "Assign Department Head", value: "" },
  { label: "Raja Saif UI UX", value: "raja" },
  { label: "Engineering Lead", value: "eng" },
  { label: "Operations", value: "ops" },
];

export default function PoolsPage() {
  const theme = useTheme() as AppTheme;
  const [poolNameField, setPoolNameField] = useState("");
  const [poolHeadId, setPoolHeadId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MOCK_POOL_ROWS;
    return MOCK_POOL_ROWS.filter(
      (r) =>
        r.poolName.toLowerCase().includes(q) ||
        r.poolHead.toLowerCase().includes(q) ||
        r.totalMembers.includes(q),
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

  const columns = useMemo<DataTableColumn<PoolRow>[]>(
    () => [
      { id: "poolName", label: "Pool Name" },
      { id: "poolHead", label: "Pool Head" },
      { id: "totalMembers", label: "Total Members" },
    ],
    [],
  );

  const resetForm = () => {
    setPoolNameField("");
    setPoolHeadId("");
  };

  const handleCancelForm = () => {
    resetForm();
  };

  const handleSavePool = () => {
    const name = poolNameField.trim();
    if (!name) {
      publishAppToast({ variant: "error", message: "Please enter a pool name." });
      return;
    }
    if (!poolHeadId.trim()) {
      publishAppToast({ variant: "error", message: "Please assign a pool head." });
      return;
    }
    publishAppToast({ variant: "success", message: `Pool “${name}” saved.` });
    resetForm();
  };

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={{ mb: 0.5 }}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Pools
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.75, color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
          Generate and distribute licenses to client companies
        </Typography>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
          <Box sx={rolesIconBox}>
            <AttachMoneyIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Add New Designation
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
            mb: 2.5,
          }}
        >
          <InputField
            label="Pool Name"
            placeholder="Food"
            value={poolNameField}
            onChange={(e) => setPoolNameField(e.target.value)}
          />
          <SelectField
            label="Assign Pool Head"
            value={poolHeadId}
            onChange={setPoolHeadId}
            options={POOL_HEAD_SELECT_OPTIONS}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={handleCancelForm}>
            Cancel
          </Button>
          <Button variant="primary" sx={gradientPrimaryButtonSx} onClick={handleSavePool}>
            Save Pool
          </Button>
        </Box>
      </DashboardCard>

      <DashboardCard sx={rolesCard}>
        <Box sx={departmentsCardHeader}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={rolesIconBox}>
              <AttachMoneyIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
            </Box>
            <Typography variant="mediumLarge" fontWeight={600} color="white">
              Designations
            </Typography>
          </Box>

          <Box sx={departmentsSearchRow}>
            <Box sx={departmentsSearchFieldWrapper}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search anything.." />
            </Box>
            <FilterButton />
          </Box>
        </Box>

        <DataTable<PoolRow>
          columns={columns}
          rows={tableRows}
          getRowId={(row) => row.id}
          minWidth={640}
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
