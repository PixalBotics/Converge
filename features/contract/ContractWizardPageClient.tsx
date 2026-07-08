"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Check from "@mui/icons-material/Check";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, InputField, SelectField, Typography } from "@/components/common";
import { CompanySetupWizardModal } from "@/app/dashboard/companies/components/CompanySetupWizardModal";
import {
  ResellerModulesPanel,
  type ResellerModulesPanelHandle,
} from "@/features/companies/components/ResellerModulesPanel";
import { BillingBackButton } from "@/features/billing/components/BillingBackButton";
import { BillingRateFieldsForm } from "@/features/billing/components/BillingRateFieldsForm";
import {
  contractsLimitPanelSx,
  contractsPageWrapper,
  contractsSectionCardSx,
} from "@/features/billing/website-contracts.styles";
import {
  distributionStepCardSx,
  distributionStepNumberSx,
  distributionStepperGridSx,
  distributionStepperProgressFillSx,
  distributionStepperProgressTrackSx,
  distributionStepperRootSx,
} from "@/features/distribution-setup/styles/distribution-wizard-ui.styles";
import { contractFooterRow } from "@/features/contract/contract-wizard.styles";
import { useAuth } from "@/lib/auth";
import { canCompaniesModuleAction } from "@/lib/permissions";
import type { CompanySetupSubmitResult } from "@/lib/companies/parse-company-setup-submit";
import { getResellerModules, getResellerModulesCatalog, putResellerClientModulePrices } from "@/api/companies/reseller-modules.api";
import { usePutAgencyBillingContractMutation } from "@/lib/hooks/query/billing/billing";
import {
  defaultBillingRateFields,
  type BillingRateFieldsValues,
} from "@/lib/billing/billing-rate-fields";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { mergeSx } from "@/lib/mui/merge-sx";

const STEPS = [
  { n: 1, label: "Reseller / Parent", hint: "Agency" },
  { n: 2, label: "Child companies", hint: "Clients" },
  { n: 3, label: "Services", hint: "Products" },
  { n: 4, label: "Billing", hint: "Rates" },
  { n: 5, label: "Trial / Live", hint: "Launch" },
] as const;

const DEFAULT_BILLING: BillingRateFieldsValues = {
  ...defaultBillingRateFields(),
  costPerChat: "0.4",
  freeChats: "50",
  platformFee: "60",
  aiToolsFee: "90",
};

