"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { FormModal } from "@/components/common";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { MailConnectionForm } from "./MailConnectionForm";
import { useOwnMailProviderForm } from "../hooks/useOwnMailProviderForm";
import {
  useDeletePlatformEmailSettingsMutation,
  usePlatformEmailSettingsQuery,
  useTestPlatformEmailSettingsMutation,
  useUpdatePlatformEmailSettingsMutation,
} from "../hooks/useEmailSettings";
import { EmailDeleteConfirmModal } from "./EmailDeleteConfirmModal";
import { EmailModalDangerZone } from "./EmailModalDangerZone";

export function PlatformMailConfigModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { hasOperational } = useAuth();
  const canView = hasOperational(OP.smtpEmail.view);
  const canUpdate = hasOperational(OP.smtpEmail.update);
  const canTest = hasOperational(OP.smtpEmail.test);
  const canDelete = hasOperational(OP.smtpEmail.delete);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const settingsQuery = usePlatformEmailSettingsQuery({ enabled: open && canView });
  const updateMutation = useUpdatePlatformEmailSettingsMutation();
  const testMutation = useTestPlatformEmailSettingsMutation();
  const deleteMutation = useDeletePlatformEmailSettingsMutation();

  const form = useOwnMailProviderForm({
    enabled: open && canView,
    settings: settingsQuery.data,
    onSave: async (body) => {
      await updateMutation.mutateAsync(body);
      onSaved?.();
    },
    onTest: (body) => testMutation.mutateAsync(body),
  });

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
      publishAppToast({ variant: "success", message: "Platform mail settings removed." });
      setDeleteConfirmOpen(false);
      onSaved?.();
      onClose();
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err) ?? "Could not remove settings.",
      });
    }
  };

  const hasConfig = Boolean(settingsQuery.data?.emailProviderId);

  return (
    <>
      <FormModal
        open={open}
        title="Platform email configuration"
        description="SMTP or API used as the platform default. Resellers on “Use platform mail” inherit this connection unless they override the from address."
        onClose={onClose}
        onSave={() => {
          if (canUpdate) void form.handleSave();
        }}
        primaryButtonLabel={updateMutation.isPending ? "Saving…" : "Save changes"}
        primaryButtonDisabled={updateMutation.isPending || !canUpdate}
        maxWidth={760}
        fitContent
        showCancelButton
        cancelButtonLabel={hasConfig ? "Close" : "Cancel"}
      >
        {settingsQuery.isLoading ? (
          <Skeleton variant="rounded" height={320} />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <MailConnectionForm
              form={form}
              disabled={!canUpdate}
              existingFields={settingsQuery.data?.fields}
              canTest={canTest}
              testing={testMutation.isPending}
              lastTestStatus={settingsQuery.data?.lastTestStatus}
              lastTestedAt={settingsQuery.data?.lastTestedAt}
              showAudit
              audit={{
                updatedBy: settingsQuery.data?.updatedBy,
                updatedAt: settingsQuery.data?.updatedAt,
                lastTestedBy: settingsQuery.data?.lastTestedBy,
              }}
            />

            {canDelete && hasConfig ? (
              <EmailModalDangerZone
                title="Remove platform configuration"
                description="Resellers on platform mail will not be able to send until you configure platform email again."
                buttonLabel="Remove configuration"
                onRemove={() => setDeleteConfirmOpen(true)}
                removing={deleteMutation.isPending}
              />
            ) : null}
          </Box>
        )}
      </FormModal>

      <EmailDeleteConfirmModal
        open={deleteConfirmOpen}
        title="Remove platform configuration?"
        description="This deletes the platform SMTP/API settings. Assigned resellers will remain listed but cannot send until you configure platform mail again."
        confirmLabel="Remove configuration"
        onDismiss={() => setDeleteConfirmOpen(false)}
        onConfirm={() => void handleDelete()}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
