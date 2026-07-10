"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, InputField, Typography } from "@/components/common";
import type { InvoiceLineItemView, InvoiceView, UpdateInvoiceBody } from "@/api/billing/invoice.api";
import type { WebsiteBillingProfileView } from "@/api/billing/website-billing-profile.api";
import { PerWebsiteBillingSetupCard } from "@/features/billing/components/PerWebsiteBillingSetupCard";
import {
  computeDraftLineTotals,
  defaultBillingRateFields,
  roundMoney,
  type BillingRateFieldsValues,
} from "@/lib/billing/billing-rate-fields";
import { invoiceEmailsFromProfile } from "@/lib/billing/merge-billing-rate-values";
import {
  useAgencyBillingContractQuery,
  useWebsiteBillingProfilesQuery,
} from "@/lib/hooks/query/billing/billing";

type LineDraft = BillingRateFieldsValues & {
  id: string;
  websiteId: string;
  label: string;
  childCompanyName: string | null;
  parentCompanyName: string | null;
  billableChats: number;
  extraCharges: string;
  invoiceEmails: string;
};

type Props = {
  invoice: InvoiceView;
  saving: boolean;
  onSave: (body: UpdateInvoiceBody) => void;
  onCancel: () => void;
};

function money(currency: string, amount: number) {
  return `${currency} ${amount.toFixed(2)}`;
}

function lineToDraft(
  item: InvoiceLineItemView,
  profile: WebsiteBillingProfileView | undefined,
  contractModulesFee: number | undefined,
  invoiceEmails: string,
): LineDraft {
  const freeChatsIncluded = Math.max(0, item.billableChats - item.chargeableChats);
  const base = defaultBillingRateFields(profile?.currency ?? "USD");
  const status = profile?.status?.trim().toLowerCase() ?? "";

  return {
    ...base,
    id: item.id,
    websiteId: item.websiteId,
    label: item.websiteName ?? item.websiteUrl,
    childCompanyName: item.childCompanyName ?? profile?.companyName ?? null,
    parentCompanyName: profile?.parentCompanyName ?? null,
    billableChats: item.billableChats,
    extraCharges: String(item.extraCharges ?? 0),
    invoiceEmails,
    currency: profile?.currency ?? "USD",
    billingCycle: profile?.billingCycle === "yearly" ? "yearly" : "monthly",
    clientBillingMode: status === "trial" ? "trial" : "live",
    costPerChat: String(item.costPerChat ?? profile?.costPerChat ?? 0),
    freeChats: String(
      freeChatsIncluded > 0 ? freeChatsIncluded : profile?.freeChatsPerMonth ?? 0,
    ),
    monthlyChats:
      profile?.monthlyChatsPerSite != null
        ? String(profile.monthlyChatsPerSite)
        : item.billableChats > 0
          ? String(item.billableChats)
          : "",
    platformFee: String(item.platformFee ?? profile?.platformFeeMonthly ?? 0),
    aiToolsFee: String(item.aiToolsFee ?? profile?.aiToolsMonthly ?? 0),
    modulesFee: String(
      item.modulesFee > 0
        ? item.modulesFee
        : profile?.modulesFeeMonthly ?? contractModulesFee ?? 0,
    ),
  };
}

function lineDraftToPreviewInvoice(
  invoice: InvoiceView,
  line: LineDraft,
  computed: ReturnType<typeof computeDraftLineTotals>,
): InvoiceView {
  return {
    ...invoice,
    currency: line.currency || invoice.currency,
    websiteId: line.websiteId,
    websiteName: line.label,
    websiteUrl: line.label,
    companyName: line.childCompanyName ?? invoice.companyName,
    parentCompanyName: line.parentCompanyName ?? invoice.parentCompanyName,
    billableChats: computed.billableChats,
    freeChatsIncluded: Number(line.freeChats) || 0,
    costPerChat: computed.costPerChat,
    platformFee: computed.platformFee,
    aiToolsFee: computed.aiToolsFee,
    extraCharges: computed.extraCharges,
    subtotal: computed.lineSubtotal,
    totalAmount: computed.lineSubtotal,
    lineItems: [
      {
        id: line.id,
        websiteId: line.websiteId,
        websiteUrl: line.label,
        websiteName: line.label,
        childCompanyName: line.childCompanyName,
        totalChats: computed.billableChats,
        billableChats: computed.billableChats,
        chargeableChats: computed.chargeableChats,
        costPerChat: computed.costPerChat,
        chatCharges: computed.chatCharges,
        platformFee: computed.platformFee,
        aiToolsFee: computed.aiToolsFee,
        extraCharges: computed.extraCharges,
        modulesFee: computed.modulesFee,
        lineTotal: computed.lineSubtotal,
      },
    ],
  };
}

