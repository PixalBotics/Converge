"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Link from "next/link";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  InputField,
  SelectField,
  Typography,
} from "@/components/common";
import { useAuth } from "@/lib/auth";
import { useCompaniesSetupResellersQuery } from "@/lib/hooks/query/companies/hooks";
import {
  useAgencyBillingContractQuery,
  useAgencyBillingPreviewQuery,
  useCreateParentInvoiceMutation,
  usePutAgencyBillingContractMutation,
  usePutParentCompanyBillingProfileMutation,
} from "@/lib/hooks/query/billing/billing";
import { PARENT_BILLING_MODE_AGENCY } from "@/lib/billing/parent-billing-mode";
import type { ParentBillingPreview } from "@/api/billing/agency-billing-contract.api";
import { putResellerClientModulePrices } from "@/api/companies/reseller-modules.api";
import { sumModulePrices, modulePricesFromReseller, type BillingRateFieldsValues } from "@/lib/billing/billing-rate-fields";
import { useResellerEnabledServices } from "@/lib/hooks/query/billing/use-reseller-enabled-services";
import { BillingRateFieldsForm } from "@/features/billing/components/BillingRateFieldsForm";
import { pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { BillingBackButton } from "@/features/billing/components/BillingBackButton";
import { ContractsHowItWorks } from "@/features/billing/components/ContractsHowItWorks";
import { ParentCompanyBillingCard } from "@/features/billing/components/ParentCompanyBillingCard";
import {
  contractsPageWrapper,
  contractsSectionCardSx,
} from "@/features/billing/website-contracts.styles";

function monthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

function formatPeriodLabel(start: string, end: string) {
  const s = new Date(`${start}T00:00:00Z`);
  const e = new Date(`${end}T00:00:00Z`);
  const sameMonth = s.getUTCFullYear() === e.getUTCFullYear() && s.getUTCMonth() === e.getUTCMonth();
  if (sameMonth) {
    return s.toLocaleDateString(undefined, { month: "long", year: "numeric", timeZone: "UTC" });
  }
  return `${start} → ${end}`;
}

export function WebsiteContractsPageClient() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const searchParams = useSearchParams();
  const range = useMemo(() => monthRange(), []);
  const { isPlatformAdmin, user } = useAuth();
  const canManage = isPlatformAdmin;
  const canEditClientBilling = isPlatformAdmin;

  const [pickedResellerId, setPickedResellerId] = useState("");
  const [periodStart, setPeriodStart] = useState(range.start);
  const [periodEnd, setPeriodEnd] = useState(range.end);
  const [currency, setCurrency] = useState("USD");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [costPerChat, setCostPerChat] = useState("0.4");
  const [freeChats, setFreeChats] = useState("50");
  const [monthlyChats, setMonthlyChats] = useState("");
  const [platformFee, setPlatformFee] = useState("60");
  const [aiToolsFee, setAiToolsFee] = useState("90");
  const [extraCharges, setExtraCharges] = useState("0");
  const [maxParentCompanies, setMaxParentCompanies] = useState("");
  const [agencyEmails, setAgencyEmails] = useState("");
  const [clientBillingMode, setClientBillingMode] = useState<"trial" | "live">("trial");
  const [clientTrialDays, setClientTrialDays] = useState("14");
  const [parentLimits, setParentLimits] = useState<Record<string, string>>({});
  const [parentEmails, setParentEmails] = useState<Record<string, string>>({});
  const [clientModulePrices, setClientModulePrices] = useState<Record<string, string>>({});

  const activeResellerId = pickedResellerId.trim();
  const periodLabel = formatPeriodLabel(periodStart, periodEnd);

  useEffect(() => {
    if (!isPlatformAdmin) return;
    const fromUrl = searchParams.get("resellerId")?.trim() ?? "";
    if (fromUrl) setPickedResellerId(fromUrl);
  }, [isPlatformAdmin, searchParams]);

  const resellersQuery = useCompaniesSetupResellersQuery({ enabled: isPlatformAdmin && canManage });
  const contractQuery = useAgencyBillingContractQuery(activeResellerId, {
    enabled: canManage && Boolean(activeResellerId),
  });
  const { enabledServices, isLoading: servicesLoading, clientModulePricesByCode, refetch: refetchResellerModules } =
    useResellerEnabledServices(activeResellerId, {
      enabled: canManage && Boolean(activeResellerId),
    });

  useEffect(() => {
    const c = contractQuery.data?.data;
    if (!c) return;
    setCurrency(c.currency ?? "USD");
    setBillingCycle((c.billingCycle === "yearly" ? "yearly" : "monthly") as "monthly" | "yearly");
    setCostPerChat(String(c.costPerChat ?? 0));
    setFreeChats(String(c.freeChatsPerMonth ?? 50));
    setMonthlyChats(c.monthlyChatsPerSite != null ? String(c.monthlyChatsPerSite) : "");
    setPlatformFee(String(c.platformFeeMonthly ?? 0));
    setAiToolsFee(String(c.aiToolsMonthly ?? 0));
    setExtraCharges(String(c.extraCharges ?? 0));
    setMaxParentCompanies(c.maxParentCompanies != null ? String(c.maxParentCompanies) : "");
    setAgencyEmails(c.invoiceToEmails ?? "");
    setClientBillingMode(c.clientBillingMode === "live" ? "live" : "trial");
    setClientTrialDays(String(c.clientTrialDays ?? 14));
  }, [contractQuery.data?.data]);

  useEffect(() => {
    if (!enabledServices.length) return;
    setClientModulePrices(
      modulePricesFromReseller(
        enabledServices.map((s) => s.code),
        clientModulePricesByCode,
      ),
    );
  }, [enabledServices, clientModulePricesByCode]);

  const previewQueryEnabled = canManage && Boolean(activeResellerId);

  const putContractMutation = usePutAgencyBillingContractMutation();
  const putParentMutation = usePutParentCompanyBillingProfileMutation();
  const createInvoiceMutation = useCreateParentInvoiceMutation();

  const liveModulesFeeMonthly = useMemo(
    () => sumModulePrices(enabledServices, clientModulePrices),
    [enabledServices, clientModulePrices],
  );

  const previewParams = useMemo(
    () => ({
      resellerId: activeResellerId,
      periodStart,
      periodEnd,
      costPerChat: Number(costPerChat) || 0,
      freeChatsPerMonth: Number(freeChats) || 0,
      monthlyChatsPerSite: monthlyChats.trim() ? Number(monthlyChats) || 0 : undefined,
      platformFeeMonthly: Number(platformFee) || 0,
      aiToolsMonthly: Number(aiToolsFee) || 0,
      extraCharges: isPlatformAdmin ? Number(extraCharges) || 0 : 0,
      modulesFeeMonthly: liveModulesFeeMonthly.anyTyped ? liveModulesFeeMonthly.sum : undefined,
    }),
    [
      activeResellerId,
      periodStart,
      periodEnd,
      costPerChat,
      freeChats,
      monthlyChats,
      platformFee,
      aiToolsFee,
      extraCharges,
      isPlatformAdmin,
      liveModulesFeeMonthly,
    ],
  );

  const previewQuery = useAgencyBillingPreviewQuery(previewParams, {
    enabled: previewQueryEnabled,
  });

  const preview = previewQuery.data?.data;
  const displayCurrency = preview?.currency ?? currency;

  const rateFormValues = useMemo(
    (): BillingRateFieldsValues => ({
      currency,
      billingCycle,
      clientBillingMode,
      clientTrialDays,
      costPerChat,
      freeChats,
      monthlyChats,
      platformFee,
      aiToolsFee,
      clientModulePrices,
    }),
    [
      currency,
      billingCycle,
      clientBillingMode,
      clientTrialDays,
      costPerChat,
      freeChats,
      monthlyChats,
      platformFee,
      aiToolsFee,
      clientModulePrices,
    ],
  );

  const handleRateFormChange = (patch: Partial<BillingRateFieldsValues>) => {
    if (patch.currency !== undefined) setCurrency(patch.currency);
    if (patch.billingCycle !== undefined) setBillingCycle(patch.billingCycle);
    if (patch.clientBillingMode !== undefined) setClientBillingMode(patch.clientBillingMode);
    if (patch.clientTrialDays !== undefined) setClientTrialDays(patch.clientTrialDays);
    if (patch.costPerChat !== undefined) setCostPerChat(patch.costPerChat);
    if (patch.freeChats !== undefined) setFreeChats(patch.freeChats);
    if (patch.monthlyChats !== undefined) setMonthlyChats(patch.monthlyChats);
    if (patch.platformFee !== undefined) setPlatformFee(patch.platformFee);
    if (patch.aiToolsFee !== undefined) setAiToolsFee(patch.aiToolsFee);
    if (patch.clientModulePrices !== undefined) setClientModulePrices(patch.clientModulePrices);
  };

  const websiteStatusSummary = useMemo(() => {
    const counts = { live: 0, trial: 0, grace: 0, suspended: 0, cancelled: 0, other: 0 };
    for (const parent of preview?.parents ?? []) {
      for (const site of parent.websites) {
        const status = site.billingStatus.trim().toLowerCase();
        if (status === "active") counts.live += 1;
        else if (status === "trial") counts.trial += 1;
        else if (status === "grace") counts.grace += 1;
        else if (status === "suspended") counts.suspended += 1;
        else if (status === "cancelled") counts.cancelled += 1;
        else counts.other += 1;
      }
    }
    return counts;
  }, [preview?.parents]);
  useEffect(() => {
    if (!preview?.parents) return;
    setParentLimits((prev) => {
      const next = { ...prev };
      for (const p of preview.parents) {
        if (next[p.parentCompanyId] === undefined) {
          next[p.parentCompanyId] = p.billingLimitMonthly != null ? String(p.billingLimitMonthly) : "";
        }
      }
      return next;
    });
    setParentEmails((prev) => {
      const next = { ...prev };
      for (const p of preview.parents) {
        if (next[p.parentCompanyId] === undefined) {
          next[p.parentCompanyId] = p.invoiceToEmails ?? "";
        }
      }
      return next;
    });
  }, [preview?.parents]);

  const resellerOptions = useMemo(() => {
    const items = pickItemsArray(resellersQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
    return [
      { value: "", label: resellersQuery.isLoading ? "Loading agencies…" : "Select agency" },
      ...items,
    ];
  }, [resellersQuery.data, resellersQuery.isLoading]);

  const handleSaveClientBilling = async () => {
    if (!activeResellerId || !canEditClientBilling) return;
    try {
      const parsedClientPrices: Record<string, number> = {};
      for (const service of enabledServices) {
        const raw = clientModulePrices[service.code]?.trim() ?? "";
        if (!raw) {
          publishAppToast({ message: `Set client rate for ${service.name}.`, variant: "error" });
          return;
        }
        const value = Number(raw);
        if (!Number.isFinite(value) || value < 0) {
          publishAppToast({ message: `Invalid client rate for ${service.name}.`, variant: "error" });
          return;
        }
        parsedClientPrices[service.code] = value;
      }
      if (Object.keys(parsedClientPrices).length > 0) {
        await putResellerClientModulePrices(activeResellerId, parsedClientPrices);
      }
      await putContractMutation.mutateAsync({
        resellerId: activeResellerId,
        currency: currency.trim().toUpperCase(),
        billingCycle,
        costPerChat: Number(costPerChat) || 0,
        freeChatsPerMonth: Number(freeChats) || 0,
        monthlyChatsPerSite: monthlyChats.trim() ? Number(monthlyChats) || 0 : undefined,
        platformFeeMonthly: Number(platformFee) || 0,
        aiToolsMonthly: Number(aiToolsFee) || 0,
        invoiceToEmails: agencyEmails.trim() || undefined,
        clientBillingMode,
        clientTrialDays: clientBillingMode === "trial" ? Number(clientTrialDays) || 14 : undefined,
      });
      publishAppToast({
        message:
          clientBillingMode === "trial"
            ? `Client billing saved. Websites on ${clientTrialDays || 14}-day trial — reminder emails will be sent before trial ends.`
            : "Client billing saved. All client websites set to Live billing.",
        variant: "success",
      });
      void refetchResellerModules();
      void previewQuery.refetch();
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Could not save client billing.",
        variant: "error",
      });
    }
  };

  const handleSavePlatformLimits = async () => {
    if (!activeResellerId || !isPlatformAdmin) return;
    try {
      await putContractMutation.mutateAsync({
        resellerId: activeResellerId,
        extraCharges: Number(extraCharges) || 0,
        maxParentCompanies: maxParentCompanies.trim() ? Number(maxParentCompanies) : undefined,
      });
      publishAppToast({ message: "Platform limits saved.", variant: "success" });
      void previewQuery.refetch();
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Could not save platform limits.",
        variant: "error",
      });
    }
  };

  const handleSaveParent = async (parent: ParentBillingPreview) => {
    const emailValue = parentEmails[parent.parentCompanyId]?.trim() ?? "";
    await putParentMutation.mutateAsync({
      parentCompanyId: parent.parentCompanyId,
      billingLimitMonthly: Number(parentLimits[parent.parentCompanyId]) || undefined,
      invoiceToEmails: emailValue || undefined,
      status: PARENT_BILLING_MODE_AGENCY,
    });
  };

  const handleSaveAndSendInvoice = async (parent: ParentBillingPreview) => {
    const emailValue = parentEmails[parent.parentCompanyId]?.trim() ?? "";
    if (!emailValue) {
      publishAppToast({
        message: "Add client invoice email before sending.",
        variant: "error",
      });
      return;
    }
    try {
      await handleSaveParent(parent);
      const res = await createInvoiceMutation.mutateAsync({
        parentCompanyId: parent.parentCompanyId,
        periodStart,
        periodEnd,
        issueNow: true,
      });
      publishAppToast({
        message: "Invoice created and emailed to the client.",
        variant: "success",
      });
      void previewQuery.refetch();
      router.push(`/dashboard/billing/invoices/${res.data.invoiceId}`);
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Could not save and send invoice.",
        variant: "error",
      });
    }
  };

  const handleUpdateClientSettings = async (parent: ParentBillingPreview) => {
    try {
      await handleSaveParent(parent);
      publishAppToast({ message: "Client settings updated.", variant: "success" });
      void previewQuery.refetch();
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Could not update client settings.",
        variant: "error",
      });
    }
  };

  if (!canManage) {
    return (
      <Box sx={contractsPageWrapper}>
        <Typography sx={{ color: theme.app.dashboard.textMuted }}>
          Only Platform Admins can manage agency contracts.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={contractsPageWrapper}>
      <BillingBackButton />
      <Typography variant="regularLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
        Agency contracts
      </Typography>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1.5, maxWidth: 720, lineHeight: 1.6 }}>
        Set how your agency bills clients. Platform SaaS subscription is separate under{" "}
        <Link href="/dashboard/billing" style={{ color: theme.app.dashboard.accentPurple }}>
          Billing → Subscription
        </Link>
        .
      </Typography>

      <ContractsHowItWorks />

      {isPlatformAdmin ? (
        <DashboardCard sx={{ ...contractsSectionCardSx, mb: 2 }}>
          <SelectField
            label="Agency"
            value={pickedResellerId}
            onChange={setPickedResellerId}
            options={resellerOptions}
          />
        </DashboardCard>
      ) : null}

      {activeResellerId ? (
        <>
          <DashboardCard sx={{ ...contractsSectionCardSx, mb: 2 }}>
            <Typography fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
              Client billing setup (per website)
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
              These rates apply to every website under your agency. Invoice preview updates live below.
            </Typography>
            {preview ? (
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
                Website status: Live {websiteStatusSummary.live}, Trial {websiteStatusSummary.trial}, Grace{" "}
                {websiteStatusSummary.grace}, Suspended {websiteStatusSummary.suspended}
                {websiteStatusSummary.cancelled ? `, Cancelled ${websiteStatusSummary.cancelled}` : ""}
                {websiteStatusSummary.other ? `, Other ${websiteStatusSummary.other}` : ""}. Each website row below also
                shows its current status badge.
              </Typography>
            ) : null}

            <BillingRateFieldsForm
              values={rateFormValues}
              onChange={handleRateFormChange}
              onModulePriceChange={(code, value) =>
                setClientModulePrices((prev) => ({ ...prev, [code]: value }))
              }
              enabledServices={enabledServices}
              displayCurrency={displayCurrency}
              disabled={!canEditClientBilling}
              showPeriodBanner
              periodLabel={periodLabel}
              periodStart={periodStart}
              periodEnd={periodEnd}
              onPeriodStartChange={setPeriodStart}
              onPeriodEndChange={setPeriodEnd}
              showInvoiceEmails
              invoiceEmails={agencyEmails}
              onInvoiceEmailsChange={(v) => setAgencyEmails(v)}
              servicesLoading={servicesLoading}
            />
            {canEditClientBilling ? (
              <Button
                variant="primary"
                onClick={() => void handleSaveClientBilling()}
                disabled={putContractMutation.isPending}
                sx={{ mt: 1.5 }}
              >
                Save client billing
              </Button>
            ) : null}
          </DashboardCard>

          {isPlatformAdmin ? (
            <DashboardCard sx={{ ...contractsSectionCardSx, mb: 2 }}>
              <Typography fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
                Platform limits (internal)
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
                Internal platform controls only. Does not change what clients see on invoices.
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
                <InputField label="Extra / site (hidden from agency)" value={extraCharges} onChange={(e) => setExtraCharges(e.target.value)} />
                <InputField
                  label="Max parent companies"
                  value={maxParentCompanies}
                  onChange={(e) => setMaxParentCompanies(e.target.value)}
                  placeholder="Unlimited"
                />
              </Box>
              <Button variant="secondary" onClick={() => void handleSavePlatformLimits()} disabled={putContractMutation.isPending} sx={{ mt: 1.5 }}>
                Save platform limits
              </Button>
            </DashboardCard>
          ) : null}

          <Typography variant="mediumLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 1.5, mt: 0.5 }}>
            Client invoices
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
            Clients on agency contract get one combined invoice per month. Clients not on agency contract are billed per
            website from{" "}
            <Link href="/dashboard/billing/create-invoice" style={{ color: theme.app.dashboard.accentPurple }}>
              Per-website invoice
            </Link>
            .
          </Typography>

          {preview ? (
            <Box sx={{ mb: 2, px: 0.5 }}>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                <strong>{preview.resellerName}</strong> · {preview.totalWebsites} websites across{" "}
                {preview.parentCompanyCount} clients · Period {periodLabel}
              </Typography>
            </Box>
          ) : null}

          {previewQuery.isLoading ? (
            <Typography sx={{ color: theme.app.dashboard.textMuted }}>Calculating preview…</Typography>
          ) : (
            preview?.parents.map((parent) => (
              <ParentCompanyBillingCard
                key={parent.parentCompanyId}
                parent={parent}
                currency={displayCurrency}
                periodLabel={periodLabel}
                periodStart={periodStart}
                periodEnd={periodEnd}
                agencyFreeChats={Number(freeChats) || 0}
                agencyCostPerChat={Number(costPerChat) || 0}
                limitInput={parentLimits[parent.parentCompanyId] ?? ""}
                emailInput={parentEmails[parent.parentCompanyId] ?? ""}
                onLimitChange={(v) => setParentLimits((prev) => ({ ...prev, [parent.parentCompanyId]: v }))}
                onEmailChange={(v) => setParentEmails((prev) => ({ ...prev, [parent.parentCompanyId]: v }))}
                onSaveAndSendInvoice={() => void handleSaveAndSendInvoice(parent)}
                onUpdateSettings={() => void handleUpdateClientSettings(parent)}
                onRatesSaved={() => void previewQuery.refetch()}
                saving={putParentMutation.isPending || createInvoiceMutation.isPending}
              />
            ))
          )}
        </>
      ) : (
        <DashboardCard sx={{ p: 3 }}>
          <Typography sx={{ color: theme.app.dashboard.textMuted }}>Select an agency to configure billing.</Typography>
        </DashboardCard>
      )}
    </Box>
  );
}
