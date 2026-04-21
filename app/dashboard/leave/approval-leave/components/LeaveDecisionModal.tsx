"use client";

import { ConfirmActionModal } from "@/components/common";

export type LeaveDecision = null | { id: string; action: "approve" | "reject" };

export type LeaveDecisionModalProps = {
  decision: LeaveDecision;
  isLoading: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
};

export function LeaveDecisionModal({ decision, isLoading, onDismiss, onConfirm }: LeaveDecisionModalProps) {
  return (
    <ConfirmActionModal
      open={decision != null}
      title={decision?.action === "approve" ? "Approve leave?" : "Reject leave?"}
      description={
        decision?.action === "approve"
          ? "Approve this leave application?"
          : "Reject this leave application?"
      }
      confirmLabel={
        decision?.action === "approve"
          ? isLoading
            ? "Approving…"
            : "Approve"
          : isLoading
            ? "Rejecting…"
            : "Reject"
      }
      cancelLabel="Cancel"
      isLoading={isLoading}
      onDismiss={onDismiss}
      onConfirm={onConfirm}
    />
  );
}

