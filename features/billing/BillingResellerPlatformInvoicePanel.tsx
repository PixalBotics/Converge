"use client";

import { useMemo } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, DataTable, Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import type { InvoiceView } from "@/api/billing/invoice.api";
import {
  invoiceTableAmount,
} from "@/lib/billing/invoice-table-display";
import { useCheckoutInvoiceMutation, useInvoicesQuery } from "@/lib/hooks/query/billing/billing";
import { InvoiceStatusBadge } from "@/features/billing/components/InvoiceStatusBadge";
import { InvoicePeriodCell } from "@/features/billing/components/InvoicePeriodCell";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";

export function BillingResellerPlatformInvoicePanel() {
  const theme = useTheme() as AppTheme;
  const checkoutMutation = useCheckoutInvoiceMutation();

  const pendingQuery = useInvoicesQuery({
    page: 1,
    limit: 10,
    billingKind: "agency_self",
    status: "pending",
  });
  const overdueQuery = useInvoicesQuery({
    page: 1,
    limit: 10,
    billingKind: "agency_self",
    status: "overdue",
  });
  const allQuery = useInvoicesQuery({
    page: 1,
    limit: 5,
    billingKind: "agency_self",
  });

  const pendingCount = pendingQuery.data?.data?.total ?? 0;
  const overdueCount = overdueQuery.data?.data?.total ?? 0;
  const unpaidCount = pendingCount + overdueCount;
  const rows = allQuery.data?.data?.items ?? [];

  const handlePay = async (invoiceId: string) => {
    try {
      const res = await checkoutMutation.mutateAsync(invoiceId);
      const url = res.data.checkoutUrl;
      if (!url) {
        publishAppToast({ message: "Checkout URL unavailable.", variant: "error" });
        return;
      }
      window.location.href = url;
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Could not start checkout.",
        variant: "error",
      });
    }
  };

  const columns = useMemo<DataTableColumn<InvoiceView & Record<string, unknown>>[]>(
    () => [
      {
        id: "invoiceNumber",
        label: "Invoice",
        render: (_v, row) => (
          <Link
            href={`/dashboard/billing/invoices/${row.id}`}
            style={{ color: theme.app.dashboard.accentBlue, textDecoration: "none", fontWeight: 700 }}
          >
            {String(row.invoiceNumber ?? row.id.slice(0, 8))}
          </Link>
        ),
      },
      {
        id: "periodStart",
        label: "Period",
        minWidth: 120,
        cellVariant: "muted",
        render: (_v, row) => (
          <InvoicePeriodCell periodStart={row.periodStart} periodEnd={row.periodEnd} />
        ),
      },
      {
        id: "totalAmount",
        label: "Amount",
        align: "right",
        minWidth: 112,
        nowrap: true,
        render: (_v, row) => (
          <Typography component="span" fontWeight={600} sx={{ color: theme.app.text.primary }}>
            {row.currency ?? "USD"} {invoiceTableAmount(row).toFixed(2)}
          </Typography>
        ),
      },
      { id: "dueDate", label: "Due", minWidth: 108, nowrap: true, cellVariant: "muted" },
      {
        id: "status",
        label: "Status",
        render: (v) => <InvoiceStatusBadge status={String(v)} />,
      },
    ],
    [theme.app.dashboard.accentBlue, theme.app.text.primary],
  );

  const isLoading = allQuery.isLoading;

  return (
    <DashboardCard sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography fontWeight={700} color="white">
          Your payment to platform
        </Typography>
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.5, maxWidth: 720 }}>
          Invoices issued to your agency by the platform. Pay pending items here — this is separate from
          client invoices you send below.
        </Typography>
      </Box>

      {unpaidCount > 0 ? (
        <Box
          sx={{
            px: 1.5,
            py: 1.25,
            borderRadius: 1.5,
            bgcolor: overdueCount > 0 ? "rgba(248,113,113,0.12)" : "rgba(255,193,7,0.12)",
            border: `1px solid ${overdueCount > 0 ? "rgba(248,113,113,0.35)" : "rgba(255,193,7,0.35)"}`,
          }}
        >
          <Typography fontWeight={700} sx={{ color: theme.app.text.primary }}>
            {unpaidCount} unpaid platform invoice{unpaidCount === 1 ? "" : "s"}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.25 }}>
            {overdueCount > 0
              ? `${overdueCount} overdue · ${pendingCount} pending`
              : `${pendingCount} pending — use Pay on each row.`}
          </Typography>
        </Box>
      ) : null}

      <DataTable<InvoiceView & Record<string, unknown>>
        columns={columns}
        rows={rows as (InvoiceView & Record<string, unknown>)[]}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        minWidth={640}
        size="medium"
        scrollY={false}
        loadingRowCount={3}
        emptyState={{
          title: "No platform invoices yet",
          description:
            "When the platform issues your agency invoice from contracts, it will appear here for payment.",
        }}
        actionColumn={{
          label: "Actions",
          width: 120,
          render: (row) => (
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.75 }}>
              <Button
                component={Link}
                href={`/dashboard/billing/invoices/${row.id}`}
                size="small"
                variant="secondary"
              >
                View
              </Button>
              {row.status === "pending" || row.status === "overdue" ? (
                <Button
                  size="small"
                  variant="primary"
                  onClick={() => void handlePay(row.id)}
                  disabled={checkoutMutation.isPending}
                >
                  Pay
                </Button>
              ) : null}
            </Box>
          ),
        }}
      />
    </DashboardCard>
  );
}
