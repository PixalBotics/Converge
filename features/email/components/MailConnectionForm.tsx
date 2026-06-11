"use client";

import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { MailProviderSettings } from "../types";
import { InputField, Typography } from "@/components/common";
import { OwnMailProviderForm } from "./own-mail/OwnMailProviderForm";
import { DynamicSmtpFieldsForm } from "./DynamicSmtpFieldsForm";
import { AuditMeta } from "./AuditMeta";
import { EmailFormStepBlock } from "./EmailFormStepBlock";
import type { useOwnMailProviderForm } from "../hooks/useOwnMailProviderForm";
import {
  EmailConfigFormGrid2,
  EmailEnableRow,
  EmailFormStepsStack,
} from "../styles/email-configuration.styled";

type MailFormState = ReturnType<typeof useOwnMailProviderForm>;

export function MailConnectionForm({
  form,
  existingFields,
  disabled,
  showAudit,
  audit,
}: {
  form: MailFormState;
  existingFields?: MailProviderSettings["fields"];
  disabled?: boolean;
  showAudit?: boolean;
  audit?: {
    updatedBy?: string | null;
    updatedAt?: string | null;
    lastTestedBy?: string | null;
  };
}) {
  const theme = useTheme() as AppTheme;

  return (
    <EmailFormStepsStack>
      <EmailFormStepBlock
        step={1}
        title="Delivery method"
        description="SendGrid API is recommended. Use SMTP for Microsoft 365 or a custom mail server."
      >
        <OwnMailProviderForm form={form} disabled={disabled} />
      </EmailFormStepBlock>

      {form.providerId ? (
        <EmailFormStepBlock
          step={2}
          title="Connection credentials"
          description="Secrets are encrypted. Leave password or API key blank to keep the saved value."
        >
          {form.schemaQuery.isLoading ? (
            <Skeleton variant="rounded" height={120} />
          ) : form.schemaQuery.data ? (
            <DynamicSmtpFieldsForm
              fields={form.schemaQuery.data.fields}
              schema={form.schemaQuery.data}
              values={form.fieldValues}
              existingFields={existingFields}
              onChange={(key, value) => {
                form.setFieldValues((prev) => ({ ...prev, [key]: value }));
              }}
              disabled={disabled}
              showGmailTip={form.showGmailTip}
            />
          ) : null}
        </EmailFormStepBlock>
      ) : null}

      {form.providerId ? (
        <EmailFormStepBlock
          step={3}
          title="Sender identity"
          description="The From name and address recipients see on outgoing mail."
        >
          <EmailConfigFormGrid2>
            <InputField
              label="From email"
              name="fromEmail"
              type="email"
              placeholder="noreply@yourcompany.com"
              value={form.fromEmail}
              onChange={(e) => form.setFromEmail(e.target.value)}
              disabled={disabled}
            />
            <InputField
              label="From name"
              name="fromName"
              placeholder="Your company name"
              value={form.fromName}
              onChange={(e) => form.setFromName(e.target.value)}
              disabled={disabled}
            />
          </EmailConfigFormGrid2>

          <EmailEnableRow>
            <BoxCopy theme={theme} enabled={form.isEnabled} savedOnce={form.savedOnce} />
            <FormControlLabel
              control={
                <Switch
                  checked={form.isEnabled}
                  onChange={(e) => form.setIsEnabled(e.target.checked)}
                  disabled={disabled}
                />
              }
              label=""
              sx={{ m: 0 }}
            />
          </EmailEnableRow>
        </EmailFormStepBlock>
      ) : null}

      {showAudit && audit ? (
        <AuditMeta
          updatedBy={audit.updatedBy}
          updatedAt={audit.updatedAt}
          lastTestedBy={audit.lastTestedBy}
        />
      ) : null}
    </EmailFormStepsStack>
  );
}

function BoxCopy({
  theme,
  enabled,
  savedOnce,
}: {
  theme: AppTheme;
  enabled: boolean;
  savedOnce: boolean;
}) {
  return (
    <div>
      <Typography variant="medium" fontWeight={600} sx={{ color: theme.app.text.primary }}>
        Enable sending
      </Typography>
      <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, display: "block", mt: 0.25 }}>
        {enabled
          ? "Outgoing email is active for this configuration."
          : "Turn on after credentials are saved and you have confirmed delivery with a test email."}
      </Typography>
      {savedOnce ? (
        <Chip
          label={enabled ? "Active" : "Paused"}
          size="small"
          sx={{
            mt: 1,
            height: 22,
            fontSize: 11,
            fontWeight: 600,
            bgcolor: enabled
              ? `${theme.palette.success.main}22`
              : "rgba(255,255,255,0.08)",
            color: enabled ? theme.palette.success.main : theme.app.dashboard.textMuted,
          }}
        />
      ) : null}
    </div>
  );
}
