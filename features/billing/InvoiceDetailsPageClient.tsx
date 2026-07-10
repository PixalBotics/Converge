"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { pageWrapper } from "@/app/dashboard/companies/overview.styles";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import {
  useCheckoutInvoiceMutation,
  useInvoiceQuery,
  useIssueInvoiceMutation,
  useUpdateInvoiceMutation,
} from "@/lib/hooks/query/billing/billing";
import { BillingBackButton } from "@/features/billing/components/BillingBackButton";
import { InvoiceEditPanel } from "@/features/billing/components/InvoiceEditPanel";
import { InvoiceProfessionalDocument } from "@/features/billing/InvoiceProfessionalDocument";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import type { UpdateInvoiceBody } from "@/api/billing/invoice.api";

export function InvoiceDetailsPageClient() {
  const theme = useTheme() as AppTheme;
  const params = useParams<{ invoiceId: string }>();
  const invoiceId = decodeURIComponent(String(params?.invoiceId ?? "")).trim();
  const { isPlatformAdmin, hasOperational, user } = useAuth();
  const isResellerAdmin = user?.wideResellerScope === true && !isPlatformAdmin;
  const isBillingClient =
    Boolean(user?.parentCompanyId?.trim()) && !isPlatformAdmin && !isResellerAdmin;
  const canManageInvoices = isPlatformAdmin || isResellerAdmin;
  const [editing, setEditing] = useState(false);

  const invoiceQuery = useInvoiceQuery(invoiceId);
  const issueMutation = useIssueInvoiceMutation();
  const checkoutMutation = useCheckoutInvoiceMutation();
  const updateMutation = useUpdateInvoiceMutation();
  const invoice = invoiceQuery.data?.data;
  const isAgencySelfBill = Boolean(invoice?.isAgencySelfBill);
  const resellerPaysPlatform =
    isResellerAdmin && isAgencySelfBill && (invoice?.status === "pending" || invoice?.status === "overdue");
  const canEditPending =
    isPlatformAdmin &&
    hasOperational(OP.billing.edit) &&
    invoice?.status === "pending";

  const handleIssue = async (resend = false) => {
    try {
      await issueMutation.mutateAsync(invoiceId);
      publishAppToast({
        message: resend
          ? "Invoice email resent to the client."
          : "Invoice sent to the client by email.",
        variant: "success",
      });
      void invoiceQuery.refetch();
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Could not send invoice email.",
        variant: "error",
      });
    }
  };

  const handlePay = async () => {
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

  const copyPayLink = async () => {
    if (!invoice?.publicPaymentToken) return;
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${base}/pay/${invoice.publicPaymentToken}`;
    try {
      await navigator.clipboard.writeText(url);
      publishAppToast({ message: "Payment link copied.", variant: "success" });
    } catch {
      publishAppToast({ message: url, variant: "success" });
    }
  };

  const handleSaveEdit = async (body: UpdateInvoiceBody) => {
    try {
      await updateMutation.mutateAsync({ invoiceId, body });
      publishAppToast({ message: "Invoice updated.", variant: "success" });
      setEditing(false);
      void invoiceQuery.refetch();
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Could not update invoice.",
        variant: "error",
      });
    }
  };

  if (!invoiceId) {
    return (
      <Box sx={pageWrapper}>
        <Typography color="white">Invoice not found.</Typography>
      </Box>
    );
  }

  if (invoiceQuery.isLoading) {
    return (
      <Box sx={pageWrapper}>
        <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading invoice…</Typography>
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box sx={pageWrapper}>
        <Typography color="white">Invoice not found.</Typography>
        <Button component={Link} href="/dashboard/billing" variant="secondary" sx={{ mt: 2 }}>
          Back to billing
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={pageWrapper}>
      <BillingBackButton />
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, flexWrap: "wrap", mb: 2 }}>
          {canEditPending && !editing ? (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit invoice
            </Button>
          ) : null}
          {canManageInvoices && !isAgencySelfBill && invoice.status === "draft" ? (
            <Button variant="primary" onClick={() => void handleIssue(false)} disabled={issueMutation.isPending}>
              Send invoice
            </Button>
          ) : null}
          {canManageInvoices && !isAgencySelfBill && (invoice.status === "pending" || invoice.status === "overdue") ? (
            <Button variant="primary" onClick={() => void handleIssue(true)} disabled={issueMutation.isPending}>
              Resend to client
            </Button>
          ) : null}
          {(isBillingClient || resellerPaysPlatform) &&
          (invoice.status === "pending" || invoice.status === "overdue") ? (
            <Button variant="primary" onClick={() => void handlePay()} disabled={checkoutMutation.isPending}>
              Pay with Stripe
            </Button>
          ) : null}
          {invoice.publicPaymentToken && invoice.status !== "paid" && !isAgencySelfBill ? (
            <Button variant="secondary" onClick={() => void copyPayLink()}>
              Copy pay link
            </Button>
          ) : null}
      </Box>

      {editing && canEditPending ? (
        <InvoiceEditPanel
          invoice={invoice}
          saving={updateMutation.isPending}
          onSave={(body) => void handleSaveEdit(body)}
          onCancel={() => setEditing(false)}
        />
      ) : null}

      <InvoiceProfessionalDocument invoice={invoice} />
    </Box>
  );
}
