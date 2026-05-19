"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import { Button, InputField } from "@/components/common";
import { EmailTestPanelCard } from "../styles/email-configuration.styled";
import { extractEmailTestErrorMessage, validateTestToEmail } from "../utils/email-test.utils";

/** Minimal test UI for reseller modal (no multi-step flow). */
export function EmailQuickTestPanel({
  onTest,
  testing,
  disabled,
}: {
  onTest: (toEmail?: string) => Promise<{ message: string; success: boolean }>;
  testing?: boolean;
  disabled?: boolean;
}) {
  const [toEmail, setToEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; success: boolean } | null>(null);

  const handleTest = async () => {
    const validationError = validateTestToEmail(toEmail);
    if (validationError) {
      setFieldError(validationError);
      setFeedback(null);
      return;
    }
    setFieldError(null);
    setFeedback(null);
    try {
      const result = await onTest(toEmail.trim() || undefined);
      setFeedback({
        message: result.message,
        success: result.success,
      });
    } catch (err) {
      setFeedback({
        success: false,
        message: extractEmailTestErrorMessage(err),
      });
    }
  };

  return (
    <EmailTestPanelCard>
      <InputField
        label="Test recipient (optional)"
        name="quickTestTo"
        type="email"
        placeholder="Leave empty to use your login email"
        value={toEmail}
        onChange={(e) => {
          setFieldError(null);
          setToEmail(e.target.value);
        }}
        disabled={disabled || testing}
        error={Boolean(fieldError)}
        helperText={fieldError ?? "Leave blank to send to your account email."}
      />
      <Button type="button" variant="secondary" onClick={() => void handleTest()} disabled={disabled || testing}>
        {testing ? "Sending…" : "Send test email"}
      </Button>
      {feedback ? (
        <Alert severity={feedback.success ? "success" : "error"} variant="outlined" sx={{ py: 0.5 }}>
          {feedback.message}
        </Alert>
      ) : null}
    </EmailTestPanelCard>
  );
}
