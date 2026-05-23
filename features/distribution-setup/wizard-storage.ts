import type { PickWebsitePreset } from "@/features/website-assignments/components/PickWebsiteModal";

const WEBSITE_KEY = "distribution-wizard-website";
const METHOD_KEY = "distribution-wizard-method";
const SETUP_ID_KEY = "distribution-wizard-setup-id";
const SUBJECT_KEY = "distribution-wizard-subject";
const EMAIL_FORM_ID_KEY = "distribution-wizard-email-form-id";

export type DistributionWizardMethod = "email" | "crm" | "both";

export function readWizardWebsite(): PickWebsitePreset | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(WEBSITE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PickWebsitePreset;
    if (!parsed?.websiteId?.trim() || !parsed?.parentCompanyId?.trim()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeWizardWebsite(preset: PickWebsitePreset): void {
  sessionStorage.setItem(WEBSITE_KEY, JSON.stringify(preset));
}

export function readWizardMethod(): DistributionWizardMethod {
  if (typeof sessionStorage === "undefined") return "email";
  const raw = sessionStorage.getItem(METHOD_KEY)?.trim().toLowerCase();
  if (raw === "crm" || raw === "both") return raw;
  return "email";
}

export function writeWizardMethod(method: DistributionWizardMethod): void {
  sessionStorage.setItem(METHOD_KEY, method);
}

export function readWizardSetupId(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(SETUP_ID_KEY)?.trim() || null;
}

export function writeWizardSetupId(setupId: string | null): void {
  if (!setupId?.trim()) {
    sessionStorage.removeItem(SETUP_ID_KEY);
    return;
  }
  sessionStorage.setItem(SETUP_ID_KEY, setupId.trim());
}

export function readWizardSubject(): string {
  if (typeof sessionStorage === "undefined") return "";
  return sessionStorage.getItem(SUBJECT_KEY)?.trim() ?? "";
}

export function writeWizardSubject(subject: string): void {
  sessionStorage.setItem(SUBJECT_KEY, subject.trim());
}

export function readWizardEmailFormId(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(EMAIL_FORM_ID_KEY)?.trim() || null;
}

export function writeWizardEmailFormId(id: string | null): void {
  if (!id?.trim()) {
    sessionStorage.removeItem(EMAIL_FORM_ID_KEY);
    return;
  }
  sessionStorage.setItem(EMAIL_FORM_ID_KEY, id.trim());
}

export function clearWizardDraft(): void {
  sessionStorage.removeItem(WEBSITE_KEY);
  sessionStorage.removeItem(METHOD_KEY);
  sessionStorage.removeItem(SETUP_ID_KEY);
  sessionStorage.removeItem(SUBJECT_KEY);
  sessionStorage.removeItem(EMAIL_FORM_ID_KEY);
}

export function uiMethodToApi(method: "Email" | "CRM" | "Both"): DistributionWizardMethod {
  if (method === "CRM") return "crm";
  if (method === "Both") return "both";
  return "email";
}

export function apiMethodToUi(method: string): "Email" | "CRM" | "Both" {
  const m = method.trim().toLowerCase();
  if (m === "crm") return "CRM";
  if (m === "both") return "Both";
  return "Email";
}
