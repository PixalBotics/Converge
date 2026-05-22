"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import { FormModal } from "@/components/common";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { ConfigurationResellerSelect } from "./configuration/ConfigurationResellerSelect";
import { MailConnectionForm } from "./MailConnectionForm";
import { EmailConnectionTestSection } from "./EmailConnectionTestSection";
import { useOwnMailProviderForm } from "../hooks/useOwnMailProviderForm";
import {
  useDeleteResellerOwnMailMutation,
  useResellerOwnMailSettingsQuery,
  useTestResellerOwnMailMutation,
  useUpdateResellerOwnMailMutation,
} from "../hooks/useEmailSettings";
import { resellerOwnMailErrorMessage } from "../utils/reseller-mail-errors";
import { EmailDeleteConfirmModal } from "./EmailDeleteConfirmModal";
import { EmailLockedResellerBanner } from "./EmailLockedResellerBanner";
import { EmailModalDangerZone } from "./EmailModalDangerZone";
import { readTestMessage } from "../utils/email-test.utils";

export function ResellerOwnMailModal({
  open,
  resellerId: initialResellerId,
  lockedResellerId,
  resellerLabel,
  onClose,
  onSaved,
}: {
  open: boolean;
  resellerId: string;
  lockedResellerId: string | null;
  resellerLabel?: string;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { hasOperational } = useAuth();
  const canUpdate = hasOperational(OP.smtpEmail.update);
  const canTest = hasOperational(OP.smtpEmail.test);
  const canDelete = hasOperational(OP.smtpEmail.delete);

  const [resellerId, setResellerId] = useState(initialResellerId);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const activeId = (lockedResellerId ?? resellerId).trim();

  useEffect(() => {
    if (!open) return;
    setResellerId(initialResellerId || lockedResellerId || "");
  }, [open, initialResellerId, lockedResellerId]);

  const settingsQuery = useResellerOwnMailSettingsQuery(activeId, { enabled: open && Boolean(activeId) });
  const updateMutation = useUpdateResellerOwnMailMutation(activeId);
  const testMutation = useTestResellerOwnMailMutation(activeId);
  const deleteMutation = useDeleteResellerOwnMailMutation();

  const form = useOwnMailProviderForm({
    enabled: open && Boolean(activeId),
    settings: settingsQuery.data,
    onSave: async (body) => {
      await updateMutation.mutateAsync(body);
      onSaved?.();
    },
    onTest: (body) => testMutation.mutateAsync(body),
  });

  const title = useMemo(
    () =>
      lockedResellerId || (activeId && settingsQuery.data?.emailProviderId)
        ? "Edit reseller mail"
        : activeId
          ? "Reseller mail settings"
          : "Add reseller mail",
    [activeId, lockedResellerId, settingsQuery.data?.emailProviderId],
  );

  const loadErrorMessage = settingsQuery.isError
    ? resellerOwnMailErrorMessage(settingsQuery.error)
    : null;

  const handleDelete = async () => {
    if (!activeId) return;
    try {
      await deleteMutation.mutateAsync(activeId);
      publishAppToast({ variant: "success", message: "Reseller mail settings removed." });
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
        title={title}
        description="This reseller’s own SMTP or API credentials. Parent-company mail uses this when not on platform mail."
        onClose={onClose}
        onSave={() => {
          if (canUpdate) void form.handleSave();
        }}
        primaryButtonLabel={updateMutation.isPending ? "Saving…" : "Save configuration"}
        primaryButtonDisabled={updateMutation.isPending || !activeId || !canUpdate}
        maxWidth={760}
        fitContent
        showCancelButton
        cancelButtonLabel={hasConfig ? "Close" : "Cancel"}
      >
        {lockedResellerId ? (
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
        ) : settingsQuery.isLoading ? (
          <Skeleton variant="rounded" height={200} sx={{ mt: 1 }} />
        ) : loadErrorMessage ? (
          <Alert severity="warning" sx={{ mt: 1 }}>
            {loadErrorMessage}
          </Alert>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0, mt: 0.5 }}>
            <MailConnectionForm
              form={form}
              disabled={!canUpdate}
              existingFields={settings?.fields}
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
                  const message =
                    readTestMessage(result.message) ??
                    (result.success ? "Test email sent successfully." : "Test email failed.");
                  if (result.success) onSaved?.();
                  return { success: result.success, message };
                }}
              />
            ) : null}

            {canDelete && hasConfig ? (
              <Box sx={{ mt: 2 }}>
                <EmailModalDangerZone
                  title="Remove reseller mail"
                  description="This reseller will not send with their own credentials until configured again."
                  buttonLabel="Remove own mail settings"
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
        title="Remove reseller mail settings?"
        description={
          resellerLabel?.trim()
            ? `SMTP/API settings for "${resellerLabel.trim()}" will be deleted.`
            : "SMTP/API settings for this reseller will be deleted."
        }
        confirmLabel="Remove settings"
        onDismiss={() => setDeleteConfirmOpen(false)}
        onConfirm={() => void handleDelete()}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