export function InvoiceEditPanel({ invoice, saving, onSave, onCancel }: Props) {
  const theme = useTheme() as AppTheme;
  const resellerId = invoice.resellerId?.trim() ?? "";
  const currency = invoice.currency ?? "USD";
  const periodStart = invoice.periodStart ?? "";
  const periodEnd = invoice.periodEnd ?? "";

  const [dueDate, setDueDate] = useState(invoice.dueDate ?? "");
  const [notes, setNotes] = useState(invoice.notes ?? "");
  const [discountAmount, setDiscountAmount] = useState(
    invoice.discountAmount != null ? String(invoice.discountAmount) : "0",
  );
  const [lines, setLines] = useState<LineDraft[]>([]);

  const profilesQuery = useWebsiteBillingProfilesQuery(
    resellerId ? { resellerId } : {},
    { enabled: Boolean(resellerId) },
  );
  const contractQuery = useAgencyBillingContractQuery(resellerId, { enabled: Boolean(resellerId) });

  const profileByWebsiteId = useMemo(() => {
    const map = new Map<string, WebsiteBillingProfileView>();
    for (const row of profilesQuery.data?.data ?? []) {
      map.set(row.websiteId, row);
    }
    return map;
  }, [profilesQuery.data?.data]);

  const contract = contractQuery.data?.data;

  useEffect(() => {
    setDueDate(invoice.dueDate ?? "");
    setNotes(invoice.notes ?? "");
    setDiscountAmount(invoice.discountAmount != null ? String(invoice.discountAmount) : "0");
    setLines(
      (invoice.lineItems ?? []).map((item) => {
        const profile = profileByWebsiteId.get(item.websiteId);
        const emails = invoiceEmailsFromProfile(profile, contract);
        return lineToDraft(item, profile, contract?.modulesFeeMonthly, emails);
      }),
    );
  }, [invoice.id, profileByWebsiteId, contract]);

  const lineComputations = useMemo(
    () => lines.map((line) => computeDraftLineTotals(line)),
    [lines],
  );

  const subtotal = useMemo(
    () => roundMoney(lineComputations.reduce((sum, row) => sum + row.lineSubtotal, 0)),
    [lineComputations],
  );
  const discount = Number(discountAmount) || 0;
  const grandTotal = roundMoney(Math.max(0, subtotal - discount));
  const hasLineItems = lines.length > 0;

  const handleSave = () => {
    const body: UpdateInvoiceBody = {
      dueDate: dueDate.trim() || undefined,
      notes: notes.trim() || undefined,
      discountAmount: discount,
    };
    if (hasLineItems) {
      body.lineItems = lines.map((draft, index) => {
        const computed = lineComputations[index]!;
        return {
          id: draft.id,
          modulesFee: computed.modulesFee,
          platformFee: computed.platformFee,
          aiToolsFee: computed.aiToolsFee,
          extraCharges: computed.extraCharges,
          chatCharges: computed.chatCharges,
        };
      });
    } else {
      body.totalAmount = grandTotal;
    }
    onSave(body);
  };

  const updateLine = (index: number, patch: Partial<LineDraft>) => {
    setLines((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const parentLabel =
    invoice.parentCompanyName?.trim() ||
    lines.find((line) => line.parentCompanyName)?.parentCompanyName ||
    null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
      <DashboardCard sx={{ p: 2 }}>
        <Typography fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
          Edit pending invoice
        </Typography>
        {parentLabel ? (
          <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary, mb: 0.35 }}>
            Parent company: {parentLabel}
          </Typography>
        ) : null}
        {invoice.invoiceNumber ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
            {invoice.invoiceNumber}
            {periodStart && periodEnd ? ` · ${periodStart} → ${periodEnd}` : ""}
          </Typography>
        ) : null}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5, mb: 2 }}>
          <InputField label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <InputField
            label="Discount"
            value={discountAmount}
            onChange={(e) => setDiscountAmount(e.target.value)}
            placeholder="0.00"
          />
        </Box>
        <InputField
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional note on invoice"
        />
      </DashboardCard>

      {hasLineItems
        ? lines.map((line, index) => {
            const computed = lineComputations[index]!;
            const profile = profileByWebsiteId.get(line.websiteId);
            return (
              <PerWebsiteBillingSetupCard
                key={line.id}
                subtitle={`${line.label}${
                  line.childCompanyName ? ` · ${line.childCompanyName}` : ""
                }${line.parentCompanyName ? ` · Parent: ${line.parentCompanyName}` : ""}`}
                websiteId={line.websiteId}
                selectedProfile={profile ?? undefined}
                rateValues={line}
                onRateChange={(patch) => updateLine(index, patch)}
                periodStart={periodStart}
                periodEnd={periodEnd}
                periodReadOnly
                invoiceEmails={line.invoiceEmails}
                onInvoiceEmailsChange={(value) => updateLine(index, { invoiceEmails: value })}
                previewInvoice={lineDraftToPreviewInvoice(invoice, line, computed)}
                previewTotalLabel="Line total"
              >
                <InputField
                  label="Extra charges"
                  value={line.extraCharges}
                  onChange={(e) => updateLine(index, { extraCharges: e.target.value })}
                  sx={{ maxWidth: 280 }}
                />
              </PerWebsiteBillingSetupCard>
            );
          })
        : null}

      <DashboardCard
        sx={{
          p: 1.5,
          border: `1px solid ${alpha(theme.app.dashboard.accentPurple, 0.35)}`,
          bgcolor: alpha(theme.app.dashboard.accentPurple, 0.08),
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            Subtotal
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.text.primary }}>
            {money(currency, subtotal)}
          </Typography>
        </Box>
        {discount > 0 ? (
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
              Discount
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.text.primary }}>
              −{money(currency, discount)}
            </Typography>
          </Box>
        ) : null}
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.text.primary }}>
            Total due
          </Typography>
          <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.text.primary }}>
            {money(currency, grandTotal)}
          </Typography>
        </Box>
      </DashboardCard>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          Save changes
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
