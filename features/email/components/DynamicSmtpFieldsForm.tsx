"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import { Button, InputField } from "@/components/common";
import type { EmailProviderFieldSchema, EmailProviderFormSchema } from "../types";
import { schemaFieldKey } from "../utils/schema-fields";
import { secretFieldPlaceholder } from "../utils/email-fields-payload";
import { isAdvancedEmailField } from "../utils/email-provider-fields";
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
  const [advancedOpen, setAdvancedOpen] = useState(false);

  if (!fields.length) return null;

  const primaryFields = fields.filter((f) => !isAdvancedEmailField(schemaFieldKey(f)));
  const advancedFields = fields.filter((f) => isAdvancedEmailField(schemaFieldKey(f)));

  const renderField = (field: EmailProviderFieldSchema) => {
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
          helperText={field.helpText}
        />
      </div>
    );
  };

  return (
    <>
      <EmailSectionLabel component="p">Connection credentials</EmailSectionLabel>
      {showGmailTip ? (
        <EmailHelpAlert severity="info" variant="outlined">
          {GMAIL_SMTP_TIP}
        </EmailHelpAlert>
      ) : null}
      <EmailConfigFormGrid2>{primaryFields.map(renderField)}</EmailConfigFormGrid2>

      {advancedFields.length > 0 ? (
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setAdvancedOpen((o) => !o)}
            sx={{ alignSelf: "flex-start", px: 1.5, minWidth: 0, fontSize: 13 }}
          >
            {advancedOpen ? "Hide advanced" : "Advanced options"}
          </Button>
          <Collapse in={advancedOpen}>
            <Box sx={{ mt: 0 }}>
              <EmailConfigFormGrid2>{advancedFields.map(renderField)}</EmailConfigFormGrid2>
            </Box>
          </Collapse>
        </>
      ) : null}
    </>
  );
}
