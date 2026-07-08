"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, InputField, SelectField, Typography } from "@/components/common";
import { BillingBackButton } from "@/features/billing/components/BillingBackButton";
import { BillingRateFieldsForm } from "@/features/billing/components/BillingRateFieldsForm";
import { InvoiceItemizedTable } from "@/features/billing/components/InvoiceItemizedTable";
import { WebsiteBillingStatusBadge } from "@/features/billing/components/WebsiteBillingStatusBadge";
import {
  contractsPageWrapper,
  contractsSectionCardSx,
} from "@/features/billing/website-contracts.styles";
import {
  useAgencyBillingContractQuery,
  useWebsiteBillingProfilesQuery,
  useWebsiteBillingProfileQuery,
  useCreateInvoiceMutation,
  useWebsiteInvoicePreviewQuery,
  usePutWebsiteBillingProfileMutation,
} from "@/lib/hooks/query/billing/billing";
import {
  defaultBillingRateFields,
  sumModulePrices,
  type BillingRateFieldsValues,
} from "@/lib/billing/billing-rate-fields";
import {
  formatBillingPeriodLabel,
  invoiceEmailsFromProfile,
  mergeContractProfileRates,
} from "@/lib/billing/merge-billing-rate-values";
import { useResellerEnabledServices } from "@/lib/hooks/query/billing/use-reseller-enabled-services";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { useAuth } from "@/lib/auth";
import type { InvoiceView } from "@/api/billing/invoice.api";
import { isParentOnAgencyContract } from "@/lib/billing/parent-billing-mode";

function monthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function money(currency: string, amount: number) {
  return `${currency} ${amount.toFixed(2)}`;
}

