import { z } from "zod";

export type PrechatFieldType =
  | "text"
  | "email"
  | "phone"
  | "textarea"
  | "select"
  | "checkbox";

export interface PrechatFieldDto {
  key: string;
  type: PrechatFieldType | string;
  label?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
}

const defaultVisitorFields: PrechatFieldDto[] = [
  { key: "name", type: "text", label: "Name", required: true },
  { key: "email", type: "email", label: "Email", required: false },
  { key: "phone", type: "phone", label: "Phone", required: false },
];

function formHasPrechatToggles(form: Record<string, unknown>): boolean {
  return (
    "prechatNameEnabled" in form ||
    "prechatEmailEnabled" in form ||
    "prechatPhoneEnabled" in form ||
    "prechatMessageEnabled" in form
  );
}

function boolFlag(v: unknown, defaultOn: boolean): boolean {
  if (v === false || v === "false" || v === 0) return false;
  if (v === true || v === "true" || v === 1) return true;
  return defaultOn;
}

/** Build pre-chat fields from wizard `config.form` toggles (notifications step). */
function prechatFieldsFromFormFlags(form: Record<string, unknown>): PrechatFieldDto[] {
  if (!formHasPrechatToggles(form)) return [];

  const nameOn = boolFlag(form.prechatNameEnabled, true);
  const emailOn = boolFlag(form.prechatEmailEnabled, true);
  const phoneOn = boolFlag(form.prechatPhoneEnabled, false);
  const messageOn = boolFlag(form.prechatMessageEnabled, false);
  const messageRequired = boolFlag(form.prechatMessageRequired, false);

  const fields: PrechatFieldDto[] = [];
  if (nameOn) {
    fields.push({ key: "name", type: "text", label: "Name", required: true });
  }
  if (emailOn) {
    fields.push({ key: "email", type: "email", label: "Email", required: true });
  }
  if (phoneOn) {
    fields.push({ key: "phone", type: "phone", label: "Phone", required: false });
  }
  if (messageOn) {
    fields.push({
      key: "message",
      type: "textarea",
      label: "Message",
      required: messageRequired,
    });
  }
  return fields;
}

function isLegacyWizardPlaceholderFields(fields: PrechatFieldDto[]): boolean {
  if (fields.length !== 2) return false;
  const keys = new Set(fields.map((f) => f.key));
  return keys.has("company") && keys.has("topic");
}

/** Extract field list from nested widget configuration blobs. */
export function extractPrechatFieldsFromWidgetConfig(
  cfg: Record<string, unknown>,
): PrechatFieldDto[] {
  const form = cfg.form as Record<string, unknown> | undefined;
  const settingsJson = cfg.settingsJson as Record<string, unknown> | undefined;
  const nestedForm = settingsJson?.form as Record<string, unknown> | undefined;
  const formForFlags =
    nestedForm && typeof nestedForm === "object"
      ? nestedForm
      : form && typeof form === "object"
        ? form
        : null;

  const fromFlags = formForFlags ? prechatFieldsFromFormFlags(formForFlags) : [];
  if (fromFlags.length > 0) return fromFlags;

  const fromForm = Array.isArray(form?.fields)
    ? (form?.fields as PrechatFieldDto[])
    : null;
  const fromSettings = nestedForm?.fields ?? settingsJson?.preChatFields;
  const merged =
    Array.isArray(fromSettings) && fromSettings.length > 0
      ? fromSettings
      : fromForm;
  if (Array.isArray(merged) && merged.length > 0) {
    if (isLegacyWizardPlaceholderFields(merged)) {
      return defaultVisitorFields;
    }
    return merged;
  }

  const rootFields = cfg.preChatFields;
  return Array.isArray(rootFields)
    ? (rootFields as PrechatFieldDto[])
    : defaultVisitorFields;
}

/** React Hook Form + zod resolver schema for pre-chat intake. */
export function buildDynamicPrechatZod(
  fields: PrechatFieldDto[],
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  if (!fields.length) {
    return z.object({
      name: z.string().min(1, "Name is required"),
      email: z
        .union([z.string().email("Invalid email"), z.literal("")])
        .optional(),
      phone: z.string().optional(),
    });
  }

  const shape: Record<string, z.ZodTypeAny> = {};
  for (const raw of fields) {
    const key = String(raw.key || "field").trim();
    const t = String(raw.type || "text").toLowerCase();
    let s: z.ZodTypeAny;
    switch (t) {
      case "email":
        s = raw.required
          ? z.string().min(1).email("Invalid email")
          : z
              .union([z.string().email("Invalid email"), z.literal("")])
              .optional();
        break;
      case "checkbox":
        s = raw.required
          ? z.boolean().refine((v) => v === true, { message: "Required" })
          : z.boolean().optional();
        break;
      case "select":
        s = raw.required ? z.string().min(1) : z.string().optional().or(z.literal(""));
        break;
      case "textarea":
      case "text":
      case "phone":
      default:
        s = raw.required
          ? z.string().min(1, "Required")
          : z.string().optional().or(z.literal(""));
        break;
    }
    shape[key] = s;
  }
  return z.object(shape);
}

/** Visitor object + synthesized first message for POST /chat/widget/conversations */
export function buildVisitorPayloadParts(
  values: Record<string, unknown>,
  fields: PrechatFieldDto[],
  sessionId: string,
  inquiryLabel?: string,
) {
  const nameCoerced = coerceField(values.name ?? values.Name, "") || "Guest";
  const email = coerceField(values.email ?? values.Email, "");
  const phone = coerceField(values.phone ?? values.Phone, "");
  let firstMessageTail = "";

  const orderedKeys = [...new Set(fields.map((f) => String(f.key)).filter(Boolean))];
  const lines: string[] = [];
  for (const key of orderedKeys) {
    if (["name", "email", "phone"].includes(key)) continue;
    const v = values[key];
    const label =
      fields.find((f) => f.key === key)?.label ?? fields.find((f) => f.key === key)?.key ?? key;
    lines.push(`${label}: ${formatValue(v)}`);
  }
  firstMessageTail = lines.join("\n");

  let firstMessage = inquiryLabel ? `[Topic: ${inquiryLabel}]` : "Chat started.";
  firstMessage += `\nVisitor: ${nameCoerced}`;
  if (email) firstMessage += `\nEmail: ${email}`;
  if (phone) firstMessage += `\nPhone: ${phone}`;
  if (firstMessageTail) firstMessage += `\n${firstMessageTail}`;

  return {
    visitor: {
      sessionId,
      name: nameCoerced,
      email: email || undefined,
      phone: phone || undefined,
    },
    firstMessage,
  };
}

function coerceField(v: unknown, fallback: string): string {
  if (typeof v === "boolean") return v ? "yes" : "";
  if (typeof v === "number") return String(v);
  return typeof v === "string" ? v.trim() : fallback;
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}

export function buildDefaultFormValues(
  fields: PrechatFieldDto[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  fields.forEach((f) => {
    if (String(f.type || "").toLowerCase() === "checkbox")
      out[f.key] = false;
    else out[f.key] = "";
  });
  return out;
}
