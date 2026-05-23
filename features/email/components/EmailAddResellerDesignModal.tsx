"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormModal } from "@/components/common";
import { ConfigurationResellerSelect } from "./configuration/ConfigurationResellerSelect";
import { EMAIL_ROUTES } from "../email.constants";

export function EmailAddResellerDesignModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [resellerId, setResellerId] = useState("");

  useEffect(() => {
    if (open) setResellerId("");
  }, [open]);

  const handleSave = () => {
    const id = resellerId.trim();
    if (!id) return;
    onClose();
    router.push(EMAIL_ROUTES.designResellerEdit(id));
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title="Add reseller email design"
      description="Choose a reseller to open the visual design builder."
      primaryButtonLabel="Open builder"
      primaryButtonDisabled={!resellerId.trim()}
    >
      <ConfigurationResellerSelect value={resellerId} onChange={setResellerId} />
    </FormModal>
  );
}
