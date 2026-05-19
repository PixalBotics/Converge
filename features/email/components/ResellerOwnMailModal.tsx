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
import { EmailQuickTestPanel } from "./EmailQuickTestPanel";
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
import { extractEmailTestErrorMessage, readTestMessage } from "../utils/email-test.utils";

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
  const lockedLabel = resellerLabel?.trim() || activeId;
  const testDisabled = !canTest || !hasConfig || !form.isEnabled || updateMutation.isPending;

  return (
    <>
      <FormModal
        open={open}
        title={title}
        description="SMTP or API credentials for this reseller. Does not include platform mail assignment."
        onClose={onClose}
        onSave={() => {
          if (canUpdate) void form.handleSave();
        }}
        primaryButtonLabel={updateMutation.isPending ? "Saving…" : "Save settings"}
        primaryButtonDisabled={updateMutation.isPending || !activeId || !canUpdate}
        maxWidth={760}
        fitContent
        showCancelButton
        cancelButtonLabel={hasConfig ? "Close" : "Cancel"}
      >
        {lockedResellerId ? (
          <EmailLockedResellerBanner label={lockedLabel} />
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 0.5 }}>
            <MailConnectionForm
              form={form}
              disabled={!canUpdate}
              existingFields={settingsQuery.data?.fields}
              showTestStep={false}
            />

            {hasConfig && form.savedOnce ? (
              <EmailQuickTestPanel
                disabled={testDisabled || !canUpdate}
                testing={testMutation.isPending}
                onTest={async (toEmail) => {
                  try {
                    const result = await testMutation.mutateAsync({ toEmail });
                    const message =
                      readTestMessage(result.message) ??
                      (result.success ? "Test email sent successfully." : "Test email failed.");
                    publishAppToast({
                      variant: result.success ? "success" : "error",
                      message,
                    });
                    onSaved?.();
                    return { success: result.success, message };
                  } catch (err) {
                    const message = extractEmailTestErrorMessage(err);
                    publishAppToast({ variant: "error", message });
                    return { success: false, message };
                  }
                }}
              />
            ) : hasConfig ? (
              <TypographyMuted>Save settings once to send a test email.</TypographyMuted>
            ) : null}

            {canDelete && hasConfig ? (
              <EmailModalDangerZone
                title="Remove reseller mail"
                description="This reseller will no longer send with their own SMTP/API until configured again."
                buttonLabel="Remove own mail settings"
                onRemove={() => setDeleteConfirmOpen(true)}
                removing={deleteMutation.isPending}
              />
            ) : null}
          </Box>
        )}
      </FormModal>

      <EmailDeleteConfirmModal
        open={deleteConfirmOpen}
        title="Remove reseller mail settings?"
        description={
          lockedLabel
            ? `SMTP/API settings for "${lockedLabel}" will be deleted.`
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

function TypographyMuted({ children }: { children: React.ReactNode }) {
  return (
    <Box component="span" sx={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
      {children}
    </Box>
  );
}
