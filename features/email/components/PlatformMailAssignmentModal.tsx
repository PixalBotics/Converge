"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Switch from "@mui/material/Switch";
import { FormModal, InputField } from "@/components/common";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { ConfigurationResellerSelect } from "./configuration/ConfigurationResellerSelect";
import {
  useDeletePlatformMailAssignmentMutation,
  usePlatformMailAssignmentQuery,
  useUpdatePlatformMailAssignmentMutation,
} from "../hooks/useEmailSettings";
import { EmailConfigFormGrid2, EmailEnableRow } from "../styles/email-configuration.styled";
import { EmailDeleteConfirmModal } from "./EmailDeleteConfirmModal";
import { EmailLockedResellerBanner } from "./EmailLockedResellerBanner";
import { EmailModalDangerZone } from "./EmailModalDangerZone";

export function PlatformMailAssignmentModal({
  open,
  resellerId: initialResellerId,
  resellerLabel,
  lockReseller = false,
  onClose,
  onSaved,
}: {
  open: boolean;
  resellerId: string;
  resellerLabel?: string;
  lockReseller?: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { hasOperational } = useAuth();
  const canUpdate = hasOperational(OP.smtpEmail.update);
  const canDelete = hasOperational(OP.smtpEmail.delete);

  const [resellerId, setResellerId] = useState(initialResellerId);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const activeId = resellerId.trim();

  useEffect(() => {
    if (open) setResellerId(initialResellerId);
  }, [open, initialResellerId]);

  const assignmentQuery = usePlatformMailAssignmentQuery(activeId, {
    enabled: open && Boolean(activeId),
  });
  const updateMutation = useUpdatePlatformMailAssignmentMutation(activeId);
  const deleteMutation = useDeletePlatformMailAssignmentMutation();

  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    const a = assignmentQuery.data;
    if (!a) return;
    setFromEmail(a.fromEmail ?? "");
    setFromName(a.fromName ?? "");
    setIsEnabled(Boolean(a.isEnabled));
  }, [assignmentQuery.data]);

  const handleSave = async () => {
    if (!activeId) {
      publishAppToast({ variant: "error", message: "Select a reseller." });
      return;
    }
    try {
      await updateMutation.mutateAsync({
        fromEmail: fromEmail.trim() || undefined,
        fromName: fromName.trim() || undefined,
        isEnabled,
      });
      publishAppToast({ variant: "success", message: "Platform mail assignment saved." });
      onSaved?.();
      onClose();
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err) ?? "Could not save assignment.",
      });
    }
  };

  const handleDelete = async () => {
    if (!activeId) return;
    try {
      await deleteMutation.mutateAsync(activeId);
      publishAppToast({ variant: "success", message: "Assignment removed." });
      setDeleteConfirmOpen(false);
      onSaved?.();
      onClose();
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err) ?? "Could not remove assignment.",
      });
    }
  };

  const isEdit = lockReseller && Boolean(activeId);
  const showDangerZone = canDelete && isEdit && assignmentQuery.isSuccess;

  return (
    <>
      <FormModal
        open={open}
        title={isEdit ? "Edit platform mail assignment" : "Assign platform mail"}
        description="Reseller sends using global platform mail. Optional from-address overrides apply on top of the platform default."
        onClose={onClose}
        onSave={() => {
          if (canUpdate) void handleSave();
        }}
        primaryButtonLabel={updateMutation.isPending ? "Saving…" : "Save assignment"}
        primaryButtonDisabled={updateMutation.isPending || !canUpdate || !activeId}
        maxWidth={560}
        fitContent
        showCancelButton
        cancelButtonLabel={isEdit ? "Close" : "Cancel"}
      >
        {lockReseller && activeId ? (
          <EmailLockedResellerBanner label={resellerLabel?.trim() || activeId} />
        ) : (
          <ConfigurationResellerSelect
            value={resellerId}
            onChange={setResellerId}
            disabled={updateMutation.isPending || !canUpdate}
          />
        )}

        {!activeId ? (
          <Box sx={{ color: "rgba(255,255,255,0.65)", fontSize: 14, mt: 1 }}>
            Select a reseller to continue.
          </Box>
        ) : assignmentQuery.isLoading ? (
          <Skeleton variant="rounded" height={120} sx={{ mt: 1 }} />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <EmailConfigFormGrid2>
              <InputField
                label="From email (override)"
                name="fromEmail"
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="Leave empty to use platform default"
                disabled={!canUpdate}
              />
              <InputField
                label="From name (override)"
                name="fromName"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                disabled={!canUpdate}
              />
            </EmailConfigFormGrid2>

            <EmailEnableRow>
              <Box>
                <Box component="span" sx={{ fontWeight: 600, fontSize: 14, color: "inherit" }}>
                  Enabled
                </Box>
                <Box component="span" sx={{ display: "block", fontSize: 12, opacity: 0.72, mt: 0.25 }}>
                  When off, this reseller will not send via platform mail.
                </Box>
              </Box>
              <Switch
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                disabled={!canUpdate}
              />
            </EmailEnableRow>

            {showDangerZone ? (
              <EmailModalDangerZone
                title="Remove assignment"
                description="This reseller will stop using platform mail. Their own SMTP/API settings are not affected."
                buttonLabel="Remove assignment"
                onRemove={() => setDeleteConfirmOpen(true)}
                removing={deleteMutation.isPending}
              />
            ) : null}
          </Box>
        )}
      </FormModal>

      <EmailDeleteConfirmModal
        open={deleteConfirmOpen}
        title="Remove platform mail assignment?"
        description={
          resellerLabel?.trim()
            ? `"${resellerLabel.trim()}" will no longer send using platform mail.`
            : "This reseller will no longer send using platform mail."
        }
        confirmLabel="Remove assignment"
        onDismiss={() => setDeleteConfirmOpen(false)}
        onConfirm={() => void handleDelete()}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
