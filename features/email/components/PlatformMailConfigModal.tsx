"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { FormModal } from "@/components/common";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { MailConnectionForm } from "./MailConnectionForm";
import { EmailConnectionTestSection } from "./EmailConnectionTestSection";
import { useOwnMailProviderForm } from "../hooks/useOwnMailProviderForm";
import {
  useDeletePlatformEmailSettingsMutation,
  usePlatformEmailSettingsQuery,
  useTestPlatformEmailSettingsMutation,
  useUpdatePlatformEmailSettingsMutation,
} from "../hooks/useEmailSettings";
import { EmailDeleteConfirmModal } from "./EmailDeleteConfirmModal";
import { EmailModalDangerZone } from "./EmailModalDangerZone";
import { readTestMessage } from "../utils/email-test.utils";

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
    onTest: async (body) => {
      const result = await testMutation.mutateAsync(body);
      const message =
        readTestMessage(result.message) ??
        (result.success ? "Test email sent successfully." : "Test email failed.");
      onSaved?.();
      return { success: result.success, message };
    },
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
  const settings = settingsQuery.data;
  const testReady = form.savedOnce && form.isEnabled && hasConfig;
  const testDisabled = !canTest || !testReady || updateMutation.isPending;

  return (
    <>
      <FormModal
        open={open}
        title="Platform email configuration"
        description="Default outbound mail for the platform and for resellers assigned to platform mail."
        onClose={onClose}
        onSave={() => {
          if (canUpdate) void form.handleSave();
        }}
        primaryButtonLabel={updateMutation.isPending ? "Saving…" : "Save configuration"}
        primaryButtonDisabled={updateMutation.isPending || !canUpdate}
        maxWidth={760}
        fitContent
        showCancelButton
        cancelButtonLabel={hasConfig ? "Close" : "Cancel"}
      >
        {settingsQuery.isLoading ? (
          <Skeleton variant="rounded" height={320} />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <MailConnectionForm
              form={form}
              disabled={!canUpdate}
              existingFields={settings?.fields}
              showAudit
              audit={{
                updatedBy: settings?.updatedBy,
                updatedAt: settings?.updatedAt,
                lastTestedBy: settings?.lastTestedBy,
              }}
            />

            {hasConfig ? (
              <EmailConnectionTestSection
                ready={testReady}
                disabled={testDisabled}
                testing={testMutation.isPending}
                lastTestStatus={settings?.lastTestStatus}
                lastTestedAt={settings?.lastTestedAt}
                lastTestMessage={settings?.lastTestMessage}
                onTest={async (toEmail) => {
                  const result = await form.handleTest({ toEmail });
                  return {
                    success: result.success,
                    message:
                      readTestMessage(result.message) ??
                      (result.success ? "Test email sent." : "Test failed."),
                  };
                }}
              />
            ) : null}

            {canDelete && hasConfig ? (
              <Box sx={{ mt: 2 }}>
                <EmailModalDangerZone
                  title="Remove platform configuration"
                  description="Resellers on platform mail cannot send until platform email is configured again."
                  buttonLabel="Remove configuration"
                  onRemove={() => setDeleteConfirmOpen(true)}
                  removing={deleteMutation.isPending}
                />
              </Box>
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
