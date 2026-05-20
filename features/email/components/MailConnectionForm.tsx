"use client";

import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { MailProviderSettings } from "../types";
import { InputField, Typography } from "@/components/common";
import { OwnMailProviderForm } from "./own-mail/OwnMailProviderForm";
import { SmtpTestPanel } from "./SmtpTestPanel";
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
  canTest,
  testing,
  lastTestStatus,
  lastTestedAt,
  lastTestMessage,
  liveFeedback,
  fieldError,
  showTestStep = true,
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
  canTest?: boolean;
  testing?: boolean;
  lastTestStatus?: "success" | "failed" | null;
  lastTestedAt?: string | null;
  lastTestMessage?: string | null;
  liveFeedback?: import("./SmtpTestPanel").EmailTestFeedback | null;
  fieldError?: string | null;
  /** Reseller modal: hide step 3; use EmailQuickTestPanel instead. */
  showTestStep?: boolean;
}) {
  const theme = useTheme() as AppTheme;
  const testDisabled = disabled || !canTest || !form.savedOnce || !form.isEnabled;

  return (
    <EmailFormStepsStack>
      <EmailFormStepBlock
        step={1}
        title="Choose email provider"
        description="Pick SMTP for mailbox servers or API for services like SendGrid or Mailgun."
      >
        <OwnMailProviderForm form={form} disabled={disabled} existingFields={existingFields} />
      </EmailFormStepBlock>

      {form.providerId ? (
        <EmailFormStepBlock
          step={2}
          title="Sender details"
          description="This name and address appear in the From field of outgoing emails."
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

      {showTestStep && form.providerId && form.savedOnce ? (
        <EmailFormStepBlock
          step={3}
          title="Test your setup"
          description="Send a test message to confirm credentials work before going live."
        >
          <SmtpTestPanel
            toEmail={form.testToEmail}
            onToEmailChange={form.setTestToEmail}
            onTest={form.handleTest}
            testing={testing}
            disabled={testDisabled}
            lastTestStatus={lastTestStatus}
            lastTestedAt={lastTestedAt}
            lastTestMessage={lastTestMessage}
            liveFeedback={liveFeedback}
            fieldError={fieldError}
          />
          {showAudit && audit ? (
            <AuditMeta
              updatedBy={audit.updatedBy}
              updatedAt={audit.updatedAt}
              lastTestedBy={audit.lastTestedBy}
            />
          ) : null}
        </EmailFormStepBlock>
      ) : showTestStep && form.providerId ? (
        <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, pl: { md: 5.25 } }}>
          Save once to unlock the test email option.
        </Typography>
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
          : "Turn on when you are ready to send mail."}
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
