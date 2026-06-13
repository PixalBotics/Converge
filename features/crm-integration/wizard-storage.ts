import type { PickWebsitePreset } from "@/features/website-assignments/components/PickWebsiteModal";

const WEBSITE_KEY = "crm-wizard-website";
const PLATFORM_KEY = "crm-wizard-platform";
const METHOD_KEY = "crm-wizard-connection-method";
const INTEGRATION_ID_KEY = "crm-wizard-integration-id";
const CONFIG_KEY = "crm-wizard-config-draft";

export type CrmWizardPlatform = "hubspot" | "salesforce" | "zoho";
export type CrmWizardConnectionMethod = string;

export function readCrmWizardWebsite(): PickWebsitePreset | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(WEBSITE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PickWebsitePreset;
    if (!parsed?.childCompanyId?.trim() || !parsed?.websiteId?.trim()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCrmWizardWebsite(preset: PickWebsitePreset): void {
  sessionStorage.setItem(WEBSITE_KEY, JSON.stringify(preset));
}

export function readCrmWizardPlatform(): CrmWizardPlatform | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(PLATFORM_KEY)?.trim().toLowerCase();
  if (raw === "hubspot" || raw === "salesforce" || raw === "zoho") return raw;
  return null;
}

export function writeCrmWizardPlatform(platform: CrmWizardPlatform | null): void {
  if (!platform) sessionStorage.removeItem(PLATFORM_KEY);
  else sessionStorage.setItem(PLATFORM_KEY, platform);
}

export function readCrmWizardConnectionMethod(): CrmWizardConnectionMethod | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(METHOD_KEY)?.trim() || null;
}

export function writeCrmWizardConnectionMethod(method: CrmWizardConnectionMethod | null): void {
  if (!method) sessionStorage.removeItem(METHOD_KEY);
  else sessionStorage.setItem(METHOD_KEY, method);
}

export function readCrmWizardIntegrationId(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(INTEGRATION_ID_KEY)?.trim() || null;
}

export function writeCrmWizardIntegrationId(id: string | null): void {
  if (!id?.trim()) sessionStorage.removeItem(INTEGRATION_ID_KEY);
  else sessionStorage.setItem(INTEGRATION_ID_KEY, id.trim());
}

export function readCrmWizardConfigDraft(): Record<string, string> {
  if (typeof sessionStorage === "undefined") return {};
  const raw = sessionStorage.getItem(CONFIG_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeCrmWizardConfigDraft(config: Record<string, string>): void {
  sessionStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function clearCrmWizardDraft(): void {
  sessionStorage.removeItem(WEBSITE_KEY);
  sessionStorage.removeItem(PLATFORM_KEY);
  sessionStorage.removeItem(METHOD_KEY);
  sessionStorage.removeItem(INTEGRATION_ID_KEY);
  sessionStorage.removeItem(CONFIG_KEY);
}
