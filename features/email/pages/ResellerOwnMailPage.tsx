"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import MailOutline from "@mui/icons-material/MailOutline";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { iconGlyphSx } from "@/lib/design-system";
import { Button, DataTable, PermissionDeniedPanel, Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import type { ResellerOwnMailListItem } from "@/api/types/email.types";
import { AddCircleIcon } from "@/components/common/icons";
import { useAuth } from "@/lib/auth";
import { useSmtpEmailAccess } from "../hooks/useSmtpEmailAccess";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { ResellerOwnMailModal } from "../components/ResellerOwnMailModal";
import { EmailDeleteConfirmModal } from "../components/EmailDeleteConfirmModal";
import {
  useDeleteResellerOwnMailMutation,
  useResellerOwnMailListQuery,
} from "../hooks/useEmailSettings";
import { EMAIL_ROUTES, PROVIDER_CODE_LABELS } from "../email.constants";
import { EmailConfigTableCard } from "../styles/email-configuration.styled";
import { departmentsFooterRow, footerMutedText, gradientPrimaryButtonSx } from "../styles/email-page.styles";
import { emailResellerMailTableSx, emailTablePanelSx } from "../styles/email-table.styles";
import { EmailStatusChip } from "../components/EmailStatusChip";
import { EmailTableActions } from "../components/EmailTableActions";
import { EmailTableCardHeader } from "../components/EmailTableCardHeader";
import { EmailTableTextCell } from "../components/EmailTableTextCell";

type DeleteTarget = { resellerId: string; resellerName: string };

function providerLabel(row: ResellerOwnMailListItem): string {
  return (
    row.providerName ??
    row.provider ??
    PROVIDER_CODE_LABELS[row.providerCode ?? ""] ??
    row.providerCode ??
    "—"
  );
}

export function ResellerOwnMailPage() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { canView, canUpdate, canDelete } = useSmtpEmailAccess();

  const fixedResellerId = user?.resellerId?.trim() || null;
  const listQuery = useResellerOwnMailListQuery({ enabled: canView && !fixedResellerId });
  const deleteMutation = useDeleteResellerOwnMailMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editResellerId, setEditResellerId] = useState("");
  const [editResellerLabel, setEditResellerLabel] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const rows = useMemo(() => {
    const list = listQuery.data ?? [];
    if (fixedResellerId) {
      const mine = list.filter((r) => r.resellerId === fixedResellerId);
      if (mine.length > 0) return mine;
      return [
        {
          resellerId: fixedResellerId,
          resellerName: fixedResellerId,
          isEnabled: false,
        } as ResellerOwnMailListItem,
      ];
    }
    return list;
  }, [listQuery.data, fixedResellerId]);

  const openModal = useCallback((resellerId: string, resellerName?: string) => {
    setEditResellerId(resellerId);
    setEditResellerLabel(resellerName?.trim() ?? "");
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditResellerId("");
    setEditResellerLabel("");
    if (searchParams.get("edit")) {
      router.replace(EMAIL_ROUTES.setupReseller);
    }
  }, [router, searchParams]);

  const handleConfirmDelete = async () => {
    const rid = deleteTarget?.resellerId.trim();
    if (!rid) return;
    try {
      await deleteMutation.mutateAsync(rid);
      publishAppToast({ variant: "success", message: "Reseller mail settings removed." });
      setDeleteTarget(null);
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err) ?? "Could not remove settings.",
      });
    }
  };

  useEffect(() => {
    const edit = searchParams.get("edit")?.trim();
    if (edit) openModal(decodeURIComponent(edit));
  }, [searchParams, openModal]);

  useEffect(() => {
    if (fixedResellerId && canView) {
      openModal(fixedResellerId);
    }
  }, [fixedResellerId, canView, openModal]);

  const columns = useMemo<DataTableColumn<ResellerOwnMailListItem>[]>(
    () => [
      {
        id: "resellerName",
        label: "Reseller",
        render: (_v, row) => <EmailTableTextCell value={row.resellerName} />,
      },
      {
        id: "provider",
        label: "Provider",
        render: (_v, row) => <EmailTableTextCell value={providerLabel(row)} muted />,
      },
      {
        id: "fromEmail",
        label: "From email",
        render: (_v, row) => <EmailTableTextCell value={row.fromEmail ? String(row.fromEmail) : undefined} />,
      },
      {
        id: "isEnabled",
        label: "Status",
        render: (_v, row) => (
          <Box sx={{ display: "inline-flex", flexShrink: 0 }}>
            <EmailStatusChip active={row.isEnabled} activeLabel="Enabled" inactiveLabel="Disabled" />
          </Box>
        ),
      },
    ],
    [],
  );

  if (!canView) {
    return (
      <PermissionDeniedPanel
        title="Reseller mail"
        description="You need page:smtp-email or smtp-email:view on your role (Reseller Admin with wide reseller scope)."
      />
    );
  }

  const isLoading = listQuery.isLoading || listQuery.isFetching;
  const showTable = !fixedResellerId;

  const addButton =
    canUpdate && showTable ? (
      <Button
        type="button"
        variant="primary"
        startIcon={<AddCircleIcon />}
        sx={gradientPrimaryButtonSx}
        onClick={() => openModal("")}
      >
        Add reseller mail
      </Button>
    ) : null;

  return (
    <>
      {showTable ? (
        <EmailConfigTableCard elevation={0}>
          <EmailTableCardHeader
            icon={
              <MailOutline
                sx={{
                  ...(iconGlyphSx("sm") as object),
                  color: theme.app.dashboard.white95,
                }}
              />
            }
            title="Own mail (SMTP / API)"
            subtitle="Per-reseller SMTP or API credentials, separate from platform mail."
            action={addButton}
          />

          <DataTable<ResellerOwnMailListItem>
            columns={columns}
            rows={rows}
            getRowId={(row) => row.resellerId}
            isLoading={isLoading}
            minWidth={880}
            size="medium"
            tableSx={emailResellerMailTableSx}
            containerSx={emailTablePanelSx}
            emptyState={{
              title: listQuery.isError ? "Could not load list" : "No reseller mail configured yet",
              description: "Click Add reseller mail to configure SMTP or API for a reseller.",
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
                          editLabel={`Edit mail for ${row.resellerName}`}
                          deleteLabel={`Remove mail for ${row.resellerName}`}
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
              {isLoading
                ? "Loading…"
                : `${rows.length} configured reseller${rows.length === 1 ? "" : "s"}`}
            </Typography>
          </Box>
        </EmailConfigTableCard>
      ) : null}

      <ResellerOwnMailModal
        open={modalOpen}
        resellerId={editResellerId}
        resellerLabel={editResellerLabel}
        lockedResellerId={fixedResellerId}
        onClose={closeModal}
        onSaved={() => {
          void listQuery.refetch();
        }}
      />

      <EmailDeleteConfirmModal
        open={Boolean(deleteTarget)}
        title="Remove reseller mail settings?"
        description={
          deleteTarget
            ? `SMTP/API settings for "${deleteTarget.resellerName}" will be deleted.`
            : ""
        }
        confirmLabel="Remove settings"
        onDismiss={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
