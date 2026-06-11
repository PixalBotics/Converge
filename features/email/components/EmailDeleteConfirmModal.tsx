"use client";

import { ConfirmActionModal } from "@/components/common";

export function EmailDeleteConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Remove",
  onDismiss,
  onConfirm,
  isLoading = false,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onDismiss: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}) {
  return (
    <ConfirmActionModal
      open={open}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel="Cancel"
      confirmButtonVariant="danger"
      onDismiss={onDismiss}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
