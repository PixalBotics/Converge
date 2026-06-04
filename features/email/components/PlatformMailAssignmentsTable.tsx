"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { iconGlyphSx } from "@/lib/design-system";
import { Button, DataTable, Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import type { PlatformMailAssignmentListItem } from "../types";
import { AddCircleIcon } from "@/components/common/icons";
import { useSmtpEmailAccess } from "../hooks/useSmtpEmailAccess";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { PlatformMailAssignmentModal } from "./PlatformMailAssignmentModal";
import { EmailDeleteConfirmModal } from "./EmailDeleteConfirmModal";
import {
  useDeletePlatformMailAssignmentMutation,
  usePlatformEmailSettingsQuery,
  usePlatformMailAssignmentListQuery,
} from "../hooks/useEmailSettings";
import { EmailTestStatusCell } from "./EmailTestStatusCell";
import { PROVIDER_CODE_LABELS, EMAIL_ROUTES } from "../email.constants";
import { EmailConfigTableCard, EmailHelpAlert } from "../styles/email-configuration.styled";
import { departmentsFooterRow, footerMutedText, gradientPrimaryButtonSx } from "../styles/email-page.styles";
import { emailAssignmentsTableSx, emailTablePanelSx } from "../styles/email-table.styles";
import { EmailStatusChip } from "./EmailStatusChip";
import { EmailTableActions } from "./EmailTableActions";
import { EmailTableCardHeader } from "./EmailTableCardHeader";
import { EmailTableTextCell } from "./EmailTableTextCell";

function formatPlatformSender(fromName?: string | null, fromEmail?: string | null): string {
  const email = fromEmail?.trim();
  const name = fromName?.trim();
  if (!email) return "Platform default";
  return name ? `${name} <${email}>` : email;
}

function providerLabel(row: PlatformMailAssignmentListItem): string {
  return (
    row.providerName ??
    PROVIDER_CODE_LABELS[row.providerCode ?? ""] ??
    row.providerCode ??
    "—"
  );
}

type DeleteTarget = { resellerId: string; resellerName: string };

export function PlatformMailAssignmentsTable({
  syncEditQueryParam = false,
}: {
  syncEditQueryParam?: boolean;
}) {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canView, canUpdate, canDelete } = useSmtpEmailAccess();

  const platformQuery = usePlatformEmailSettingsQuery({ enabled: canView });
  const listQuery = usePlatformMailAssignmentListQuery({ enabled: canView });
  const deleteMutation = useDeletePlatformMailAssignmentMutation();
  const rows = useMemo(() => listQuery.data ?? [], [listQuery.data]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editResellerId, setEditResellerId] = useState("");
  const [editResellerLabel, setEditResellerLabel] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const platformConfigured = Boolean(platformQuery.data?.emailProviderId);

  const openModal = useCallback((resellerId: string, resellerName?: string) => {
    setEditResellerId(resellerId);
    setEditResellerLabel(resellerName?.trim() ?? "");
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditResellerId("");
    setEditResellerLabel("");
    if (syncEditQueryParam && searchParams.get("edit")) {
      router.replace(EMAIL_ROUTES.setupAssignment);
    }
  }, [router, searchParams, syncEditQueryParam]);

  const handleConfirmDelete = async () => {
    const rid = deleteTarget?.resellerId.trim();
    if (!rid) return;
    try {
      await deleteMutation.mutateAsync(rid);
      publishAppToast({ variant: "success", message: "Assignment removed." });
      setDeleteTarget(null);
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err) ?? "Could not remove assignment.",
      });
    }
  };

  useEffect(() => {
    if (!syncEditQueryParam) return;
    const edit = searchParams.get("edit")?.trim();
    if (edit) openModal(decodeURIComponent(edit));
  }, [searchParams, openModal, syncEditQueryParam]);

  const columns = useMemo<DataTableColumn<PlatformMailAssignmentListItem>[]>(
    () => [
      {
        id: "resellerName",
        label: "Reseller",
        render: (_v, row) => <EmailTableTextCell value={row.resellerName} />,
      },
      {
        id: "providerName",
        label: "Provider",
        render: (_v, row) => <EmailTableTextCell value={providerLabel(row)} muted />,
      },
      {
        id: "fromEmail",
        label: "Sender",
        render: () => (
          <EmailTableTextCell
            value={formatPlatformSender(platformQuery.data?.fromName, platformQuery.data?.fromEmail)}
          />
        ),
      },
      {
        id: "isEnabled",
        label: "Status",
        render: (_v, row) => (
          <Box sx={{ display: "inline-flex", flexShrink: 0 }}>
            <EmailStatusChip active={row.isEnabled} />
          </Box>
        ),
      },
      {
        id: "lastTestedAt",
        label: "Last test",
        render: (_v, row) => (
          <EmailTestStatusCell
            status={row.lastTestStatus}
            testedAt={row.lastTestedAt}
            message={row.lastTestMessage}
          />
        ),
      },
    ],
    [platformQuery.data?.fromEmail, platformQuery.data?.fromName],
  );

  if (!canView) return null;

  const isLoading = listQuery.isLoading || listQuery.isFetching;

  const assignButton =
    canUpdate ? (
      <Button
        type="button"
        variant="primary"
        startIcon={<AddCircleIcon />}
        sx={gradientPrimaryButtonSx}
        onClick={() => openModal("")}
        disabled={!platformConfigured}
      >
        Assign platform mail
      </Button>
    ) : null;

  return (
    <>
      {!platformConfigured && !platformQuery.isLoading ? (
        <EmailHelpAlert severity="warning" variant="outlined" sx={{ mb: 0 }}>
          Configure platform email before assigning resellers to platform mail.
        </EmailHelpAlert>
      ) : null}

      <EmailConfigTableCard elevation={0}>
        <EmailTableCardHeader
          icon={
            <GroupsOutlined
              sx={{
                ...(iconGlyphSx("sm") as object),
                color: theme.app.dashboard.white95,
              }}
            />
          }
          title="Resellers on platform mail"
          subtitle="These resellers send using the global platform configuration."
          action={assignButton}
        />

        <DataTable<PlatformMailAssignmentListItem>
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id || row.resellerId}
          isLoading={isLoading}
          minWidth={1040}
          size="medium"
          tableSx={emailAssignmentsTableSx}
          containerSx={emailTablePanelSx}
          emptyState={{
            title: listQuery.isError
              ? "Could not load assignments"
              : platformConfigured
                ? "No resellers on platform mail yet"
                : "Configure platform mail first",
            description: listQuery.isError
              ? "Check your connection and try again."
              : platformConfigured
                ? "Click Assign platform mail to add a reseller."
                : "Complete platform SMTP/API setup, then assign resellers here.",
          }}
          actionColumn={
            canUpdate || canDelete
              ? {
                  label: "Actions",
                  render: (row) => {
                    const rid = row.resellerId.trim();
                    const isDeletingThis =
                      deleteMutation.isPending && deleteMutation.variables === rid;
                    return (
                      <EmailTableActions
                        editLabel={`Edit platform mail for ${row.resellerName}`}
                        deleteLabel={`Remove platform mail for ${row.resellerName}`}
                        canEdit={canUpdate}
                        canDelete={canDelete}
                        deleteDisabled={!rid}
                        deleting={isDeletingThis}
                        onEdit={canUpdate ? () => openModal(rid, row.resellerName) : undefined}
                        onDelete={
                          canDelete
                            ? () =>
                                setDeleteTarget({
                                  resellerId: rid,
                                  resellerName: row.resellerName,
                                })
                            : undefined
                        }
                      />
                    );
                  },
                }
              : undefined
          }
        />

        <Box sx={departmentsFooterRow}>
          <Typography variant="medium" sx={footerMutedText(theme)}>
            {isLoading ? "Loading…" : `${rows.length} reseller${rows.length === 1 ? "" : "s"}`}
          </Typography>
        </Box>
      </EmailConfigTableCard>

      <PlatformMailAssignmentModal
        open={modalOpen}
        resellerId={editResellerId}
        resellerLabel={editResellerLabel}
        lockReseller={Boolean(editResellerId.trim())}
        onClose={closeModal}
        onSaved={() => {
          void listQuery.refetch();
        }}
      />

      <EmailDeleteConfirmModal
        open={Boolean(deleteTarget)}
        title="Remove platform mail assignment?"
        description={
          deleteTarget
            ? `"${deleteTarget.resellerName}" will no longer send using platform mail. You can assign them again later.`
            : ""
        }
        confirmLabel="Remove assignment"
        onDismiss={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
