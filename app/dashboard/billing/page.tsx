"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import FilterAltOutlined from "@mui/icons-material/FilterAltOutlined";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import BlurOnRounded from "@mui/icons-material/BlurOnRounded";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, DataTable, SelectField, TablePagination, Typography, dataTableActionButton } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { filterChromeButtonSx } from "@/components/common/FilterButton/filter-button.styles";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  billingCardHeaderSx,
  billingCardSx,
  billingFilterGridSx,
  billingFooterRowSx,
  billingHeaderActionsSx,
  billingHeaderSx,
  billingPaginationWrapSx,
  billingPageWrapper,
  billingStatusPaidSx,
  billingSubtextSx,
} from "./billing.styles";

type BillingRow = {
  id: string;
  invoiceId: string;
  billType: string;
  reseller: string;
  parentCompany: string;
  website: string;
  totalChats: string;
  amount: string;
  dueDate: string;
  status: "Paid";
};

const RESELLER_OPTIONS = [{ label: "TechDistributors", value: "tech-distributors" }];
const PARENT_OPTIONS = [{ label: "ABC Group", value: "abc-group" }];
const CHILD_OPTIONS = [{ label: "Native Group", value: "native-group" }];
const WEBSITE_OPTIONS = [{ label: "Native Group", value: "native-group" }];

const PAGE_SIZE = 10;
const DISPLAY_TOTAL_ENTRIES = 256_000;

const ROWS: BillingRow[] = Array.from({ length: 18 }, (_, i) => ({
  id: `bill-${i + 1}`,
  invoiceId: "INV-2024",
  billType: "Reseller",
  reseller: "Beta Retailers",
  parentCompany: "alphatech.com",
  website: "alphatech.com",
  totalChats: "1,250",
  amount: "$4,500.00",
  dueDate: "Oct 28, 2024",
  status: "Paid",
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

export default function BillingPage() {
  const theme = useTheme() as AppTheme;
  const [reseller, setReseller] = useState("tech-distributors");
  const [parentCompany, setParentCompany] = useState("abc-group");
  const [childCompany, setChildCompany] = useState("native-group");
  const [website, setWebsite] = useState("native-group");
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(ROWS.length / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return ROWS.slice(start, start + PAGE_SIZE);
  }, [page]);
  const rangeStart = paginatedRows.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = (page - 1) * PAGE_SIZE + paginatedRows.length;

  const columns = useMemo<DataTableColumn<BillingRow>[]>(
    () => [
      { id: "invoiceId", label: "Invoice ID" },
      { id: "billType", label: "Bill Type" },
      { id: "reseller", label: "Reseller" },
      { id: "parentCompany", label: "Parent Com." },
      { id: "website", label: "Website" },
      { id: "totalChats", label: "Total Ch.." },
      { id: "amount", label: "Amount" },
      { id: "dueDate", label: "Due Date" },
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
      <Box sx={billingHeaderSx}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Billing
          </Typography>
          <Typography variant="body2" sx={billingSubtextSx}>
            Generate and distribute licenses to client companies
          </Typography>
        </Box>
        <Box sx={billingHeaderActionsSx}>
          <Button type="button" variant="outlined" startIcon={<FilterAltOutlined sx={{ fontSize: 17 }} />} sx={filterChromeButtonSx}>
            Todays Detail
          </Button>
          <Button
            type="button"
            component={Link}
            href="/dashboard/billing/create-invoice"
            variant="primary"
            startIcon={<AddCircleOutline sx={{ fontSize: 17 }} />}
            sx={gradientPrimaryButtonSx}
          >
            Create Invoice
          </Button>
        </Box>
      </Box>

      <DashboardCard sx={billingCardSx}>
        <Box sx={billingCardHeaderSx}>
          <BlurOnRounded sx={{ fontSize: 19, color: theme.app.dashboard.white95 }} />
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Select Filter
          </Typography>
        </Box>
        <Box sx={billingFilterGridSx}>
          <SelectField label="Reseller" value={reseller} onChange={setReseller} options={RESELLER_OPTIONS} />
          <SelectField label="Parent Company" value={parentCompany} onChange={setParentCompany} options={PARENT_OPTIONS} />
          <SelectField label="Child Company" value={childCompany} onChange={setChildCompany} options={CHILD_OPTIONS} />
          <SelectField label="Website" value={website} onChange={setWebsite} options={WEBSITE_OPTIONS} />
          <Button type="button" variant="primary" sx={{ minWidth: 120, width: { xs: "100%", lg: "auto" } }}>
            Apply Filter
          </Button>
        </Box>
      </DashboardCard>

      <DashboardCard sx={billingCardSx}>
        <Box sx={billingCardHeaderSx}>
          <BlurOnRounded sx={{ fontSize: 19, color: theme.app.dashboard.white95 }} />
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Assigned Users (48)
          </Typography>
        </Box>

        <DataTable<BillingRow>
          columns={columns}
          rows={paginatedRows}
          getRowId={(row) => row.id}
          minWidth={1240}
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
