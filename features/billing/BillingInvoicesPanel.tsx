"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { ReceiptLongOutlined as ReceiptIcon } from "@mui/icons-material";
import {
  Button,
  DashboardCard,
  DataTable,
  SelectField,
  TablePagination,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { AddCircleIcon } from "@/components/common/icons";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { footerMutedText } from "@/app/dashboard/companies/overview.styles";
import { rolesIconBox } from "@/app/dashboard/roles/roles.styles";
import {
  billingCreateInvoiceButtonSx,
  billingFooterRowSx,
  billingHeaderButtonsSx,
  billingHeaderSx,
  billingInvoicesCardHeaderSx,
  billingInvoicesCardSx,
  billingInvoicesTableSx,
  billingPaginationWrapSx,
  billingSubtextSx,
} from "@/app/dashboard/billing/billing.styles";
import type { InvoiceView } from "@/api/billing/invoice.api";
import { useAuth } from "@/lib/auth";
import {
  invoiceTableAmount,
  invoiceTableBillableChats,
  invoiceTableCompany,
  invoiceTableWebsite,
} from "@/lib/billing/invoice-table-display";
import {
  flattenInvoicesToWebsiteRows,
  type InvoiceWebsiteTableRow,
  websiteRowClient,
  websiteRowLabel,
} from "@/lib/billing/invoice-website-rows";
import { useCheckoutInvoiceMutation, useInvoicesQuery, useIssueInvoiceMutation, useSyncInvoicePaymentMutation } from "@/lib/hooks/query/billing/billing";
import { InvoiceStatusBadge } from "@/features/billing/components/InvoiceStatusBadge";
import { InvoicePeriodCell } from "@/features/billing/components/InvoicePeriodCell";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

const PAGE_SIZE = 10;

export function BillingInvoicesPanel() {
  const theme = useTheme() as AppTheme;
  const searchParams = useSearchParams();
  const { isPlatformAdmin, user } = useAuth();
  const isResellerAdmin = user?.wideResellerScope === true && !isPlatformAdmin;
  const isBillingClient = Boolean(user?.parentCompanyId?.trim()) && !isPlatformAdmin && !isResellerAdmin;
  const canManageInvoices = isPlatformAdmin || isResellerAdmin;
  const canCreatePerWebsiteInvoice = canManageInvoices;
  const canIssueFromContracts = isPlatformAdmin;
  // Clients default to unpaid; reseller admins also see pending spotlight via query when ?status set.
  const initialStatus = searchParams.get("status") ?? (isBillingClient ? "pending" : "");
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const issueMutation = useIssueInvoiceMutation();
  const checkoutMutation = useCheckoutInvoiceMutation();
  const syncPaymentMutation = useSyncInvoicePaymentMutation();

  const params = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      status: status || undefined,
      ...(isResellerAdmin ? { billingKind: "client" as const } : {}),
    }),
    [page, status, isResellerAdmin],
  );
  const { data, isLoading, refetch } = useInvoicesQuery(params);
  const list = data?.data;
  const rows = list?.items ?? [];
  const websiteRows = useMemo(
    () => (isResellerAdmin ? flattenInvoicesToWebsiteRows(rows) : []),
    [isResellerAdmin, rows],
  );
  const pageCount = list?.totalPages ?? 1;

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      void refetch();
    }
  }, [searchParams, refetch]);

  const handleIssue = async (invoiceId: string, resend = false) => {
    try {
      await issueMutation.mutateAsync(invoiceId);
      publishAppToast({
        message: resend
          ? "Invoice email resent to the client."
          : "Invoice sent to the client by email.",
        variant: "success",
      });
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Could not send invoice email.",
        variant: "error",
      });
    }
  };

  const handleSyncPayment = async (invoiceId: string) => {
    try {
      const res = await syncPaymentMutation.mutateAsync(invoiceId);
      if (res.data.confirmed) {
        publishAppToast({ message: "Invoice marked as paid.", variant: "success" });
      } else {
        publishAppToast({ message: "No completed Stripe payment found for this invoice yet.", variant: "error" });
      }
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Could not sync payment.",
        variant: "error",
      });
    }
  };

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
        minWidth: 128,
        nowrap: true,
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
        id: "websiteUrl",
        label: "Website",
        minWidth: 160,
        cellVariant: "muted",
        render: (_v, row) => (
          <Typography component="span" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
            {invoiceTableWebsite(row)}
          </Typography>
        ),
      },
      {
        id: "companyName",
        label: "Client",
        minWidth: 110,
        cellVariant: "muted",
        render: (_v, row) => invoiceTableCompany(row),
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
        id: "billableChats",
        label: "Chats",
        align: "right",
        minWidth: 72,
        nowrap: true,
        render: (_v, row) => invoiceTableBillableChats(row) || "—",
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
      {
        id: "dueDate",
        label: "Due",
        minWidth: 108,
        nowrap: true,
        cellVariant: "muted",
        render: (v) => (v ? String(v) : "—"),
      },
      {
        id: "status",
        label: "Status",
        minWidth: 100,
        render: (v) => <InvoiceStatusBadge status={String(v)} />,
      },
    ],
    [theme.app.dashboard.accentBlue, theme.app.dashboard.textMuted, theme.app.text.primary],
  );

  const websiteColumns = useMemo<DataTableColumn<InvoiceWebsiteTableRow & Record<string, unknown>>[]>(
    () => [
      {
        id: "websiteUrl",
        label: "Website",
        minWidth: 160,
        render: (_v, row) => (
          <Typography component="span" fontWeight={600} sx={{ color: theme.app.text.primary, display: "block" }}>
            {websiteRowLabel(row)}
          </Typography>
        ),
      },
      {
        id: "parentCompanyName",
        label: "Client",
        minWidth: 110,
        cellVariant: "muted",
        render: (_v, row) => websiteRowClient(row),
      },
      {
        id: "invoiceNumber",
        label: "Invoice",
        minWidth: 128,
        cellVariant: "muted",
        render: (_v, row) => (
          <Link
            href={`/dashboard/billing/invoices/${row.invoiceId}`}
            style={{ color: theme.app.dashboard.accentBlue, textDecoration: "none", fontWeight: 600 }}
          >
            {String(row.invoiceNumber ?? row.invoiceId.slice(0, 8))}
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
        id: "billableChats",
        label: "Chats",
        align: "right",
        minWidth: 72,
        nowrap: true,
        render: (_v, row) => row.billableChats || "—",
      },
      {
        id: "amount",
        label: "Amount",
        align: "right",
        minWidth: 112,
        nowrap: true,
        render: (_v, row) => (
          <Typography component="span" fontWeight={600} sx={{ color: theme.app.text.primary }}>
            {row.currency ?? "USD"} {row.amount.toFixed(2)}
          </Typography>
        ),
      },
      {
        id: "dueDate",
        label: "Due",
        minWidth: 108,
        nowrap: true,
        cellVariant: "muted",
        render: (v) => (v ? String(v) : "—"),
      },
      {
        id: "status",
        label: "Status",
        minWidth: 100,
        render: (v) => <InvoiceStatusBadge status={String(v)} />,
      },
    ],
    [theme.app.dashboard.accentBlue, theme.app.dashboard.textMuted, theme.app.text.primary],
  );

  const renderInvoiceActions = (invoiceId: string, status: string, isAgencySelfBill = false) => (
    <>
      <Button
        component={Link}
        href={`/dashboard/billing/invoices/${invoiceId}`}
        size="small"
        variant="secondary"
      >
        View
      </Button>
      {canManageInvoices && !isAgencySelfBill && status === "draft" ? (
        <Button size="small" variant="primary" onClick={() => void handleIssue(invoiceId, false)}>
          Send invoice
        </Button>
      ) : null}
      {canManageInvoices && !isAgencySelfBill && (status === "pending" || status === "overdue") ? (
        <Button size="small" variant="primary" onClick={() => void handleIssue(invoiceId, true)}>
          {isResellerAdmin ? "Send invoice" : "Resend to client"}
        </Button>
      ) : null}
      {isResellerAdmin && isAgencySelfBill && (status === "pending" || status === "overdue") ? (
        <Button size="small" variant="primary" onClick={() => void handlePay(invoiceId)}>
          Pay
        </Button>
      ) : null}
      {!canManageInvoices && (status === "pending" || status === "overdue") ? (
        <Button size="small" variant="primary" onClick={() => void handlePay(invoiceId)}>
          Pay
        </Button>
      ) : null}
      {canManageInvoices && !isAgencySelfBill && (status === "pending" || status === "overdue") ? (
        <Button size="small" variant="secondary" onClick={() => void handleSyncPayment(invoiceId)}>
          Sync
        </Button>
      ) : null}
    </>
  );

  const panelTitle = isBillingClient
    ? "Pending payments"
    : isResellerAdmin
      ? "Client payments"
      : "Invoices";

  const panelDescription = isBillingClient
    ? "Your company's invoices — pay pending items from here. You only see invoices for your account."
    : isResellerAdmin
      ? "Per-website invoices for clients not on agency contract. Agency-contract clients are billed from Agency contracts."
      : "Agency contract clients: one combined bill per parent company. Others: use Per-website invoice.";

  const emptyTitle = isBillingClient
    ? "No pending invoices"
    : isResellerAdmin
      ? "No client payments yet"
      : "No invoices yet";

  const emptyDescription = isBillingClient
    ? "When your provider issues an invoice, it will appear here for payment."
    : isResellerAdmin
      ? "Create a per-website invoice for any client site, then send it so they can pay you."
      : "Open Agency contracts to generate a combined invoice per client.";

  const listLabel = isResellerAdmin ? "Website payments" : "Invoice list";
  const footerCount = isResellerAdmin
    ? `${websiteRows.length} website${websiteRows.length === 1 ? "" : "s"}`
    : `${list?.total ?? 0} invoices`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: "0 0 auto", alignSelf: "stretch" }}>
      <Box sx={billingHeaderSx}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} sx={{ color: theme.app.text.primary }}>
            {panelTitle}
          </Typography>
          <Typography variant="body2" sx={billingSubtextSx}>
            {panelDescription}
          </Typography>
        </Box>
        {canCreatePerWebsiteInvoice || canIssueFromContracts ? (
          <Box sx={billingHeaderButtonsSx}>
            {canCreatePerWebsiteInvoice ? (
              <Button
                component={Link}
                href="/dashboard/billing/create-invoice"
                variant={isResellerAdmin ? "primary" : "secondary"}
                startIcon={isResellerAdmin ? <AddCircleIcon width={16} height={16} /> : undefined}
                sx={
                  isResellerAdmin
                    ? { ...(gradientPrimaryButtonSx as object), ...(billingCreateInvoiceButtonSx as object) }
                    : { minWidth: 164 }
                }
              >
                Per-website invoice
              </Button>
            ) : null}
            {canIssueFromContracts ? (
              <Button
                component={Link}
                href="/dashboard/billing/website-contracts"
                variant="primary"
                startIcon={<AddCircleIcon width={16} height={16} />}
                sx={{ ...(gradientPrimaryButtonSx as object), ...(billingCreateInvoiceButtonSx as object) }}
              >
                Issue from contracts
              </Button>
            ) : null}
            {isResellerAdmin ? (
              <Button component={Link} href="/dashboard/billing/payments" variant="secondary" sx={{ minWidth: 140 }}>
                Payment setup
              </Button>
            ) : null}
          </Box>
        ) : null}
      </Box>

      <DashboardCard sx={billingInvoicesCardSx}>
        <Box sx={billingInvoicesCardHeaderSx}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box sx={rolesIconBox}>
              <ReceiptIcon sx={{ fontSize: 18, color: theme.app.dashboard.white95 }} />
            </Box>
            <Typography variant="mediumLarge" fontWeight={600} sx={{ color: theme.app.text.primary }}>
              {listLabel}
            </Typography>
          </Box>
          <Box sx={{ width: { xs: "100%", sm: 220 } }}>
            <SelectField
              label="Status"
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              options={STATUS_OPTIONS}
              searchable={false}
              dense
            />
          </Box>
        </Box>

        {isResellerAdmin ? (
          <DataTable<InvoiceWebsiteTableRow & Record<string, unknown>>
            columns={websiteColumns}
            rows={websiteRows as (InvoiceWebsiteTableRow & Record<string, unknown>)[]}
            getRowId={(row) => row.rowId}
            isLoading={isLoading}
            minWidth={1120}
            size="medium"
            scrollY={false}
            loadingRowCount={5}
            emptyState={{
              title: emptyTitle,
              description: emptyDescription,
            }}
            tableSx={billingInvoicesTableSx}
            containerSx={{ flex: "0 0 auto", height: "auto", minHeight: 0 }}
            actionColumn={{
              label: "Actions",
              width: 120,
              render: (row) => (
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.75, flexWrap: "nowrap" }}>
                  {renderInvoiceActions(row.invoiceId, row.status, false)}
                </Box>
              ),
            }}
          />
        ) : (
          <DataTable<InvoiceView & Record<string, unknown>>
            columns={columns}
            rows={rows as (InvoiceView & Record<string, unknown>)[]}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            minWidth={1120}
            size="medium"
            scrollY={false}
            loadingRowCount={5}
            emptyState={{
              title: emptyTitle,
              description: emptyDescription,
            }}
            tableSx={billingInvoicesTableSx}
            containerSx={{ flex: "0 0 auto", height: "auto", minHeight: 0 }}
            actionColumn={{
              label: "Actions",
              width: 120,
              render: (row) => (
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.75, flexWrap: "nowrap" }}>
                  {renderInvoiceActions(row.id, row.status, row.isAgencySelfBill)}
                </Box>
              ),
            }}
          />
        )}

        <Box sx={billingFooterRowSx}>
          <Typography variant="body2" sx={footerMutedText(theme)}>
            {isLoading ? "Loading…" : footerCount}
          </Typography>
          <Box sx={billingPaginationWrapSx}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
}
