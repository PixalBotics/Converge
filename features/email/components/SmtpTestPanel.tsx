"use client";

import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField } from "@/components/common";
import { EmailTestPanelCard } from "../styles/email-configuration.styled";

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
}: {
  toEmail: string;
  onToEmailChange: (value: string) => void;
  onTest: () => void;
  testing?: boolean;
  disabled?: boolean;
  lastTestStatus?: "success" | "failed" | null;
  lastTestedAt?: string | null;
  lastTestMessage?: string | null;
  liveFeedback?: EmailTestFeedback | null;
}) {
  const theme = useTheme() as AppTheme;

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

  return (
    <EmailTestPanelCard>
      <InputField
        label="Send test to (optional)"
        name="testToEmail"
        type="email"
        placeholder="Leave empty to use your login email"
        value={toEmail}
        onChange={(e) => onToEmailChange(e.target.value)}
        disabled={disabled || testing}
      />
      <Button type="button" variant="secondary" onClick={onTest} disabled={disabled || testing}>
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
