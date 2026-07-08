"use client";

import Box from "@mui/material/Box";
import type { InvoiceView } from "@/api/billing/invoice.api";
import {
  buildInvoiceItemRowsFromLines,
  normalizeInvoiceLineInputs,
  type ClientInvoiceItemRow,
} from "@/lib/billing/client-invoice-lines";

type Props = {
  invoice: Pick<
    InvoiceView,
    | "id"
    | "currency"
    | "websiteId"
    | "websiteUrl"
    | "websiteName"
    | "companyName"
    | "totalChats"
    | "billableChats"
    | "freeChatsIncluded"
    | "costPerChat"
    | "platformFee"
    | "aiToolsFee"
    | "extraCharges"
    | "totalAmount"
    | "lineItems"
  >;
};

function formatAmount(currency: string, amount: number | null): string {
  if (amount == null) return "";
  const prefix = amount < 0 ? "−" : "";
  return `${prefix}${currency} ${Math.abs(amount).toFixed(2)}`;
}

function rowBackground(row: ClientInvoiceItemRow): string | undefined {
  if (row.rowKind === "site-header") return "#f1f5f9";
  if (row.rowKind === "site-total") return "#f8fafc";
  return undefined;
}

export function InvoiceItemizedTable({ invoice }: Props) {
  const currency = invoice.currency ?? "USD";
  const lineInputs = normalizeInvoiceLineInputs(invoice);
  const itemRows = buildInvoiceItemRowsFromLines(lineInputs, currency);

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box
        component="table"
        sx={{
          width: "100%",
          minWidth: 680,
          borderCollapse: "collapse",
          border: "1px solid #e2e8f0",
          borderRadius: 1,
          overflow: "hidden",
          "& th": {
            p: "10px 12px",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: 0.3,
            whiteSpace: "nowrap",
            bgcolor: "#1e3a8a",
            color: "#fff",
          },
          "& td": {
            p: "9px 12px",
            fontSize: 13,
            verticalAlign: "top",
          },
        }}
      >
        <Box component="thead">
          <Box component="tr">
            <Box component="th" sx={{ textAlign: "center", width: 44 }}>
              #
            </Box>
            <Box component="th" sx={{ textAlign: "left" }}>
              Description
            </Box>
            <Box component="th" sx={{ textAlign: "right" }}>
              Rate
            </Box>
            <Box component="th" sx={{ textAlign: "right" }}>
              Qty / usage
            </Box>
            <Box component="th" sx={{ textAlign: "right" }}>
              Amount
            </Box>
          </Box>
        </Box>
        <Box component="tbody">
          {itemRows.map((row, idx) => {
            const bg = rowBackground(row);
            const isSiteHeader = row.rowKind === "site-header";
            const isSiteTotal = row.rowKind === "site-total";
            const isDiscount = row.rowKind === "discount";

            return (
              <Box
                key={`${row.siteIndex}-${row.rowKind}-${idx}`}
                component="tr"
                sx={{
                  bgcolor: bg,
                  borderBottom: isSiteTotal ? "2px solid #cbd5e1" : "1px solid #e2e8f0",
                }}
              >
                <Box
                  component="td"
                  sx={{
                    textAlign: "center",
                    color: "#64748b",
                    fontWeight: isSiteHeader ? 700 : 400,
                  }}
                >
                  {isSiteHeader ? row.siteIndex : ""}
                </Box>
                <Box
                  component="td"
                  sx={{
                    pl: isSiteHeader ? 1.5 : 3,
                    fontWeight: isSiteHeader || isSiteTotal ? 700 : 400,
                    color: isDiscount ? "#16a34a" : "#0f172a",
                  }}
                >
                  {row.description}
                </Box>
                <Box
                  component="td"
                  sx={{ textAlign: "right", color: "#475569", whiteSpace: "nowrap" }}
                >
                  {row.rate ?? (isSiteTotal ? "" : "—")}
                </Box>
                <Box component="td" sx={{ textAlign: "right", color: "#475569" }}>
                  {row.quantity ?? ""}
                </Box>
                <Box
                  component="td"
                  sx={{
                    textAlign: "right",
                    fontWeight: isSiteTotal ? 700 : 500,
                    color: isDiscount ? "#16a34a" : "#0f172a",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatAmount(currency, row.amount)}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
