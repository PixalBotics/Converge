import type { DistributionWizardMethod } from "./wizard-storage";

export type DistributionMethodOption = {
  id: DistributionWizardMethod;
  label: string;
  description: string;
  available: boolean;
  comingSoonLabel?: string;
};

export const DISTRIBUTION_METHOD_OPTIONS: DistributionMethodOption[] = [
  {
    id: "email",
    label: "Email",
    description: "Agent distribution form → transcript emailed to department recipients (To/CC/BCC).",
    available: true,
  },
  {
    id: "crm",
    label: "CRM",
    description: "Push chat data and transcript into your connected CRM (HubSpot, Zoho, etc.).",
    available: false,
    comingSoonLabel: "Coming soon",
  },
];

export function methodFromApiValue(raw: string | undefined | null): DistributionWizardMethod | null {
  const m = raw?.trim().toLowerCase();
  if (m === "email") return "email";
  if (m === "crm") return "crm";
  return null;
}
