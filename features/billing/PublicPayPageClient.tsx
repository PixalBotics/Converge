"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { useQuery } from "@tanstack/react-query";
import { Button, Typography } from "@/components/common";
import { checkoutPublicInvoice, getPublicInvoice } from "@/api/billing/invoice.api";
import { InvoiceProfessionalDocument } from "@/features/billing/InvoiceProfessionalDocument";
import { PayPageShell } from "@/features/billing/PayPageShell";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";

export function PublicPayPageClient() {
  const theme = useTheme() as AppTheme;
  const params = useParams<{ token: string }>();
  const token = decodeURIComponent(String(params?.token ?? "")).trim();

  const invoiceQuery = useQuery({
    queryKey: ["public-invoice", token],
    queryFn: () => getPublicInvoice(token),
    enabled: token.length > 0,
  });

  const invoice = invoiceQuery.data?.data;

  const handlePay = async () => {
    try {
      const res = await checkoutPublicInvoice(token);
      const url = res.data.checkoutUrl;
      if (!url) {
        publishAppToast({ message: "Payment link unavailable.", variant: "error" });
        return;
      }
      window.location.href = url;
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Could not start payment.",
        variant: "error",
      });
    }
  };

  if (!token) {
    return (
      <PayPageShell title="Invalid link">
        <Typography sx={{ color: theme.app.dashboard.textMuted, textAlign: "center" }}>
          Invalid payment link.
        </Typography>
      </PayPageShell>
    );
  }

  if (invoiceQuery.isLoading) {
    return (
      <PayPageShell title="Loading">
        <Typography sx={{ color: theme.app.dashboard.textMuted, textAlign: "center" }}>
          Loading invoice…
        </Typography>
      </PayPageShell>
    );
  }

  if (!invoice) {
    return (
      <PayPageShell title="Not found">
        <Typography sx={{ color: theme.app.dashboard.textMuted, textAlign: "center" }}>
          Invoice not found or expired.
        </Typography>
      </PayPageShell>
    );
  }

  const isPaid = invoice.status === "paid";

  return (
    <PayPageShell title={isPaid ? "Invoice paid" : "Pay invoice"}>
      <Box sx={{ maxWidth: 960, mx: "auto" }}>
        <Box sx={{ mb: 1.5 }}>
          <Button component={Link} href="/dashboard/billing" variant="secondary" size="small">
            Back to billing
          </Button>
        </Box>
        {!isPaid ? (
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography sx={{ color: theme.app.text.primary }} fontWeight={700}>
                Amount due: {invoice.currency} {invoice.totalAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                Secure payment via Stripe · Due {invoice.dueDate ?? "—"}
              </Typography>
            </Box>
            <Button variant="primary" onClick={() => void handlePay()}>
              Pay with card
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.success.main, 0.12),
              border: `1px solid ${alpha(theme.palette.success.main, 0.35)}`,
              textAlign: "center",
            }}
          >
            <Typography sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
              Paid — thank you!
            </Typography>
          </Box>
        )}
        <InvoiceProfessionalDocument invoice={invoice} />
      </Box>
    </PayPageShell>
  );
}