export function ContractWizardPageClient() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { user, hasPage, hasOperational } = useAuth();
  const isInternalUser = user?.userType === "Internal";
  const canManage = isInternalUser;
  const canCreateOrg = canCompaniesModuleAction(hasPage, hasOperational, "create");

  const [contractStep, setContractStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [orgResult, setOrgResult] = useState<CompanySetupSubmitResult | null>(null);
  const [billing, setBilling] = useState<BillingRateFieldsValues>(DEFAULT_BILLING);
  const [agencyEmails, setAgencyEmails] = useState("");
  const [completing, setCompleting] = useState(false);

  const modulesPanelRef = useRef<ResellerModulesPanelHandle>(null);
  const putContractMutation = usePutAgencyBillingContractMutation();

  const activeResellerId = orgResult?.resellerId ?? "";
  const progressPct = (contractStep / STEPS.length) * 100;

  const modulesCatalogQuery = useQuery({
    queryKey: ["reseller-modules-catalog"],
    queryFn: getResellerModulesCatalog,
    enabled: contractStep >= 4 && Boolean(activeResellerId),
  });

  const resellerModulesQuery = useQuery({
    queryKey: ["reseller-modules", activeResellerId],
    queryFn: () => getResellerModules(activeResellerId),
    enabled: contractStep >= 4 && Boolean(activeResellerId),
  });

  const enabledServices = useMemo(() => {
    const catalog = modulesCatalogQuery.data?.data.modules ?? [];
    const enabled = new Set(resellerModulesQuery.data?.data.moduleCodes ?? []);
    return catalog.filter((m) => enabled.has(m.code)).map((m) => ({ code: m.code, name: m.name }));
  }, [modulesCatalogQuery.data?.data.modules, resellerModulesQuery.data?.data.moduleCodes]);

  useEffect(() => {
    const data = resellerModulesQuery.data?.data;
    if (!data || contractStep < 4) return;
    setBilling((prev) => {
      const nextPrices = { ...prev.clientModulePrices };
      let changed = false;
      for (const code of data.moduleCodes ?? []) {
        if (nextPrices[code] !== undefined && nextPrices[code] !== "") continue;
        const value = data.clientModulePricesByCode?.[code];
        if (typeof value === "number") {
          nextPrices[code] = String(value);
          changed = true;
        }
      }
      return changed ? { ...prev, clientModulePrices: nextPrices } : prev;
    });
  }, [resellerModulesQuery.data?.data, contractStep]);

  const handleOrgComplete = useCallback((result: CompanySetupSubmitResult) => {
    setOrgResult(result);
    setContractStep(3);
    publishAppToast({
      message: "Organization created. Choose services for this agency.",
      variant: "success",
    });
  }, []);

  const handleWizardStepChange = useCallback((step: 1 | 2) => {
    setContractStep(step);
  }, []);

  const handleBillingChange = useCallback((patch: Partial<BillingRateFieldsValues>) => {
    setBilling((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleModulePriceChange = useCallback((code: string, value: string) => {
    setBilling((prev) => ({
      ...prev,
      clientModulePrices: { ...prev.clientModulePrices, [code]: value },
    }));
  }, []);

  const validateBillingRates = useCallback((): boolean => {
    for (const service of enabledServices) {
      const raw = billing.clientModulePrices[service.code]?.trim() ?? "";
      if (!raw) {
        publishAppToast({ message: `Set client rate for ${service.name}.`, variant: "error" });
        return false;
      }
      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0) {
        publishAppToast({ message: `Invalid client rate for ${service.name}.`, variant: "error" });
        return false;
      }
    }
    return true;
  }, [billing.clientModulePrices, enabledServices]);

  const saveBillingContract = useCallback(async () => {
    if (!activeResellerId) return false;
    const parsedClientPrices: Record<string, number> = {};
    for (const service of enabledServices) {
      const raw = billing.clientModulePrices[service.code]?.trim() ?? "";
      const value = Number(raw);
      parsedClientPrices[service.code] = value;
    }
    if (Object.keys(parsedClientPrices).length > 0) {
      await putResellerClientModulePrices(activeResellerId, parsedClientPrices);
    }
    await putContractMutation.mutateAsync({
      resellerId: activeResellerId,
      currency: billing.currency.trim().toUpperCase(),
      billingCycle: billing.billingCycle,
      costPerChat: Number(billing.costPerChat) || 0,
      freeChatsPerMonth: Number(billing.freeChats) || 0,
      monthlyChatsPerSite: billing.monthlyChats.trim() ? Number(billing.monthlyChats) || 0 : undefined,
      platformFeeMonthly: Number(billing.platformFee) || 0,
      aiToolsMonthly: Number(billing.aiToolsFee) || 0,
      invoiceToEmails: agencyEmails.trim() || undefined,
      clientBillingMode: billing.clientBillingMode,
      clientTrialDays: billing.clientBillingMode === "trial" ? Number(billing.clientTrialDays) || 14 : undefined,
    });
    return true;
  }, [
    activeResellerId,
    agencyEmails,
    billing,
    enabledServices,
    putContractMutation,
  ]);

  const handleCompleteContract = async () => {
    if (!activeResellerId) return;
    setCompleting(true);
    try {
      if (!validateBillingRates()) return;
      await saveBillingContract();
      publishAppToast({
        message:
          billing.clientBillingMode === "trial"
            ? `Contract complete. Websites on ${billing.clientTrialDays || 14}-day trial.`
            : "Contract complete. All websites set to Live billing.",
        variant: "success",
      });
      router.push(
        `/dashboard/billing/website-contracts?resellerId=${encodeURIComponent(activeResellerId)}`,
      );
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Could not complete contract.",
        variant: "error",
      });
    } finally {
      setCompleting(false);
    }
  };

  const handleServicesContinue = async () => {
    const ok = await modulesPanelRef.current?.save();
    if (ok === false) return;
    if (ok === undefined) {
      setContractStep(4);
      return;
    }
    setContractStep(4);
  };

  if (!canManage || !canCreateOrg) {
    return (
      <Box sx={contractsPageWrapper}>
        <Typography sx={{ color: theme.app.dashboard.textMuted }}>
          New contract is for platform internal users only. Reseller accounts cannot access this page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={contractsPageWrapper}>
      <BillingBackButton href="/dashboard/companies" label="← Back to companies" />

      <Typography variant="regularLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
        New contract
      </Typography>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1.5, maxWidth: 720, lineHeight: 1.6 }}>
        Add reseller, companies, services, billing, and trial/live status in one flow — no need to visit
        separate pages.
      </Typography>

      <Box sx={distributionStepperRootSx}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 1.25,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="small" fontWeight={600} sx={{ color: theme.app.dashboard.textMuted }}>
            Step {contractStep} of {STEPS.length}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.primary.light, fontWeight: 600 }}>
            {Math.round(progressPct)}% complete
          </Typography>
        </Box>

        <Box sx={distributionStepperProgressTrackSx}>
          <Box sx={distributionStepperProgressFillSx(progressPct)} />
        </Box>

        <Box sx={distributionStepperGridSx}>
          {STEPS.map((step) => {
            const state = contractStep > step.n ? "done" : contractStep === step.n ? "active" : "upcoming";
            return (
              <Box key={step.n} sx={mergeSx(distributionStepCardSx(state), { textAlign: "left", width: "100%" })}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={distributionStepNumberSx(state)}>
                    {state === "done" ? <Check sx={{ fontSize: 16 }} /> : String(step.n).padStart(2, "0")}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        state === "active"
                          ? theme.palette.primary.light
                          : theme.app.dashboard.textMuted,
                      fontWeight: state === "active" ? 700 : 500,
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                      fontSize: 10,
                    }}
                  >
                    {step.hint}
                  </Typography>
                </Box>
                <Typography
                  variant="small"
                  fontWeight={state === "active" ? 700 : 600}
                  sx={{
                    color:
                      state === "upcoming"
                        ? theme.app.dashboard.textMuted
                        : theme.app.dashboard.white95,
                    lineHeight: 1.3,
                  }}
                >
                  {step.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      <DashboardCard sx={contractsSectionCardSx}>
        {contractStep <= 2 ? (
          <CompanySetupWizardModal
            embedded
            open
            draftId={null}
            hideInternalStepper
            onClose={() => router.push("/dashboard/companies")}
            onContractOrgComplete={handleOrgComplete}
            onWizardStepChange={handleWizardStepChange}
          />
        ) : null}

        {contractStep === 3 && orgResult ? (
          <>
            <Typography fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
              Services
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
              Agency: <strong>{orgResult.parentCompanyName}</strong> — pick which products this reseller can sell.
            </Typography>
            <ResellerModulesPanel
              ref={modulesPanelRef}
              resellerId={orgResult.resellerId}
              resellerName={orgResult.parentCompanyName}
              embedded
              promptOfferingType
              hideSaveButton
            />
            <Box sx={contractFooterRow}>
              <Button variant="secondary" onClick={() => setContractStep(2)}>
                Back
              </Button>
              <Button variant="primary" onClick={() => void handleServicesContinue()}>
                Continue to billing
              </Button>
            </Box>
          </>
        ) : null}

        {contractStep === 4 && orgResult ? (
          <>
            <Typography fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
              Client billing setup
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
              Set client billing rates for <strong>{orgResult.parentCompanyName}</strong>. Trial vs live is
              configured in the next step.
            </Typography>
            <BillingRateFieldsForm
              values={billing}
              onChange={handleBillingChange}
              onModulePriceChange={handleModulePriceChange}
              enabledServices={enabledServices}
              servicesLoading={modulesCatalogQuery.isLoading || resellerModulesQuery.isLoading}
              showBillingMode={false}
              showInvoiceEmails
              invoiceEmails={agencyEmails}
              onInvoiceEmailsChange={setAgencyEmails}
            />
            <Box sx={contractFooterRow}>
              <Button variant="secondary" onClick={() => setContractStep(3)}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (!validateBillingRates()) return;
                  setContractStep(5);
                }}
              >
                Continue to trial / live
              </Button>
            </Box>
          </>
        ) : null}

        {contractStep === 5 && orgResult ? (
          <>
            <Typography fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
              Trial / Live launch
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
              Choose whether client websites start on trial or go live immediately.
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5, mb: 2, maxWidth: 520 }}>
              <SelectField
                label="Client billing mode"
                value={billing.clientBillingMode}
                onChange={(v) => handleBillingChange({ clientBillingMode: v === "live" ? "live" : "trial" })}
                options={[
                  { value: "trial", label: "Trial" },
                  { value: "live", label: "Live (full billing)" },
                ]}
                searchable={false}
              />
              {billing.clientBillingMode === "trial" ? (
                <InputField
                  label="Trial days"
                  value={billing.clientTrialDays}
                  onChange={(e) => handleBillingChange({ clientTrialDays: e.target.value })}
                  placeholder="14"
                  helperText="Reminder emails are sent before trial ends."
                />
              ) : null}
            </Box>

            {billing.clientBillingMode === "live" ? (
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 2 }}>
                Live mode: all client websites are fully billable with no trial period.
              </Typography>
            ) : null}

            {orgResult.websites.length > 0 ? (
              <Box sx={contractsLimitPanelSx}>
                <Typography fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.75 }}>
                  Websites ({orgResult.websites.length})
                </Typography>
                {orgResult.websites.map((w) => (
                  <Typography key={w.id} variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
                    {w.url || w.name || w.id} →{" "}
                    {billing.clientBillingMode === "live" ? "Live" : `Trial (${billing.clientTrialDays || 14} days)`}
                  </Typography>
                ))}
              </Box>
            ) : null}

            <Box sx={contractFooterRow}>
              <Button variant="secondary" onClick={() => setContractStep(4)} disabled={completing}>
                Back
              </Button>
              <Button variant="primary" onClick={() => void handleCompleteContract()} disabled={completing}>
                {completing ? "Completing…" : "Complete contract"}
              </Button>
            </Box>
          </>
        ) : null}
      </DashboardCard>
    </Box>
  );
}
