"use client";

import { useEffect, useState } from "react";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import Box from "@mui/material/Box";
import { FormModal, InputField, SelectField } from "@/components/common";

const STATUS_OPTIONS = [
  { label: "Block", value: "block" },
  { label: "Allow", value: "allow" },
];

export type EditIpBlockSavePayload = {
  ipAddress: string;
  reason?: string;
  status: string;
};

export interface EditIpBlockModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (payload: EditIpBlockSavePayload) => void | Promise<void>;
  initialIpAddress?: string;
  initialReason?: string;
  initialStatus?: string;
}

export function EditIpBlockModal({
  open,
  onClose,
  onSave,
  initialIpAddress = "",
  initialReason = "",
  initialStatus = "block",
}: EditIpBlockModalProps) {
  const [ipAddress, setIpAddress] = useState(initialIpAddress);
  const [status, setStatus] = useState(initialStatus);
  const [reason, setReason] = useState(initialReason);

  useEffect(() => {
    if (!open) return;
    setIpAddress(initialIpAddress);
    setStatus(initialStatus);
    setReason(initialReason);
  }, [open, initialIpAddress, initialReason, initialStatus]);

  const handleSave = async () => {
    await onSave?.({
      ipAddress: ipAddress.trim(),
      reason: reason.trim() || undefined,
      status,
    });
  };

  return (
    <FormModal
      open={open}
      title="Edit IP Block"
      description="Update the IP rule for this website."
      maxWidth={560}
      fitContent
      onClose={onClose}
      onSave={handleSave}
      cancelButtonLabel="Cancel"
      primaryButtonLabel="Update"
      primaryStartIcon={<AutoAwesome sx={{ fontSize: 18 }} />}
      sx={{
        borderRadius: 3,
        p: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <InputField
          label="IP Address"
          name="ipAddress"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
        />
        <SelectField label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
      </Box>
      <InputField label="Reason" name="reason" value={reason} onChange={(e) => setReason(e.target.value)} />
    </FormModal>
  );
}
