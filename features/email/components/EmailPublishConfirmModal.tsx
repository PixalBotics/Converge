"use client";

import { ConfirmActionModal } from "@/components/common";

export function EmailPublishConfirmModal({
  open,
  onDismiss,
  onConfirm,
  isLoading = false,
}: {
  open: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}) {
  return (
    <ConfirmActionModal
      open={open}
      title="Publish email template?"
      description="Your latest changes will be saved and live transcript emails will use this published version."
      confirmLabel="Publish"
      cancelLabel="Cancel"
      confirmButtonVariant="primary"
      onDismiss={onDismiss}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
