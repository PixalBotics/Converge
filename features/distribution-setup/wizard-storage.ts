import type { PickWebsitePreset } from "@/features/website-assignments/components/PickWebsiteModal";

import type { DistributionTableRow } from "./utils/map-distribution-rows";

import { createDraftRow } from "./utils/map-distribution-rows";

import { methodFromApiValue } from "./distribution-method.constants";



const WEBSITE_KEY = "distribution-wizard-website";

const METHOD_KEY = "distribution-wizard-method";

const SETUP_ID_KEY = "distribution-wizard-setup-id";

const SUBJECT_KEY = "distribution-wizard-subject";

const EMAIL_FORM_ID_KEY = "distribution-wizard-email-form-id";

const TABLE_ROWS_KEY = "distribution-wizard-table-rows";
const PUBLISHED_KEY = "distribution-wizard-published";



/** User-selectable methods in the wizard. */

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



export function readWizardMethod(): DistributionWizardMethod | null {

  if (typeof sessionStorage === "undefined") return null;

  const raw = sessionStorage.getItem(METHOD_KEY)?.trim().toLowerCase();

  if (raw === "email" || raw === "crm" || raw === "both") return raw;

  return null;

}



export function writeWizardMethod(method: DistributionWizardMethod | null): void {

  if (!method) {

    sessionStorage.removeItem(METHOD_KEY);

    return;

  }

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



export function readWizardTableRows(): DistributionTableRow[] | null {

  if (typeof sessionStorage === "undefined") return null;

  const raw = sessionStorage.getItem(TABLE_ROWS_KEY);

  if (!raw) return null;

  try {

    const parsed = JSON.parse(raw) as DistributionTableRow[];

    return Array.isArray(parsed) && parsed.length ? parsed : null;

  } catch {

    return null;

  }

}



export function writeWizardTableRows(rows: DistributionTableRow[]): void {

  sessionStorage.setItem(TABLE_ROWS_KEY, JSON.stringify(rows));

}



export function readWizardPublished(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(PUBLISHED_KEY) === "1";
}

export function writeWizardPublished(published: boolean): void {
  if (published) sessionStorage.setItem(PUBLISHED_KEY, "1");
  else sessionStorage.removeItem(PUBLISHED_KEY);
}

export function clearWizardDraft(): void {
  sessionStorage.removeItem(WEBSITE_KEY);
  sessionStorage.removeItem(METHOD_KEY);
  sessionStorage.removeItem(SETUP_ID_KEY);
  sessionStorage.removeItem(SUBJECT_KEY);
  sessionStorage.removeItem(EMAIL_FORM_ID_KEY);
  sessionStorage.removeItem(TABLE_ROWS_KEY);
  sessionStorage.removeItem(PUBLISHED_KEY);
}



/** Map API method to wizard selection (CRM is shown but not selectable yet). */

export function methodFromDetailApi(raw: string | undefined | null): DistributionWizardMethod | null {

  return methodFromApiValue(raw);

}


