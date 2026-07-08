"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, InputField, Typography } from "@/components/common";
import type { ParentBillingPreview } from "@/api/billing/agency-billing-contract.api";
import { InvoiceStatusBadge } from "@/features/billing/components/InvoiceStatusBadge";
import { BillingLimitMeter } from "@/features/billing/components/BillingLimitMeter";
import { WebsiteRateEditorRow } from "@/features/billing/components/WebsiteRateEditorRow";
import { InvoiceProfessionalDocument } from "@/features/billing/InvoiceProfessionalDocument";
import { parentPreviewToInvoiceView } from "@/lib/billing/parent-preview-invoice";
import {
  contractsExistingInvoiceSx,
  contractsLimitPanelSx,
  contractsSectionCardSx,
} from "@/features/billing/website-contracts.styles";

function parseLimit(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function effectiveLimit(limitInput: string, savedLimit: number | null): number | null {
  return parseLimit(limitInput) ?? savedLimit;
}

function money(currency: string, amount: number) {
  return `${currency} ${amount.toFixed(2)}`;
}

type Props = {
  parent: ParentBillingPreview;
  currency: string;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  agencyFreeChats: number;
  agencyCostPerChat: number;
  limitInput: string;
  emailInput: string;
  onLimitChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSaveAndSendInvoice: () => void;
  onUpdateSettings: () => void;
  onRatesSaved: () => void;
  saving: boolean;
};

export function ParentCompanyBillingCard({
  parent,
  currency,
  periodLabel,
  periodStart,
  periodEnd,
  agencyFreeChats,
  agencyCostPerChat,
  limitInput,
  emailInput,
  onLimitChange,
  onEmailChange,
  onSaveAndSendInvoice,
  onUpdateSettings,
  onRatesSaved,
  saving,
}: Props) {
  const theme = useTheme() as AppTheme;
  const limit = effectiveLimit(limitInput, parent.billingLimitMonthly);
  const hasExistingInvoice = Boolean(parent.existingInvoice);
  const siteCount = parent.websites.length;
  const onAgencyContract = parent.onAgencyContract;
  const canCreateInvoice = onAgencyContract && !hasExistingInvoice && siteCount > 0;

  const invoicePreview = parentPreviewToInvoiceView(parent, {
    currency,
    periodStart,
    periodEnd,
    freeChatsPerMonth: parent.websites[0]?.freeChatsPerMonth ?? agencyFreeChats,
    costPerChat: parent.websites[0]?.costPerChat ?? agencyCostPerChat,
  });

  return (
    <DashboardCard sx={contractsSectionCardSx}>
      <Box
        sx={{
          p: 2,
          borderRadius: "14px",
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
          bgcolor: alpha(theme.app.dashboard.accentPurple, theme.palette.mode === "light" ? 0.06 : 0.12),
        }}
      >
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
          Client invoice preview · {periodLabel}
        </Typography>
        <Typography variant="mediumLarge" fontWeight={800} sx={{ color: theme.app.text.primary, mt: 0.5, mb: 0.75 }}>
          {parent.parentCompanyName}
        </Typography>
        {!onAgencyContract ? (
          <Box
            sx={{
              mb: 1.5,
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.8)}`,
              bgcolor: alpha(theme.app.dashboard.cardBorder, 0.1),
            }}
          >
            <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
              Per-website billing (no agency contract)
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", lineHeight: 1.55, mb: 1 }}>
              This client is not on agency contract billing. Bill each website separately from Per-website invoice, or add
              an invoice email below and save to enable one combined monthly invoice for all sites.
            </Typography>
            <Button component={Link} href="/dashboard/billing/create-invoice" size="small" variant="secondary">
              Open per-website invoice
            </Button>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1.5, lineHeight: 1.6 }}>
            {siteCount === 0
              ? "No websites linked to this client yet."
              : `Agency contract billing — one combined invoice for ${siteCount} website${siteCount === 1 ? "" : "s"}.`}
          </Typography>
        )}
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
          <Typography variant="h5" fontWeight={800} sx={{ color: theme.app.text.primary }}>
            {money(currency, parent.subtotal)}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {onAgencyContract && !hasExistingInvoice ? (
              <Button size="small" variant="primary" onClick={onSaveAndSendInvoice} disabled={!canCreateInvoice || saving}>
                Save & send invoice
              </Button>
            ) : onAgencyContract && hasExistingInvoice ? (
              <Button size="small" variant="secondary" onClick={onUpdateSettings} disabled={saving}>
                Update client settings
              </Button>
            ) : (
              <Button
                size="small"
                variant="primary"
                onClick={onUpdateSettings}
                disabled={!emailInput.trim() || saving}
              >
                Enable agency contract
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {onAgencyContract && parent.existingInvoice ? (
        <Box sx={contractsExistingInvoiceSx}>
          <Box>
            <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.text.primary }}>
              Invoice already sent for {periodLabel}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.5 }}>
              {parent.existingInvoice.invoiceNumber ?? parent.existingInvoice.id.slice(0, 8)}
            </Typography>
            <InvoiceStatusBadge status={parent.existingInvoice.status} />
          </Box>
          <Button
            component={Link}
            href={`/dashboard/billing/invoices/${parent.existingInvoice.id}`}
            size="small"
            variant="secondary"
          >
            Open invoice
          </Button>
        </Box>
      ) : null}

      <Box sx={contractsLimitPanelSx}>
        <BillingLimitMeter currency={currency} used={parent.subtotal} limit={limit} />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
          <InputField
            label="Monthly spending cap (optional)"
            value={limitInput}
            onChange={(e) => onLimitChange(e.target.value)}
            placeholder="e.g. 500"
            helperText="Track monthly spend target for this client."
          />
          <InputField
            label="Email invoice to"
            value={emailInput}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="client@company.com"
          />
        </Box>
      </Box>

      {onAgencyContract && siteCount > 0 ? (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
            Per-website rates
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
            Agency defaults apply until you edit and save rates for a specific website.
          </Typography>
          <Box
            sx={{
              border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.6)}`,
              borderRadius: 2,
              overflow: "hidden",
              mb: 2,
            }}
          >
            {parent.websites.map((row, idx) => (
              <WebsiteRateEditorRow
                key={row.websiteId}
                row={row}
                currency={currency}
                index={idx}
                onSaved={onRatesSaved}
              />
            ))}
          </Box>

          <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 1 }}>
            Invoice document (email preview)
          </Typography>
          <Box sx={{ borderRadius: 2, overflow: "hidden" }}>
            <InvoiceProfessionalDocument invoice={invoicePreview} />
          </Box>
        </Box>
      ) : null}
    </DashboardCard>
  );
}
