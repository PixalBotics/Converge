"use client";

import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, SelectField, Typography } from "@/components/common";
import type { WebsiteBillingProfileView } from "@/api/billing/website-billing-profile.api";
import { BillingRateFieldsForm } from "@/features/billing/components/BillingRateFieldsForm";
import { InvoiceItemizedTable } from "@/features/billing/components/InvoiceItemizedTable";
import { WebsiteBillingStatusBadge } from "@/features/billing/components/WebsiteBillingStatusBadge";
import {
  type BillingRateFieldsValues,
} from "@/lib/billing/billing-rate-fields";
import { formatBillingPeriodLabel } from "@/lib/billing/merge-billing-rate-values";
import { contractsSectionCardSx } from "@/features/billing/website-contracts.styles";
import type { InvoiceView } from "@/api/billing/invoice.api";

type WebsiteOption = { value: string; label: string };

type Props = {
  title?: string;
  subtitle?: string;
  websiteOptions?: WebsiteOption[];
  websiteId?: string;
  onWebsiteChange?: (websiteId: string) => void;
  selectedProfile?: WebsiteBillingProfileView | null;
  rateValues: BillingRateFieldsValues;
  onRateChange: (patch: Partial<BillingRateFieldsValues>) => void;
  periodStart: string;
  periodEnd: string;
  onPeriodStartChange?: (value: string) => void;
  onPeriodEndChange?: (value: string) => void;
  periodReadOnly?: boolean;
  invoiceEmails: string;
  onInvoiceEmailsChange?: (value: string) => void;
  onSaveRates?: () => void;
  saveRatesPending?: boolean;
  saveRatesLabel?: string;
  previewInvoice?: InvoiceView | null;
  previewLoading?: boolean;
  previewTotalLabel?: string;
  existingInvoiceWarning?: string | null;
  alwaysShowRates?: boolean;
  children?: React.ReactNode;
  footer?: React.ReactNode;
};

function money(currency: string, amount: number) {
  return `${currency} ${amount.toFixed(2)}`;
}

export function PerWebsiteBillingSetupCard({
  title = "Client billing setup (per website)",
  subtitle = "Same rates and calculation as agency contracts. Pick one website for this invoice.",
  websiteOptions,
  websiteId = "",
  onWebsiteChange,
  selectedProfile,
  rateValues,
  onRateChange,
  periodStart,
  periodEnd,
  onPeriodStartChange,
  onPeriodEndChange,
  periodReadOnly = false,
  invoiceEmails,
  onInvoiceEmailsChange,
  onSaveRates,
  saveRatesPending = false,
  saveRatesLabel = "Save rates to website profile",
  previewInvoice,
  previewLoading = false,
  previewTotalLabel = "Invoice preview",
  existingInvoiceWarning,
  alwaysShowRates = false,
  children,
  footer,
}: Props) {
  const theme = useTheme() as AppTheme;
  const periodLabel = formatBillingPeriodLabel(periodStart, periodEnd);
  const showRates = alwaysShowRates || Boolean(selectedProfile || websiteId);

  return (
    <DashboardCard sx={contractsSectionCardSx}>
      <Typography fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
        {subtitle}
      </Typography>

      {websiteOptions && onWebsiteChange ? (
        <SelectField
          label="Website"
          value={websiteId}
          onChange={onWebsiteChange}
          options={websiteOptions}
        />
      ) : null}

      {selectedProfile ? (
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            bgcolor: alpha(theme.app.dashboard.cardBorder, 0.08),
          }}
        >
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary }}>
              {selectedProfile.websiteName ?? selectedProfile.websiteUrl}
            </Typography>
            <WebsiteBillingStatusBadge
              status={selectedProfile.status}
              trialEndDate={selectedProfile.trialEndDate}
              graceEndDate={null}
            />
          </Box>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
            Parent company: {selectedProfile.parentCompanyName} · Child company: {selectedProfile.companyName}
          </Typography>
        </Box>
      ) : null}

      {showRates ? (
        <>
          <BillingRateFieldsForm
            values={rateValues}
            onChange={onRateChange}
            displayCurrency={rateValues.currency}
            showPeriodBanner
            periodLabel={periodLabel}
            periodStart={periodStart}
            periodEnd={periodEnd}
            onPeriodStartChange={periodReadOnly ? undefined : onPeriodStartChange}
            onPeriodEndChange={periodReadOnly ? undefined : onPeriodEndChange}
            showInvoiceEmails
            invoiceEmails={invoiceEmails}
            onInvoiceEmailsChange={onInvoiceEmailsChange}
          />
          {periodReadOnly ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mt: -1 }}>
              Billing period is fixed for this invoice.
            </Typography>
          ) : null}
          {onSaveRates ? (
            <Button
              variant="secondary"
              onClick={() => void onSaveRates()}
              disabled={saveRatesPending}
              sx={{ alignSelf: "flex-start" }}
            >
              {saveRatesLabel}
            </Button>
          ) : null}
        </>
      ) : null}

      {children}

      {previewLoading ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          Loading preview…
        </Typography>
      ) : null}

      {previewInvoice ? (
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.7)}`,
            bgcolor: alpha(theme.app.dashboard.cardBorder, 0.08),
          }}
        >
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 1, mb: 1 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary }}>
              {previewTotalLabel}
            </Typography>
            <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.text.primary }}>
              {money(previewInvoice.currency ?? rateValues.currency, previewInvoice.totalAmount)}
            </Typography>
          </Box>
          <Box sx={{ bgcolor: "#fff", borderRadius: 1, overflow: "hidden" }}>
            <InvoiceItemizedTable invoice={previewInvoice} />
          </Box>
          {existingInvoiceWarning ? (
            <Typography variant="caption" sx={{ color: "#f59e0b", display: "block", mt: 0.75 }}>
              {existingInvoiceWarning}
            </Typography>
          ) : null}
        </Box>
      ) : null}

      {footer}
    </DashboardCard>
  );
}
