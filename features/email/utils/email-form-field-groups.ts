import type { EmailFormFieldRow } from "@/api/email/email-forms.api";

export type EmailFormFieldGroup = {
  id: string;
  label: string;
  description: string;
  keys: readonly string[];
};

export const EMAIL_FORM_FIELD_GROUPS: readonly EmailFormFieldGroup[] = [
  {
    id: "visitor",
    label: "Visitor information",
    description: "Identity and contact details collected during chat.",
    keys: ["department", "name", "email", "phone", "company", "location"],
  },
  {
    id: "chat",
    label: "Chat session",
    description: "Website, timing, and agent context for the transcript email.",
    keys: ["website", "chat_time", "agent", "duration"],
  },
  {
    id: "context",
    label: "Browser & source",
    description: "Optional acquisition fields for richer wrap-up emails.",
    keys: ["browser", "os", "referrer"],
  },
  {
    id: "content",
    label: "Transcript & feedback",
    description: "Message history, agent notes, and visitor rating.",
    keys: ["transcript", "notes", "rating"],
  },
] as const;

export function groupEmailFormFields(fields: EmailFormFieldRow[]): {
  group: EmailFormFieldGroup;
  fields: EmailFormFieldRow[];
}[] {
  const byKey = new Map(fields.map((f) => [f.fieldKey, f]));
  const used = new Set<string>();

  const grouped = EMAIL_FORM_FIELD_GROUPS.map((group) => {
    const rows = group.keys
      .map((key) => byKey.get(key))
      .filter((f): f is EmailFormFieldRow => Boolean(f));
    rows.forEach((f) => used.add(f.fieldKey));
    return { group, fields: rows };
  }).filter((g) => g.fields.length > 0);

  const remainder = fields.filter((f) => !used.has(f.fieldKey));
  if (remainder.length > 0) {
    grouped.push({
      group: {
        id: "other",
        label: "Other fields",
        description: "Additional configured fields.",
        keys: [],
      },
      fields: remainder,
    });
  }

  return grouped;
}
