"use client";

import { FormModal } from "@/components/common";
import { EmailConnectionTestSection } from "./EmailConnectionTestSection";
import type { EmailTestFeedback } from "./EmailConnectionTestSection";

export type EmailConnectionTestModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  testing?: boolean;
  disabled?: boolean;
  lastTestStatus?: "success" | "failed" | null;
  lastTestedAt?: string | null;
  lastTestMessage?: string | null;
  onTest: (toEmail?: string) => Promise<EmailTestFeedback>;
};

export function EmailConnectionTestModal({
  open,
  onClose,
  title = "Test email delivery",
  description = "Your configuration was saved. Send a test email to confirm messages are being delivered.",
  testing,
  disabled,
  lastTestStatus,
  lastTestedAt,
  lastTestMessage,
  onTest,
}: EmailConnectionTestModalProps) {
  return (
    <FormModal
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      onSave={onClose}
      primaryButtonLabel="Done"
      showCancelButton={false}
      maxWidth={520}
      fitContent
    >
      <EmailConnectionTestSection
        showStepHeader={false}
        ready
        testing={testing}
        disabled={disabled}
        lastTestStatus={lastTestStatus}
        lastTestedAt={lastTestedAt}
        lastTestMessage={lastTestMessage}
        onTest={onTest}
      />
    </FormModal>
  );
}
