"use client";

import { useEffect, useState } from "react";
import { FormModal, InputField } from "@/components/common";

export type ShareReportModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (body: { emails: string[]; message?: string }) => Promise<void>;
  submitting: boolean;
};

export function ShareReportModal({ open, onClose, onSubmit, submitting }: ShareReportModalProps) {
  const [emailsText, setEmailsText] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setEmailsText("");
    setMessage("");
  }, [open]);

  const emails = emailsText
    .split(/[,;\n]+/)
    .map((e) => e.trim())
    .filter(Boolean);

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Share report via email"
      maxWidth={480}
      primaryButtonLabel={submitting ? "Sending…" : "Send"}
      primaryButtonDisabled={submitting || emails.length === 0}
      onSave={() => void onSubmit({ emails, message: message.trim() || undefined })}
    >
      <InputField
        label="Email addresses"
        value={emailsText}
        onChange={(e) => setEmailsText(e.target.value)}
        placeholder="client@example.com, manager@company.com"
        multiline
        minRows={2}
      />
      <InputField
        label="Custom message (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        multiline
        minRows={3}
      />
    </FormModal>
  );
}