export function CreateInvoicePageClient() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { isPlatformAdmin, user } = useAuth();
  const range = useMemo(() => monthRange(), []);

  const [websiteId, setWebsiteId] = useState("");
  const [periodStart, setPeriodStart] = useState(range.start);
  const [periodEnd, setPeriodEnd] = useState(range.end);
  const [extraCharges, setExtraCharges] = useState("0");
  const [notes, setNotes] = useState("");
  const [issueNow, setIssueNow] = useState("yes");
  const [invoiceEmails, setInvoiceEmails] = useState("");
  const [rateValues, setRateValues] = useState<BillingRateFieldsValues>(() => defaultBillingRateFields());

  const resellerId = user?.resellerId?.trim() ?? "";
  const profilesQuery = useWebsiteBillingProfilesQuery(
    !isPlatformAdmin && resellerId ? { resellerId } : {},
  );
  const profileQuery = useWebsiteBillingProfileQuery(websiteId, { enabled: Boolean(websiteId) });
  const selectedProfile = profileQuery.data?.data;
  const activeResellerId = selectedProfile?.resellerId ?? resellerId;

  const contractQuery = useAgencyBillingContractQuery(activeResellerId, {
    enabled: Boolean(activeResellerId),
  });
  const createMutation = useCreateInvoiceMutation();
  const saveRatesMutation = usePutWebsiteBillingProfileMutation();
  const { enabledServices, clientModulePricesByCode, isLoading: servicesLoading } =
    useResellerEnabledServices(activeResellerId, { enabled: Boolean(activeResellerId) });

  const websiteOptions = useMemo(() => {
    const items = (profilesQuery.data?.data ?? []).filter(
      (p) => !isParentOnAgencyContract({ parentOnAgencyContract: p.parentOnAgencyContract }),
    );
    return [
      { value: "", label: "Select website" },
      ...items.map((p) => ({
        value: p.websiteId,
        label: `${p.websiteName ?? p.websiteUrl} (${p.parentCompanyName} · ${p.companyName})`,
      })),
    ];
  }, [profilesQuery.data?.data]);

  const agencyContractWebsiteCount = useMemo(() => {
    return (profilesQuery.data?.data ?? []).filter((p) =>
      isParentOnAgencyContract({ parentOnAgencyContract: p.parentOnAgencyContract }),
    ).length;
  }, [profilesQuery.data?.data]);

  const contract = contractQuery.data?.data;
  const periodLabel = formatBillingPeriodLabel(periodStart, periodEnd);
  const displayCurrency = rateValues.currency;

  useEffect(() => {
    if (!activeResellerId) return;
    if (!contract && !selectedProfile) return;
    setRateValues(
      mergeContractProfileRates(contract, selectedProfile, enabledServices, clientModulePricesByCode),
    );
    setInvoiceEmails(invoiceEmailsFromProfile(selectedProfile, contract));
  }, [activeResellerId, contract, selectedProfile, enabledServices, clientModulePricesByCode]);

  const modulesFeeMonthly = useMemo(() => {
    const { sum, anyTyped } = sumModulePrices(enabledServices, rateValues.clientModulePrices);
    if (anyTyped) return sum;
    const combined = rateValues.clientModulePrices._combined?.trim();
    if (combined) return Number(combined) || 0;
    return Number(selectedProfile?.modulesFeeMonthly) || 0;
  }, [enabledServices, rateValues.clientModulePrices, selectedProfile?.modulesFeeMonthly]);

  const modulesFeeOverride = useMemo(() => {
    const { anyTyped } = sumModulePrices(enabledServices, rateValues.clientModulePrices);
    const combined = rateValues.clientModulePrices._combined?.trim();
    if (anyTyped || combined) return modulesFeeMonthly;
    return undefined;
  }, [enabledServices, rateValues.clientModulePrices, modulesFeeMonthly]);

  const monthlyChatsPerSite = rateValues.monthlyChats.trim()
    ? Number(rateValues.monthlyChats) || 0
    : selectedProfile?.monthlyChatsPerSite ?? contract?.monthlyChatsPerSite ?? undefined;

  const previewParams = useMemo(
    () => ({
      websiteId,
      periodStart,
      periodEnd,
      extraCharges: Number(extraCharges) || 0,
      costPerChat: Number(rateValues.costPerChat) || 0,
      freeChatsPerMonth: Number(rateValues.freeChats) || 0,
      platformFeeMonthly: Number(rateValues.platformFee) || 0,
      aiToolsMonthly: Number(rateValues.aiToolsFee) || 0,
      ...(modulesFeeOverride != null ? { modulesFeeMonthly: modulesFeeOverride } : {}),
      ...(monthlyChatsPerSite != null ? { monthlyChatsPerSite } : {}),
    }),
    [websiteId, periodStart, periodEnd, extraCharges, rateValues, modulesFeeOverride, monthlyChatsPerSite],
  );

  const previewQuery = useWebsiteInvoicePreviewQuery(previewParams, {
    enabled: Boolean(websiteId),
  });
  const preview = previewQuery.data?.data;

  const previewInvoice: InvoiceView | null = preview
    ? {
        id: preview.websiteId,
        invoiceNumber: null,
        status: "draft",
        currency: preview.currency,
        companyId: preview.companyId,
        companyName: preview.companyName,
        websiteId: preview.websiteId,
        websiteName: preview.websiteName,
        websiteUrl: preview.websiteUrl,
        resellerId: activeResellerId || null,
        resellerName: null,
        parentCompanyId: preview.parentCompanyId,
        parentCompanyName: preview.parentCompanyName,
        periodStart,
        periodEnd,
        totalChats: preview.totalChats,
        billableChats: preview.billableChats,
        freeChatsIncluded: preview.freeChatsPerMonth,
        costPerChat: preview.costPerChat,
        platformFee: preview.platformFee,
        aiToolsFee: preview.aiToolsFee,
        extraCharges: preview.extraCharges,
        subtotal: preview.subtotal,
        discountAmount: preview.discountTotal,
        totalAmount: preview.totalAmount,
        issuedDate: "",
        dueDate: null,
        paidDate: null,
        notes: null,
        publicPaymentToken: null,
        isAgencySelfBill: false,
        lineItems: [
          {
            id: preview.websiteId,
            websiteId: preview.websiteId,
            websiteUrl: preview.websiteUrl,
            websiteName: preview.websiteName,
            childCompanyName: preview.companyName,
            totalChats: preview.totalChats,
            billableChats: preview.billableChats,
            chargeableChats: preview.chargeableChats,
            costPerChat: preview.costPerChat,
            chatCharges: preview.chatCharges,
            platformFee: preview.platformFee,
            aiToolsFee: preview.aiToolsFee,
            extraCharges: preview.extraCharges,
            modulesFee: preview.modulesFee,
            lineTotal: preview.totalAmount,
          },
        ],
      }
    : null;

  const handleSaveRates = async () => {
    if (!websiteId) {
      publishAppToast({ message: "Select a website first.", variant: "error" });
      return;
    }
    try {
      await saveRatesMutation.mutateAsync({
        websiteId,
        costPerChat: Number(rateValues.costPerChat) || 0,
        freeChatsPerMonth: Number(rateValues.freeChats) || 0,
        monthlyChatsPerSite: rateValues.monthlyChats.trim()
          ? Number(rateValues.monthlyChats) || 0
          : undefined,
        platformFeeMonthly: Number(rateValues.platformFee) || 0,
        aiToolsMonthly: Number(rateValues.aiToolsFee) || 0,
        modulesFeeMonthly: modulesFeeOverride ?? modulesFeeMonthly,
        currency: rateValues.currency,
        billingCycle: rateValues.billingCycle,
        invoiceToEmails: invoiceEmails.trim() || undefined,
      });
      publishAppToast({ message: "Website rates saved.", variant: "success" });
      void profileQuery.refetch();
      void profilesQuery.refetch();
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Could not save website rates.",
        variant: "error",
      });
    }
  };

  const handleSubmit = async () => {
    if (!websiteId) {
      publishAppToast({ message: "Select a website.", variant: "error" });
      return;
    }
    try {
      await createMutation.mutateAsync({
        websiteId,
        periodStart,
        periodEnd,
        extraCharges: Number(extraCharges) || 0,
        notes: notes.trim() || undefined,
        issueNow: issueNow === "yes",
        costPerChat: Number(rateValues.costPerChat) || 0,
        freeChatsPerMonth: Number(rateValues.freeChats) || 0,
        platformFeeMonthly: Number(rateValues.platformFee) || 0,
        aiToolsMonthly: Number(rateValues.aiToolsFee) || 0,
        modulesFeeMonthly: modulesFeeOverride ?? modulesFeeMonthly,
        monthlyChatsPerSite: monthlyChatsPerSite ?? undefined,
      });
      publishAppToast({ message: "Invoice created.", variant: "success" });
      router.push("/dashboard/billing");
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Could not create invoice.",
        variant: "error",
      });
    }
  };

  return (
    <Box sx={contractsPageWrapper}>
      <BillingBackButton />
      <Typography variant="regularLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
        Per-website invoice
      </Typography>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 2, maxWidth: 720, lineHeight: 1.6 }}>
        Use this when a client is <strong>not</strong> on agency contract billing. Pick one website, set rates, and
        create a single-site invoice. Clients on agency contract are billed from{" "}
        <Box component="span" sx={{ color: theme.app.dashboard.accentPurple, fontWeight: 600 }}>
          Agency contracts
        </Box>{" "}
        (one combined invoice for all their websites).
      </Typography>

      <DashboardCard sx={contractsSectionCardSx}>
        <Typography fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
          Website billing setup
        </Typography>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
          Only websites whose client is not on agency contract are listed below.
          {agencyContractWebsiteCount > 0
            ? ` ${agencyContractWebsiteCount} website${agencyContractWebsiteCount === 1 ? "" : "s"} hidden (agency contract clients).`
            : ""}
        </Typography>

        <SelectField
          label="Website"
          value={websiteId}
          onChange={setWebsiteId}
          options={websiteOptions}
        />

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
        ) : (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            Select a website to load its profile and preview the invoice total.
          </Typography>
        )}

        <BillingRateFieldsForm
          values={rateValues}
          onChange={(patch) => setRateValues((prev) => ({ ...prev, ...patch }))}
          onModulePriceChange={(code, value) =>
            setRateValues((prev) => ({
              ...prev,
              clientModulePrices: { ...prev.clientModulePrices, [code]: value },
            }))
          }
          enabledServices={enabledServices}
          displayCurrency={displayCurrency}
          servicesLoading={servicesLoading}
          showPeriodBanner
          periodLabel={periodLabel}
          periodStart={periodStart}
          periodEnd={periodEnd}
          onPeriodStartChange={setPeriodStart}
          onPeriodEndChange={setPeriodEnd}
          showInvoiceEmails
          invoiceEmails={invoiceEmails}
          onInvoiceEmailsChange={setInvoiceEmails}
        />

        <Button
          variant="primary"
          onClick={() => void handleSaveRates()}
          disabled={saveRatesMutation.isPending || !websiteId}
          sx={{ alignSelf: "flex-start" }}
        >
          Save client billing
        </Button>

        {websiteId && previewQuery.isLoading ? (
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
                Invoice preview
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.text.primary }}>
                {money(preview!.currency, preview!.totalAmount)}
              </Typography>
            </Box>
            <Box sx={{ bgcolor: "#fff", borderRadius: 1, overflow: "hidden", mb: 1 }}>
              <InvoiceItemizedTable invoice={previewInvoice} />
            </Box>
            {preview!.discountTotal > 0 ? (
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
                Discount: −{money(preview!.currency, preview!.discountTotal)}
              </Typography>
            ) : null}
            {preview!.existingInvoice ? (
              <Typography variant="caption" sx={{ color: "#f59e0b", display: "block", mt: 0.5 }}>
                Invoice already exists for this period (
                {preview!.existingInvoice.invoiceNumber ?? preview!.existingInvoice.id.slice(0, 8)} ·{" "}
                {preview!.existingInvoice.status})
              </Typography>
            ) : null}
          </Box>
        ) : null}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <InputField
            label="Extra charges"
            value={extraCharges}
            onChange={(e) => setExtraCharges(e.target.value)}
          />
          <SelectField
            label="Issue immediately"
            value={issueNow}
            onChange={setIssueNow}
            options={[
              { value: "yes", label: "Yes — notify client" },
              { value: "no", label: "No — save as draft" },
            ]}
          />
        </Box>

        <InputField
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          minRows={3}
        />

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button variant="primary" onClick={() => void handleSubmit()} disabled={createMutation.isPending}>
            Create invoice
          </Button>
          <Button variant="secondary" onClick={() => router.push("/dashboard/billing")}>
            Cancel
          </Button>
        </Box>
      </DashboardCard>
    </Box>
  );
}
