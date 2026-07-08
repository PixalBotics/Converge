export const BILLING_CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "AED", label: "AED" },
  { value: "PKR", label: "PKR" },
];

export type BillingRateFieldsValues = {
  currency: string;
  billingCycle: "monthly" | "yearly";
  clientBillingMode: "trial" | "live";
  clientTrialDays: string;
  costPerChat: string;
  freeChats: string;
  monthlyChats: string;
  platformFee: string;
  aiToolsFee: string;
  clientModulePrices: Record<string, string>;
};

export type BillingEnabledService = {
  code: string;
  name: string;
  monthlyPrice?: number | null;
};

export function defaultBillingRateFields(currency = "USD"): BillingRateFieldsValues {
  return {
    currency,
    billingCycle: "monthly",
    clientBillingMode: "trial",
    clientTrialDays: "14",
    costPerChat: "0",
    freeChats: "0",
    monthlyChats: "",
    platformFee: "0",
    aiToolsFee: "0",
    clientModulePrices: {},
  };
}

export function sumModulePrices(
  enabledServices: BillingEnabledService[],
  clientModulePrices: Record<string, string>,
): { sum: number; anyTyped: boolean } {
  let sum = 0;
  let anyTyped = false;
  for (const service of enabledServices) {
    const raw = clientModulePrices[service.code]?.trim() ?? "";
    const fallback =
      service.monthlyPrice != null && Number.isFinite(service.monthlyPrice)
        ? service.monthlyPrice
        : 0;
    const value = raw ? Number(raw) : fallback;
    if (!Number.isFinite(value) || value < 0) continue;
    if (raw || fallback > 0) anyTyped = true;
    sum += value;
  }
  const combinedRaw = clientModulePrices._combined?.trim() ?? "";
  if (enabledServices.length === 0 && combinedRaw) {
    anyTyped = true;
    sum += Number(combinedRaw) || 0;
  }
  return { sum: roundMoney(sum), anyTyped };
}

export function calcChatCharges(
  billableChats: number,
  freeChatsIncluded: number,
  costPerChat: number,
): number {
  const chargeableChats = Math.max(0, billableChats - Math.max(0, freeChatsIncluded));
  return roundMoney(chargeableChats * Math.max(0, costPerChat));
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function modulePricesFromReseller(
  moduleCodes: string[],
  clientModulePricesByCode: Record<string, number> | undefined,
): Record<string, string> {
  const next: Record<string, string> = {};
  for (const code of moduleCodes) {
    const value = clientModulePricesByCode?.[code];
    next[code] = typeof value === "number" ? String(value) : "";
  }
  return next;
}

export function modulePricesForLineDraft(
  modulesFeeOnLine: number,
  enabledServices: BillingEnabledService[],
  clientModulePricesByCode: Record<string, number>,
  profileModulesFee?: number | null,
): Record<string, string> {
  if (enabledServices.length === 0) {
    const combined = modulesFeeOnLine > 0 ? modulesFeeOnLine : profileModulesFee ?? 0;
    return combined > 0 ? { _combined: String(combined) } : {};
  }

  const result: Record<string, string> = {};
  let assigned = 0;

  for (const service of enabledServices) {
    const fromReseller = clientModulePricesByCode[service.code];
    if (typeof fromReseller === "number" && fromReseller > 0) {
      result[service.code] = String(fromReseller);
      assigned += fromReseller;
      continue;
    }
    if (service.monthlyPrice != null && service.monthlyPrice > 0) {
      result[service.code] = String(service.monthlyPrice);
      assigned += service.monthlyPrice;
      continue;
    }
    result[service.code] = "";
  }

  const fallbackFee =
    modulesFeeOnLine > 0 ? modulesFeeOnLine : profileModulesFee != null && profileModulesFee > 0 ? profileModulesFee : 0;

  if (assigned === 0 && fallbackFee > 0) {
    const primary =
      enabledServices.find((service) => service.code !== "hrms") ?? enabledServices[0];
    if (primary) {
      result[primary.code] = String(roundMoney(fallbackFee));
    }
  }

  return result;
}

export type DraftLineComputed = {
  modulesFee: number;
  platformFee: number;
  aiToolsFee: number;
  extraCharges: number;
  chatCharges: number;
  billableChats: number;
  chargeableChats: number;
  costPerChat: number;
  lineSubtotal: number;
  softwarePackage: number;
  supportFee: number;
  chatUsage: number;
};

export function computeDraftLineTotals(
  draft: Pick<
    BillingRateFieldsValues,
    | "costPerChat"
    | "freeChats"
    | "monthlyChats"
    | "platformFee"
    | "aiToolsFee"
    | "clientModulePrices"
  > & {
    billableChats: number;
    extraCharges: string;
  },
  enabledServices: BillingEnabledService[],
): DraftLineComputed {
  const { sum, anyTyped } = sumModulePrices(enabledServices, draft.clientModulePrices);
  const modulesFee = anyTyped ? sum : Number(draft.clientModulePrices._combined) || 0;
  const platformFee = Number(draft.platformFee) || 0;
  const aiToolsFee = Number(draft.aiToolsFee) || 0;
  const extraCharges = Number(draft.extraCharges) || 0;
  const costPerChat = Number(draft.costPerChat) || 0;
  const freeChatsIncluded = Number(draft.freeChats) || 0;
  const billableChats = draft.monthlyChats.trim()
    ? Number(draft.monthlyChats) || 0
    : draft.billableChats;
  const chargeableChats = Math.max(0, billableChats - Math.max(0, freeChatsIncluded));
  const chatCharges = calcChatCharges(billableChats, freeChatsIncluded, costPerChat);
  const lineSubtotal = roundMoney(modulesFee + platformFee + aiToolsFee + extraCharges + chatCharges);

  return {
    modulesFee,
    platformFee,
    aiToolsFee,
    extraCharges,
    chatCharges,
    billableChats,
    chargeableChats,
    costPerChat,
    lineSubtotal,
    softwarePackage: modulesFee,
    supportFee: platformFee + aiToolsFee + extraCharges,
    chatUsage: chatCharges,
  };
}
