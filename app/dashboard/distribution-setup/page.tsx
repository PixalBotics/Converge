"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Add from "@mui/icons-material/Add";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  FilterButton,
  SearchBar,
  TablePagination,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  distributionSetupCardTitleRow,
  distributionSetupCardToolbar,
  distributionSetupFooterRow,
  distributionSetupHeaderActions,
  distributionSetupMainCardSx,
  distributionSetupPageHeader,
  distributionSetupPageWrapper,
  distributionSetupPaginationWrapper,
  distributionSetupSearchFieldWrapper,
  distributionSetupSearchRow,
  distributionSetupSectionIconBox,
} from "./distribution-setup.styles";

interface DistributionRow extends Record<string, unknown> {
  id: string;
  clientOf: string;
  parentCompany: string;
  childCompany: string;
  website: string;
  disMethod: string;
  department: string;
}

const TOTAL_ENTRIES = 25_600;
const PAGE_COUNT = 2;
const ROW_COUNT = 8;

/** Matches footer copy e.g. "25.6K entries". */
function formatEntriesK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

const TABLE_ROWS: DistributionRow[] = Array.from({ length: ROW_COUNT }, (_, i) => ({
  id: String(i + 1),
  clientOf: "Raja Saif",
  parentCompany: "Global Industries",
  childCompany: "Acme Tech",
  website: "actech.com",
  disMethod: "Email",
  department: "Sales",
}));

export default function DistributionSetupPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return TABLE_ROWS;
    return TABLE_ROWS.filter((row) =>
      [
        row.clientOf,
        row.parentCompany,
        row.childCompany,
        row.website,
        row.disMethod,
        row.department,
      ].some((field) => field.toLowerCase().includes(q))
    );
  }, [search]);

  const columns = useMemo<DataTableColumn<DistributionRow>[]>(
    () => [
      { id: "clientOf", label: "Client Of" },
      { id: "parentCompany", label: "Parent Company" },
      { id: "childCompany", label: "Child Company" },
      { id: "website", label: "Website", cellVariant: "muted" },
      { id: "disMethod", label: "Dis. Method" },
      { id: "department", label: "Department" },
      {
        id: "status",
        label: "Status",
        render: () => (
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.25,
              py: 0.5,
              borderRadius: "9999px",
              bgcolor: alpha(theme.palette.success.main, theme.palette.mode === "light" ? 0.16 : 0.12),
              border: `1px solid ${alpha(theme.palette.success.main, theme.palette.mode === "light" ? 0.3 : 0.28)}`,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: theme.app.dashboard.accentGreen,
                flexShrink: 0,
              }}
            />
            <Typography
              component="span"
              variant="body2"
              sx={{
                color: theme.palette.mode === "light" ? "#166534" : theme.palette.success.light,
                fontWeight: 600,
                fontSize: "0.8125rem",
              }}
            >
              Active
            </Typography>
          </Box>
        ),
      },
    ],
    [theme]
  );

  return (
    <Box sx={distributionSetupPageWrapper}>
      <Box sx={distributionSetupPageHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
            Distribution Setup
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 560 }}>
            Connect your Meta Business assets to streamline your workflow and data sync.
          </Typography>
        </Box>
        <Box sx={distributionSetupHeaderActions}>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            startIcon={<Add sx={{ fontSize: 20 }} />}
            onClick={() => router.push("/dashboard/distribution-setup/configure")}
          >
            Add Distribution Setup
          </Button>
        </Box>
      </Box>

      <DashboardCard sx={distributionSetupMainCardSx}>
        <Box sx={distributionSetupCardToolbar}>
          <Box sx={distributionSetupCardTitleRow}>
            <Box sx={distributionSetupSectionIconBox} aria-hidden>
              <Typography
                sx={{
                  color: theme.app.dashboard.white95,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  lineHeight: 1,
                }}
              >
                $
              </Typography>
            </Box>
            <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ textAlign: "left" }}>
              All Distribution Setup
            </Typography>
          </Box>
          <Box sx={distributionSetupSearchRow}>
            <Box sx={distributionSetupSearchFieldWrapper}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search anything.." sx={{ minWidth: "100%" }} />
            </Box>
            <FilterButton sx={{ whiteSpace: "nowrap", alignSelf: { xs: "stretch", sm: "center" } }} />
          </Box>
        </Box>

        <DataTable<DistributionRow>
          columns={columns}
          rows={filteredRows}
          getRowId={(row) => row.id}
          minWidth={1100}
          size="medium"
          actionColumn={{
            label: "Actions",
            render: () => (
              <IconButton
                type="button"
                size="small"
                aria-label="Row actions"
                sx={{ color: theme.app.dashboard.iconMuted, "&:hover": { color: theme.app.text.primary } }}
              >
                <MoreHoriz fontSize="small" />
              </IconButton>
            ),
          }}
        />

        <Box sx={distributionSetupFooterRow}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            Showing data 1 to {filteredRows.length} of {formatEntriesK(TOTAL_ENTRIES)} entries
          </Typography>
          <Box sx={distributionSetupPaginationWrapper}>
            <TablePagination page={page} pageCount={PAGE_COUNT} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
}
