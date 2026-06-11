"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField } from "@/components/common";
import { EmailFormStepBlock } from "./EmailFormStepBlock";
import {
  EmailConfigModalDivider,
  EmailTestPanelCard,
} from "../styles/email-configuration.styled";
import {
  extractEmailTestErrorMessage,
  formatMailTestErrorMessage,
  pickStoredTestMessage,
  validateTestToEmail,
} from "../utils/email-test.utils";

export type EmailTestFeedback = {
  success: boolean;
  message: string;
};

type EmailConnectionTestSectionProps = {
  onTest: (toEmail?: string) => Promise<EmailTestFeedback>;
  testing?: boolean;
  disabled?: boolean;
  lastTestStatus?: "success" | "failed" | null;
  lastTestedAt?: string | null;
  lastTestMessage?: string | null;
  /** When false, show hint to save first (configuration modals). */
  ready?: boolean;
  showStepHeader?: boolean;
};

export function EmailConnectionTestSection({
  onTest,
  testing,
  disabled,
  lastTestStatus,
  lastTestedAt,
  lastTestMessage,
  ready = true,
  showStepHeader = true,
}: EmailConnectionTestSectionProps) {
  const theme = useTheme() as AppTheme;
  const [toEmail, setToEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [liveFeedback, setLiveFeedback] = useState<EmailTestFeedback | null>(null);

  const storedFeedback: EmailTestFeedback | null =
    lastTestStatus && !liveFeedback
      ? {
          success: lastTestStatus === "success",
          message:
            pickStoredTestMessage({ lastTestStatus, lastTestMessage }) ??
            (lastTestStatus === "success" ? "Last test passed." : "Last test failed."),
        }
      : null;

  const feedbackRaw = liveFeedback ?? storedFeedback;
  const feedback = feedbackRaw
    ? {
        ...feedbackRaw,
        message: feedbackRaw.success
          ? feedbackRaw.message
          : formatMailTestErrorMessage(feedbackRaw.message),
      }
    : null;
  const testedLabel =
    lastTestedAt && !liveFeedback
      ? ` (${new Date(lastTestedAt).toLocaleString()})`
      : "";

  const handleTest = async () => {
    const validationError = validateTestToEmail(toEmail);
    if (validationError) {
      setFieldError(validationError);
      setLiveFeedback(null);
      return;
    }
    setFieldError(null);
    setLiveFeedback(null);
    try {
      const result = await onTest(toEmail.trim() || undefined);
      setLiveFeedback(result);
    } catch (err) {
      setLiveFeedback({
        success: false,
        message: extractEmailTestErrorMessage(err),
      });
    }
  };

  const body = (
    <>
      {!ready ? (
        <TypographyMuted theme={theme}>
          Save your connection settings first, then you can send a test email.
        </TypographyMuted>
      ) : (
        <EmailTestPanelCard>
          <InputField
            label="Test recipient (optional)"
            name="connectionTestTo"
            type="email"
            placeholder="Leave empty to use your login email"
            value={toEmail}
            onChange={(e) => {
              setFieldError(null);
              setToEmail(e.target.value);
            }}
            disabled={disabled || testing}
            error={Boolean(fieldError)}
            helperText={
              fieldError ?? "Send a real message to confirm API or SMTP credentials."
            }
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleTest()}
            disabled={disabled || testing}
          >
            {testing ? "Sending…" : "Send test email"}
          </Button>
          {feedback ? (
            <Alert severity={feedback.success ? "success" : "error"} variant="outlined" sx={{ py: 0.5 }}>
              {!feedback.success ? (
                <strong style={{ display: "block", marginBottom: 4 }}>Could not send test email</strong>
              ) : null}
              {feedback.message}
              {testedLabel}
            </Alert>
          ) : (
            <span style={{ fontSize: 12, color: theme.app.dashboard.textMuted }}>
              Uses the saved configuration — not unsaved form values.
            </span>
          )}
        </EmailTestPanelCard>
      )}
    </>
  );

  if (!showStepHeader) {
    return body;
  }

  return (
    <>
      <EmailConfigModalDivider />
      <EmailFormStepBlock
        step={4}
        title="Test connection"
        description="Verify delivery after saving. This sends through the stored credentials."
      >
        {body}
      </EmailFormStepBlock>
    </>
  );
}

function TypographyMuted({ theme, children }: { theme: AppTheme; children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 13, color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
      {children}
    </span>
  );
}
