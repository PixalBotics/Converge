"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { FormModal } from "@/components/common";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { MailConnectionForm } from "./MailConnectionForm";
import { EmailConnectionTestModal } from "./EmailConnectionTestModal";
import { useOwnMailProviderForm } from "../hooks/useOwnMailProviderForm";
import {
  useDeletePlatformEmailSettingsMutation,
  usePlatformEmailSettingsQuery,
  useTestPlatformEmailSettingsMutation,
  useUpdatePlatformEmailSettingsMutation,
} from "../hooks/useEmailSettings";
import { EmailDeleteConfirmModal } from "./EmailDeleteConfirmModal";
import { EmailModalDangerZone } from "./EmailModalDangerZone";
import {
  extractEmailTestErrorMessage,
  formatMailTestErrorMessage,
  readTestMessage,
} from "../utils/email-test.utils";

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
  const canDelete = hasOperational(OP.smtpEmail.delete);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);

  const settingsQuery = usePlatformEmailSettingsQuery({ enabled: open && canView });

  useEffect(() => {
    if (open && canView) void settingsQuery.refetch();
  }, [open, canView]);
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
  });

  const handleSave = async () => {
    const saved = await form.handleSave();
    if (!saved) return;
    onClose();
    setTestModalOpen(true);
  };

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
  const formReady = settingsQuery.isSuccess && !settingsQuery.isFetching;
  const formKey = form.settingsFingerprint || "new";

  return (
    <>
      <FormModal
        open={open}
        title="Platform email configuration"
        description="Default outbound mail for the platform and for resellers assigned to platform mail."
        onClose={onClose}
        onSave={() => {
          if (canUpdate) void handleSave();
        }}
        primaryButtonLabel={updateMutation.isPending ? "Saving…" : "Save configuration"}
        primaryButtonDisabled={updateMutation.isPending || !canUpdate}
        maxWidth={760}
        fitContent
        showCancelButton
        cancelButtonLabel={hasConfig ? "Close" : "Cancel"}
      >
        {!formReady ? (
          <Skeleton variant="rounded" height={320} />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <MailConnectionForm
              key={formKey}
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

      <EmailConnectionTestModal
        open={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        title="Test platform mail"
        description="Configuration saved. Send a test email to confirm your platform mail is working."
        testing={testMutation.isPending}
        disabled={!hasOperational(OP.smtpEmail.test)}
        lastTestStatus={settings?.lastTestStatus}
        lastTestedAt={settings?.lastTestedAt}
        lastTestMessage={settings?.lastTestMessage}
        onTest={async (toEmail) => {
          try {
            const result = await testMutation.mutateAsync({ toEmail });
            onSaved?.();
            const raw = readTestMessage(result.message);
            return {
              success: result.success,
              message: result.success
                ? raw ?? "Test email sent."
                : formatMailTestErrorMessage(raw ?? "Test failed."),
            };
          } catch (err) {
            return {
              success: false,
              message: formatMailTestErrorMessage(extractEmailTestErrorMessage(err)),
            };
          }
        }}
      />

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
