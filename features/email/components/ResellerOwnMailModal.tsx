"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import { FormModal } from "@/components/common";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { useSmtpEmailAccess } from "../hooks/useSmtpEmailAccess";
import { ConfigurationResellerSelect } from "./configuration/ConfigurationResellerSelect";
import { MailConnectionForm } from "./MailConnectionForm";
import { EmailConnectionTestModal } from "./EmailConnectionTestModal";
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
import {
  extractEmailTestErrorMessage,
  formatMailTestErrorMessage,
  readTestMessage,
} from "../utils/email-test.utils";

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
  const { canUpdate, canDelete, canTest } = useSmtpEmailAccess();

  const [resellerId, setResellerId] = useState(initialResellerId);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const activeId = (lockedResellerId ?? resellerId).trim();

  useEffect(() => {
    if (!open) return;
    setResellerId(initialResellerId || lockedResellerId || "");
  }, [open, initialResellerId, lockedResellerId]);

  useEffect(() => {
    if (!open) setTestModalOpen(false);
  }, [open]);

  const settingsQuery = useResellerOwnMailSettingsQuery(activeId, { enabled: open && Boolean(activeId) });

  useEffect(() => {
    if (open && activeId) void settingsQuery.refetch();
  }, [open, activeId]);
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
  });

  const handleSave = async () => {
    const saved = await form.handleSave();
    if (!saved) return;
    onClose();
    setTestModalOpen(true);
  };

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
  const formReady =
    Boolean(activeId) && settingsQuery.isSuccess && !settingsQuery.isFetching;
  const formKey = `${activeId}-${form.settingsFingerprint || "new"}`;

  return (
    <>
      <FormModal
        open={open}
        title={title}
        description="This reseller’s own SMTP or API credentials. Parent-company mail uses this when not on platform mail."
        onClose={onClose}
        onSave={() => {
          if (canUpdate) void handleSave();
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
        ) : loadErrorMessage ? (
          <Alert severity="warning" sx={{ mt: 1 }}>
            {loadErrorMessage}
          </Alert>
        ) : !formReady ? (
          <Skeleton variant="rounded" height={200} sx={{ mt: 1 }} />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0, mt: 0.5 }}>
            <MailConnectionForm
              key={formKey}
              form={form}
              disabled={!canUpdate}
              existingFields={settings?.fields}
            />

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

      <EmailConnectionTestModal
        open={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        title="Test reseller mail"
        description="Configuration saved. Send a test email to confirm this reseller’s mail is working."
        testing={testMutation.isPending}
        disabled={!canTest || !activeId}
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
