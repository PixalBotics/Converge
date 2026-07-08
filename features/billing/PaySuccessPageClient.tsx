"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import HourglassTop from "@mui/icons-material/HourglassTop";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { InvoiceView, CheckoutConfirmResult } from "@/api/billing/invoice.api";
import { confirmCheckoutSession } from "@/api/billing/invoice.api";
import { Button, Typography } from "@/components/common";
import { PayPageShell } from "@/features/billing/PayPageShell";
import { payReceiptRowSx, payStatusCardSx } from "@/features/billing/pay-page.styles";

type PageState = "loading" | "confirmed" | "pending" | "error";

const CONFIRM_ATTEMPTS = 8;
const CONFIRM_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function confirmSourceLabel(result: CheckoutConfirmResult | undefined): string | null {
  if (!result?.confirmed) return null;
  switch (result.confirmedBy) {
    case "webhook":
      return "Confirmed automatically via Stripe webhook.";
    case "api":
      return "Confirmed via secure payment verification (webhook not configured).";
    case "api_fallback":
      return "Confirmed via payment verification. Add a Stripe webhook for faster automatic sync.";
    case "already_paid":
      return "This invoice was already marked as paid.";
    default:
      return null;
  }
}

async function confirmWithRetry(sessionId: string) {
  let lastResult: CheckoutConfirmResult | undefined;

  for (let attempt = 0; attempt < CONFIRM_ATTEMPTS; attempt += 1) {
    const res = await confirmCheckoutSession(sessionId);
    lastResult = res.data;
    if (lastResult.confirmed) {
      return { confirmed: true as const, invoice: lastResult.invoice, result: lastResult };
    }
    if (attempt < CONFIRM_ATTEMPTS - 1) {
      await sleep(CONFIRM_DELAY_MS);
    }
  }

  return { confirmed: false as const, invoice: lastResult?.invoice, result: lastResult };
}

export function PaySuccessPageClient() {
  const theme = useTheme() as AppTheme;
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id")?.trim() ?? "";
  const [state, setState] = useState<PageState>(sessionId ? "loading" : "pending");
  const [invoice, setInvoice] = useState<InvoiceView | undefined>();
  const [confirmResult, setConfirmResult] = useState<CheckoutConfirmResult | undefined>();

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    void (async () => {
      try {
        const outcome = await confirmWithRetry(sessionId);
        if (cancelled) return;
        setInvoice(outcome.invoice);
        setConfirmResult(outcome.result);
        setState(outcome.confirmed ? "confirmed" : "pending");
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const tone =
    state === "confirmed" ? "success" : state === "error" ? "error" : state === "loading" ? "loading" : "pending";

  const title =
    state === "confirmed"
      ? "Payment successful"
      : state === "loading"
        ? "Confirming payment"
        : state === "error"
          ? "Payment received"
          : "Payment processing";

  const headline =
    state === "loading"
      ? "Confirming your payment…"
      : state === "confirmed"
        ? "Thank you — payment complete"
        : state === "error"
          ? "Payment received — sync pending"
          : "Payment is being processed";

  const description =
    state === "loading"
      ? confirmResult?.webhookConfigured
        ? "Please wait while Stripe webhook or payment verification updates your invoice."
        : "Please wait while we verify your Stripe payment and update the invoice."
      : state === "confirmed"
        ? confirmSourceLabel(confirmResult) ??
          "Your card was charged successfully. The invoice is now marked as paid."
        : state === "error"
          ? "Stripe charged your card but we could not sync automatically. Your payment is safe — refresh the invoice page shortly or contact support with your session id."
          : confirmResult?.webhookConfigured
            ? "Stripe accepted your payment. Waiting for webhook confirmation — this usually takes a few seconds."
            : "Stripe accepted your payment. Retrying verification automatically…";

  const invoiceToken = invoice?.publicPaymentToken?.trim() ?? "";
  const currency = invoice?.currency ?? "USD";
  const amount = invoice ? `${currency} ${invoice.totalAmount.toFixed(2)}` : null;
  return (
    <PayPageShell title={title}>
      <Box sx={payStatusCardSx(tone)}>
        {state === "loading" ? (
          <CircularProgress size={56} sx={{ color: theme.palette.primary.main, mb: 2 }} />
        ) : state === "error" ? (
          <ErrorOutline sx={{ fontSize: 56, color: theme.palette.warning.main, mb: 2 }} />
        ) : state === "pending" ? (
          <HourglassTop sx={{ fontSize: 56, color: theme.palette.warning.main, mb: 2 }} />
        ) : (
          <CheckCircleOutline sx={{ fontSize: 56, color: theme.palette.success.main, mb: 2 }} />
        )}

        <Typography variant="regularLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 1 }}>
          {headline}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: theme.app.dashboard.textMuted, mb: invoice ? 2.5 : 3, lineHeight: 1.6, maxWidth: 440, mx: "auto" }}
        >
          {description}
        </Typography>

        {invoice ? (
          <Box
            sx={{
              textAlign: "left",
              mb: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: "rgba(0,0,0,0.18)",
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
            }}
          >
            <Box sx={payReceiptRowSx}>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                Invoice
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary }}>
                #{invoice.invoiceNumber ?? invoice.id.slice(0, 8)}
              </Typography>
            </Box>
            {amount ? (
              <Box sx={payReceiptRowSx}>
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                  Amount paid
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary }}>
                  {amount}
                </Typography>
              </Box>
            ) : null}
            <Box sx={payReceiptRowSx}>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                Status
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  color: state === "confirmed" ? theme.palette.success.main : theme.palette.warning.main,
                  textTransform: "capitalize",
                }}
              >
                {state === "confirmed" ? "paid" : invoice.status}
              </Typography>
            </Box>
          </Box>
        ) : null}

        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, justifyContent: "center" }}>
          <Button component={Link} href="/dashboard/billing" variant="secondary">
            Back to billing
          </Button>
          {invoiceToken ? (
            <Button component={Link} href={`/pay/${encodeURIComponent(invoiceToken)}`} variant="primary">
              View invoice
            </Button>
          ) : null}
          {state === "pending" || state === "error" ? (
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Refresh status
            </Button>
          ) : null}
        </Box>

        {sessionId && (state === "error" || state === "pending") ? (
          <Typography
            variant="caption"
            sx={{
              color: theme.app.dashboard.textMuted,
              display: "block",
              mt: 2.5,
              fontFamily: "monospace",
              wordBreak: "break-all",
              opacity: 0.8,
            }}
          >
            Reference: {sessionId}
          </Typography>
        ) : null}

        {state === "confirmed" ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mt: 2 }}>
            A receipt may be emailed if configured in Stripe. You can close this window.
          </Typography>
        ) : null}
      </Box>
    </PayPageShell>
  );
}
