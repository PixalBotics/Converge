"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField } from "@/components/common";
import { EmailTestPanelCard } from "../styles/email-configuration.styled";
import { validateTestToEmail } from "../utils/email-test.utils";

export type EmailTestFeedback = {
  success: boolean;
  message: string;
};

export function SmtpTestPanel({
  toEmail,
  onToEmailChange,
  onTest,
  testing,
  disabled,
  lastTestStatus,
  lastTestedAt,
  lastTestMessage,
  liveFeedback,
  fieldError,
}: {
  toEmail: string;
  onToEmailChange: (value: string) => void;
  onTest: () => void | Promise<unknown>;
  testing?: boolean;
  disabled?: boolean;
  lastTestStatus?: "success" | "failed" | null;
  lastTestedAt?: string | null;
  lastTestMessage?: string | null;
  liveFeedback?: EmailTestFeedback | null;
  fieldError?: string | null;
}) {
  const theme = useTheme() as AppTheme;
  const [localError, setLocalError] = useState<string | null>(null);

  const storedFeedback: EmailTestFeedback | null =
    lastTestStatus && (lastTestMessage || lastTestStatus)
      ? {
          success: lastTestStatus === "success",
          message:
            lastTestMessage?.trim() ||
            (lastTestStatus === "success" ? "Last test passed." : "Last test failed."),
        }
      : null;

  const feedback = liveFeedback ?? storedFeedback;
  const testedLabel =
    lastTestedAt && !liveFeedback
      ? ` (${new Date(lastTestedAt).toLocaleString()})`
      : "";

  const inputError = fieldError?.trim() || localError;
  const showInputError = Boolean(inputError);

  const handleTestClick = () => {
    const validationError = validateTestToEmail(toEmail);
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError(null);
    void Promise.resolve(onTest());
  };

  return (
    <EmailTestPanelCard>
      <InputField
        label="Send test to (optional)"
        name="testToEmail"
        type="email"
        placeholder="Leave empty to use your login email"
        value={toEmail}
        onChange={(e) => {
          setLocalError(null);
          onToEmailChange(e.target.value);
        }}
        disabled={disabled || testing}
        error={showInputError}
        helperText={
          showInputError
            ? (inputError ?? undefined)
            : "Leave blank to send to your account email."
        }
      />
      <Button type="button" variant="secondary" onClick={handleTestClick} disabled={disabled || testing}>
        {testing ? "Sending…" : "Send test email"}
      </Button>
      {feedback ? (
        <Alert severity={feedback.success ? "success" : "error"} variant="outlined" sx={{ py: 0.5 }}>
          {feedback.message}
          {testedLabel}
        </Alert>
      ) : (
        <span style={{ fontSize: 12, color: theme.app.dashboard.textMuted }}>
          Run a test to verify SMTP or API credentials.
        </span>
      )}
    </EmailTestPanelCard>
  );
}
