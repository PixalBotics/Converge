"use client";

import { useEffect, useState } from "react";
import { FormModal } from "@/components/common";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { ConfigurationResellerSelect } from "./configuration/ConfigurationResellerSelect";
import { useAssignPlatformEmailTemplateMutation } from "../hooks/useEmailTemplate";

export function PlatformTemplateAssignmentModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { hasOperational } = useAuth();
  const canUpdate = hasOperational(OP.emailTemplate.update);
  const assignMutation = useAssignPlatformEmailTemplateMutation();
  const [resellerId, setResellerId] = useState("");

  useEffect(() => {
    if (open) setResellerId("");
  }, [open]);

  const handleSave = async () => {
    const rid = resellerId.trim();
    if (!rid) {
      publishAppToast({ variant: "error", message: "Select a reseller." });
      return;
    }
    try {
      await assignMutation.mutateAsync(rid);
      publishAppToast({ variant: "success", message: "Reseller assigned to platform design." });
      onSaved?.();
      onClose();
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err, "Could not assign platform design."),
      });
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSave={() => void handleSave()}
      title="Assign platform email design"
      description="The reseller will use the published platform transcript template for live distribution mail."
      primaryButtonLabel={assignMutation.isPending ? "Saving…" : "Assign"}
      primaryButtonDisabled={!canUpdate || assignMutation.isPending || !resellerId.trim()}
    >
      <ConfigurationResellerSelect value={resellerId} onChange={setResellerId} />
    </FormModal>
  );
}
