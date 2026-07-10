"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { InputField, SelectField, Typography } from "@/components/common";
import {
  BILLING_CURRENCY_OPTIONS,
  type BillingRateFieldsValues,
} from "@/lib/billing/billing-rate-fields";
import { contractsPeriodBannerSx } from "@/features/billing/website-contracts.styles";

type Props = {
  values: BillingRateFieldsValues;
  onChange: (patch: Partial<BillingRateFieldsValues>) => void;
  displayCurrency?: string;
  disabled?: boolean;
  showBillingMode?: boolean;
  showPeriodBanner?: boolean;
  periodLabel?: string;
  periodStart?: string;
  periodEnd?: string;
  onPeriodStartChange?: (value: string) => void;
  onPeriodEndChange?: (value: string) => void;
  showInvoiceEmails?: boolean;
  invoiceEmails?: string;
  onInvoiceEmailsChange?: (value: string) => void;
};

export function BillingRateFieldsForm({
  values,
  onChange,
  displayCurrency,
  disabled = false,
  showBillingMode = true,
  showPeriodBanner = false,
  periodLabel,
  periodStart,
  periodEnd,
  onPeriodStartChange,
  onPeriodEndChange,
  showInvoiceEmails = false,
  invoiceEmails = "",
  onInvoiceEmailsChange,
}: Props) {
  const theme = useTheme() as AppTheme;
  const currencyLabel = displayCurrency ?? values.currency;

  return (
    <>
      {showPeriodBanner && periodStart != null && periodEnd != null ? (
        <Box sx={contractsPeriodBannerSx}>
          <Box>
            <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.text.primary }}>
              Billing period: {periodLabel ?? `${periodStart} → ${periodEnd}`}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              Invoices are unique per client for this date range.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <InputField
              label="Period start"
              type="date"
              value={periodStart}
              onChange={(e) => onPeriodStartChange?.(e.target.value)}
              disabled={disabled || !onPeriodStartChange}
            />
            <InputField
              label="Period end"
              type="date"
              value={periodEnd}
              onChange={(e) => onPeriodEndChange?.(e.target.value)}
              disabled={disabled || !onPeriodEndChange}
            />
          </Box>
        </Box>
      ) : null}

      <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.text.primary, mt: showPeriodBanner ? 1.5 : 0, mb: 1 }}>
        Usage & support fees
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 1.5, mb: 2 }}>
        <SelectField
          label="Currency"
          value={values.currency}
          onChange={(v) => onChange({ currency: v })}
          options={BILLING_CURRENCY_OPTIONS}
          searchable={false}
          disabled={disabled}
        />
        <SelectField
          label="Billing cycle"
          value={values.billingCycle}
          onChange={(v) => onChange({ billingCycle: v === "yearly" ? "yearly" : "monthly" })}
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "yearly", label: "Yearly" },
          ]}
          searchable={false}
          disabled={disabled}
        />
        {showBillingMode ? (
          <SelectField
            label="Client billing mode"
            value={values.clientBillingMode}
            onChange={(v) => onChange({ clientBillingMode: v === "live" ? "live" : "trial" })}
            options={[
              { value: "trial", label: "Trial" },
              { value: "live", label: "Live (full billing)" },
            ]}
            searchable={false}
            disabled={disabled}
          />
        ) : null}
      </Box>
      {showBillingMode && values.clientBillingMode === "trial" ? (
        <Box sx={{ mb: 2, maxWidth: 280 }}>
          <InputField
            label="Trial days"
            value={values.clientTrialDays}
            onChange={(e) => onChange({ clientTrialDays: e.target.value })}
            placeholder="14"
            helperText="Trial reminder emails are sent before the trial ends. After trial, grace period rules apply."
            disabled={disabled}
          />
        </Box>
      ) : showBillingMode ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 2 }}>
          Live mode: client websites are fully billable with no trial period.
        </Typography>
      ) : null}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 1.5, mb: 2 }}>
        <InputField
          label="Chat price"
          value={values.costPerChat}
          onChange={(e) => onChange({ costPerChat: e.target.value })}
          disabled={disabled}
        />
        <InputField
          label="Free chats / site"
          value={values.freeChats}
          onChange={(e) => onChange({ freeChats: e.target.value })}
          disabled={disabled}
        />
        <InputField
          label="Monthly chats / site"
          value={values.monthlyChats}
          onChange={(e) => onChange({ monthlyChats: e.target.value })}
          disabled={disabled}
          placeholder="e.g. 500"
        />
        <InputField
          label="Support fee / site"
          value={values.platformFee}
          onChange={(e) => onChange({ platformFee: e.target.value })}
          disabled={disabled}
        />
        <InputField
          label="AI support fee / site"
          value={values.aiToolsFee}
          onChange={(e) => onChange({ aiToolsFee: e.target.value })}
          disabled={disabled}
        />
        <InputField
          label={`Software package / site (${currencyLabel})`}
          value={values.modulesFee}
          onChange={(e) => onChange({ modulesFee: e.target.value })}
          placeholder="0.00"
          disabled={disabled}
        />
      </Box>

      {showInvoiceEmails ? (
        <InputField
          label="Default invoice emails"
          value={invoiceEmails}
          onChange={(e) => onInvoiceEmailsChange?.(e.target.value)}
          placeholder="comma-separated"
          disabled={disabled}
        />
      ) : null}
    </>
  );
}
