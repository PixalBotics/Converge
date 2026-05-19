"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import BlurOnRounded from "@mui/icons-material/BlurOnRounded";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, DataTable, TablePagination, Typography, dataTableActionButton } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import {
  billingCardHeaderSx,
  billingCardSx,
  billingFooterRowSx,
  billingPaginationWrapSx,
  billingPageWrapper,
  billingStatusPaidSx,
  billingSubtextSx,
} from "../billing/billing.styles";

type BillingDashboardRow = {
  id: string;
  parentCompany: string;
  childCompany: string;
  website: string;
  invoiceId: string;
  amount: string;
  status: "Approved";
};

const PAGE_SIZE = 10;
const DISPLAY_TOTAL_ENTRIES = 256_000;

const ROWS: BillingDashboardRow[] = Array.from({ length: 16 }, (_, i) => ({
  id: `billing-dashboard-${i + 1}`,
  parentCompany: "BrickVault Ltd",
  childCompany: "BrickVault Ltd",
  website: "ascwb123.com",
  invoiceId: "QAW123",
  amount: "$122,9383",
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

export default function BillingDashboardPage() {
  const theme = useTheme() as AppTheme;
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(ROWS.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return ROWS.slice(start, start + PAGE_SIZE);
  }, [page]);
  const rangeStart = paginatedRows.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = (page - 1) * PAGE_SIZE + paginatedRows.length;

  const columns = useMemo<DataTableColumn<BillingDashboardRow>[]>(
    () => [
      { id: "parentCompany", label: "Parent Company" },
      { id: "childCompany", label: "Child Company" },
      { id: "website", label: "Website" },
      { id: "invoiceId", label: "Invoice ID" },
      { id: "amount", label: "Amount" },
      {
        id: "status",
        label: "Status",
        render: (value) => (
          <Typography component="span" sx={billingStatusPaidSx}>
            {String(value)}
          </Typography>
        ),
      },
    ],
    [],
  );

  return (
    <Box sx={billingPageWrapper}>
      <Box>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Billing Dashboard
        </Typography>
        <Typography variant="body2" sx={billingSubtextSx}>
          Generate and distribute licenses to client companies
        </Typography>
      </Box>

      <DashboardCard sx={billingCardSx}>
        <Box sx={billingCardHeaderSx}>
          <BlurOnRounded sx={{ fontSize: 19, color: theme.app.dashboard.white95 }} />
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Billing Dashboard
          </Typography>
        </Box>

        <DataTable<BillingDashboardRow>
          columns={columns}
          rows={paginatedRows}
          getRowId={(row) => row.id}
          minWidth={1060}
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

        <Box sx={billingFooterRowSx}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            {`Showing data ${rangeStart} to ${rangeEnd} of ${formatCompactEntryTotal(DISPLAY_TOTAL_ENTRIES)} entries`}
          </Typography>
          <Box sx={billingPaginationWrapSx}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
}
