"use client";

import Box from "@mui/material/Box";
import { logoSvg } from "@/assets";
import { Typography } from "@/components/common";
import type { InvoiceView } from "@/api/billing/invoice.api";
import { normalizeInvoiceLineInputs } from "@/lib/billing/client-invoice-lines";
import { InvoiceItemizedTable } from "@/features/billing/components/InvoiceItemizedTable";

type Props = {
  invoice: InvoiceView;
};

export function InvoiceProfessionalDocument({ invoice }: Props) {
  const currency = invoice.currency ?? "USD";
  const lineInputs = normalizeInvoiceLineInputs(invoice);

  const totalBillableChats = lineInputs.reduce((sum, i) => sum + (i.billableChats ?? 0), 0);
  const totalChargeableChats = lineInputs.reduce((sum, i) => sum + (i.chargeableChats ?? 0), 0);
  const totalTotalChats = lineInputs.reduce((sum, i) => sum + (i.totalChats ?? 0), 0);
  const totalFreeChatsUsed = lineInputs.reduce(
    (sum, i) => sum + ((i.billableChats ?? 0) - (i.chargeableChats ?? 0)),
    0,
  );

  const round2 = (v: number) => Math.round(v * 100) / 100;
  const preDiscountSubtotal = lineInputs.reduce((sum, i) => {
    const modulesFee = i.modulesFee ?? 0;
    return (
      sum +
      modulesFee +
      i.platformFee +
      i.aiToolsFee +
      (i.extraCharges ?? 0) +
      i.chatCharges
    );
  }, 0);
  const effectiveDiscount = round2(Math.max(0, preDiscountSubtotal - invoice.totalAmount));

  const billTo =
    invoice.parentCompanyName ?? invoice.companyName ?? invoice.websiteName ?? "Client";

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        color: "#0f172a",
        borderRadius: 2,
        p: { xs: 2, md: 4 },
        maxWidth: 960,
        mx: "auto",
        boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 3 }}>
        <Box component="img" src={logoSvg} alt="Logo" sx={{ height: 36 }} />
        <Box sx={{ textAlign: "right" }}>
          <Typography sx={{ fontSize: 28, fontWeight: 800, letterSpacing: 2, color: "#1e3a8a" }}>
            INVOICE
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#64748b" }}>
            #{invoice.invoiceNumber ?? invoice.id.slice(0, 8)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#64748b", mb: 0.5 }}>BILL TO</Typography>
          <Typography sx={{ fontWeight: 700 }}>{billTo}</Typography>
          {invoice.websiteUrl ? (
            <Typography sx={{ fontSize: 13, color: "#64748b" }}>{invoice.websiteUrl}</Typography>
          ) : null}
        </Box>
        <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
          <Typography sx={{ fontSize: 13 }}>Issued: {invoice.issuedDate}</Typography>
          <Typography sx={{ fontSize: 13 }}>Due: {invoice.dueDate ?? "—"}</Typography>
          <Typography sx={{ fontSize: 13 }}>
            Period: {invoice.periodStart ?? "—"} → {invoice.periodEnd ?? "—"}
          </Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 700, mt: 0.5, textTransform: "capitalize" }}>
            Status: {invoice.status}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          mb: 2,
          p: 1.5,
          bgcolor: "#f8fafc",
          borderRadius: 1,
          border: "1px solid #e2e8f0",
        }}
      >
        <Typography sx={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
          <strong>Free chats:</strong> {invoice.freeChatsIncluded ?? 0} / month / site ·{" "}
          <strong>Cost per chat:</strong> {currency}{" "}
          {typeof invoice.costPerChat === "number" ? invoice.costPerChat.toFixed(2) : "0.00"}
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.25 }}>
          Total chats: {totalTotalChats} · Billable: {totalBillableChats} · Free used: {totalFreeChatsUsed}{" "}
          · Chargeable: {totalChargeableChats}
        </Typography>
      </Box>

      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#64748b", mb: 1, textTransform: "uppercase", letterSpacing: 0.6 }}>
        Itemized charges
      </Typography>
      <Box sx={{ mb: 3 }}>
        <InvoiceItemizedTable invoice={invoice} />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Box sx={{ minWidth: 280 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5, fontSize: 13 }}>
            <span>Subtotal (pre-discount)</span>
            <span>
              {currency} {preDiscountSubtotal.toFixed(2)}
            </span>
          </Box>
          {effectiveDiscount > 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                py: 0.5,
                color: "#16a34a",
                fontSize: 13,
              }}
            >
              <span>Discount</span>
              <span>
                −{currency} {effectiveDiscount.toFixed(2)}
              </span>
            </Box>
          ) : null}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              py: 1,
              mt: 1,
              px: 1.5,
              bgcolor: "#1e3a8a",
              color: "#fff",
              borderRadius: 1,
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            <span>Total due</span>
            <span>
              {currency} {invoice.totalAmount.toFixed(2)}
            </span>
          </Box>
        </Box>
      </Box>

      {invoice.notes ? (
        <Box sx={{ mt: 3, p: 1.5, bgcolor: "#f8fafc", borderRadius: 1, border: "1px solid #e2e8f0" }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#64748b", mb: 0.5 }}>Notes</Typography>
          <Typography sx={{ fontSize: 13, whiteSpace: "pre-wrap" }}>{invoice.notes}</Typography>
        </Box>
      ) : null}
    </Box>
  );
}
