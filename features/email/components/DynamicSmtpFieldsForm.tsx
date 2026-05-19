"use client";

import { InputField } from "@/components/common";
import type { EmailProviderFieldSchema, EmailProviderFormSchema } from "../types";
import { schemaFieldKey } from "../utils/schema-fields";
import { secretFieldPlaceholder } from "../utils/email-fields-payload";
import { GMAIL_SMTP_TIP } from "../email.constants";
import {
  EmailConfigFormGrid2,
  EmailHelpAlert,
  EmailSectionLabel,
} from "../styles/email-configuration.styled";

export {
  buildFieldsPayload,
  isMaskedSecret,
  normalizeFieldValuesForDisplay,
  validateRequiredMailFields,
} from "../utils/email-fields-payload";

export function DynamicSmtpFieldsForm({
  fields,
  values,
  onChange,
  disabled,
  showGmailTip,
  existingFields,
}: {
  fields: EmailProviderFieldSchema[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  disabled?: boolean;
  showGmailTip?: boolean;
  schema?: EmailProviderFormSchema | null;
  existingFields?: Record<string, string>;
}) {
  if (!fields.length) return null;

  return (
    <>
      <EmailSectionLabel component="p">Connection settings</EmailSectionLabel>
      {showGmailTip ? (
        <EmailHelpAlert severity="info" variant="outlined">
          {GMAIL_SMTP_TIP}
        </EmailHelpAlert>
      ) : null}
      <EmailConfigFormGrid2>
        {fields.map((field) => {
          const fk = schemaFieldKey(field);
          return (
            <div key={fk}>
              <InputField
                label={field.label}
                name={fk}
                type={field.type === "password" ? "password" : field.type === "number" ? "number" : "text"}
                placeholder={secretFieldPlaceholder(field, existingFields)}
                value={values[fk] ?? ""}
                onChange={(e) => onChange(fk, e.target.value)}
                disabled={disabled}
                autoComplete={field.type === "password" ? "new-password" : "off"}
              />
            </div>
          );
        })}
      </EmailConfigFormGrid2>
    </>
  );
}
