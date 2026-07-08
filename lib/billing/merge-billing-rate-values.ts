import type { ResellerBillingContractView } from "@/api/billing/agency-billing-contract.api";
import type { WebsiteBillingProfileView } from "@/api/billing/website-billing-profile.api";
import {
  defaultBillingRateFields,
  modulePricesForLineDraft,
  type BillingEnabledService,
  type BillingRateFieldsValues,
} from "@/lib/billing/billing-rate-fields";

export function formatBillingPeriodLabel(start: string, end: string) {
  const s = new Date(`${start}T00:00:00Z`);
  const e = new Date(`${end}T00:00:00Z`);
  const sameMonth = s.getUTCFullYear() === e.getUTCFullYear() && s.getUTCMonth() === e.getUTCMonth();
  if (sameMonth) {
    return s.toLocaleDateString(undefined, { month: "long", year: "numeric", timeZone: "UTC" });
  }
  return `${start} → ${end}`;
}

export function mergeContractProfileRates(
  contract: ResellerBillingContractView | undefined,
  profile: WebsiteBillingProfileView | undefined,
  enabledServices: BillingEnabledService[],
  clientModulePricesByCode: Record<string, number>,
): BillingRateFieldsValues {
  const base = defaultBillingRateFields(profile?.currency ?? contract?.currency ?? "USD");
  const status = profile?.status?.trim().toLowerCase() ?? "";

  const clientModulePrices =
    enabledServices.length > 0
      ? modulePricesForLineDraft(
          profile?.modulesFeeMonthly ?? 0,
          enabledServices,
          clientModulePricesByCode,
          profile?.modulesFeeMonthly,
        )
      : profile?.modulesFeeMonthly != null
        ? { _combined: String(profile.modulesFeeMonthly) }
        : {};

  return {
    ...base,
    currency: profile?.currency ?? contract?.currency ?? base.currency,
    billingCycle:
      profile?.billingCycle === "yearly" || contract?.billingCycle === "yearly" ? "yearly" : "monthly",
    clientBillingMode:
      contract?.clientBillingMode === "live" || status === "active" ? "live" : "trial",
    clientTrialDays: String(contract?.clientTrialDays ?? 14),
    costPerChat: String(profile?.costPerChat ?? contract?.costPerChat ?? 0),
    freeChats: String(profile?.freeChatsPerMonth ?? contract?.freeChatsPerMonth ?? 0),
    monthlyChats:
      profile?.monthlyChatsPerSite != null
        ? String(profile.monthlyChatsPerSite)
        : contract?.monthlyChatsPerSite != null
          ? String(contract.monthlyChatsPerSite)
          : "",
    platformFee: String(profile?.platformFeeMonthly ?? contract?.platformFeeMonthly ?? 0),
    aiToolsFee: String(profile?.aiToolsMonthly ?? contract?.aiToolsMonthly ?? 0),
    clientModulePrices,
  };
}

export function invoiceEmailsFromProfile(
  profile: WebsiteBillingProfileView | undefined,
  contract: ResellerBillingContractView | undefined,
): string {
  return profile?.invoiceToEmails?.trim() || contract?.invoiceToEmails?.trim() || "";
}
