"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import { Button, InputField } from "@/components/common";
import { extractApiErrorMessageForToast } from "@/lib/notify";
import { EmailTestPanelCard } from "../styles/email-configuration.styled";

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
  const [feedback, setFeedback] = useState<{ message: string; success: boolean } | null>(null);

  const handleTest = async () => {
    setFeedback(null);
    try {
      const result = await onTest(toEmail.trim() || undefined);
      setFeedback({
        message: result.message,
        success: result.success,
      });
    } catch (err) {
      const message = extractApiErrorMessageForToast(err) ?? "Test email failed.";
      setFeedback({ success: false, message });
    }
  };

  return (
    <EmailTestPanelCard>
      <InputField
        label="Test recipient (optional)"
        name="quickTestTo"
        type="email"
        placeholder="Defaults to your login email"
        value={toEmail}
        onChange={(e) => setToEmail(e.target.value)}
        disabled={disabled || testing}
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
