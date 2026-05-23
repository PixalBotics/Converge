"use client";

import { useCallback, useMemo, useState } from "react";
import PaletteOutlined from "@mui/icons-material/PaletteOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DataTable, Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import type { PlatformTemplateAssignmentListItem } from "@/api/email/email.api";
import { AddCircleIcon } from "@/components/common/icons";
import { iconGlyphSx } from "@/lib/design-system";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { gradientPrimaryButtonSx } from "../styles/email-page.styles";
import { EmailConfigTableCard } from "../styles/email-configuration.styled";
import { EmailTableCardHeader } from "./EmailTableCardHeader";
import { EmailTableActions } from "./EmailTableActions";
import { EmailDeleteConfirmModal } from "./EmailDeleteConfirmModal";
import { PlatformTemplateAssignmentModal } from "./PlatformTemplateAssignmentModal";
import {
  usePlatformTemplateAssignmentListQuery,
  useRemovePlatformEmailTemplateAssignmentMutation,
} from "../hooks/useEmailTemplate";
import { usePlatformEmailTemplatePublishedQuery } from "../hooks/useEmailTemplate";

type DeleteTarget = { resellerId: string; resellerName: string };

export function PlatformTemplateAssignmentsTable() {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canView = hasOperational(OP.emailTemplate.view);
  const canUpdate = hasOperational(OP.emailTemplate.update);

  const publishedQuery = usePlatformEmailTemplatePublishedQuery({ enabled: canView });
  const listQuery = usePlatformTemplateAssignmentListQuery({ enabled: canView });
  const removeMutation = useRemovePlatformEmailTemplateAssignmentMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const rows = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const platformPublished = Boolean(publishedQuery.data?.publishedAt);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const handleConfirmRemove = async () => {
    const rid = deleteTarget?.resellerId.trim();
    if (!rid) return;
    try {
      await removeMutation.mutateAsync(rid);
      publishAppToast({ variant: "success", message: "Reseller switched to custom design." });
      setDeleteTarget(null);
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err, "Could not update assignment."),
      });
    }
  };

  const columns = useMemo<DataTableColumn<PlatformTemplateAssignmentListItem>[]>(
    () => [
      { id: "resellerName", label: "Reseller", align: "left" },
      {
        id: "hasCustomPublished",
        label: "Custom design available",
        align: "left",
        render: (_v, row) => (
          <Chip
            size="small"
            label={row.hasCustomPublished ? "Yes" : "No"}
            color={row.hasCustomPublished ? "success" : "default"}
            variant="outlined"
          />
        ),
      },
      {
        id: "updatedAt",
        label: "Updated",
        align: "left",
        render: (_v, row) =>
          row.updatedAt ? new Date(row.updatedAt).toLocaleString() : "—",
      },
    ],
    [],
  );

  if (!canView) return null;

  return (
    <>
      <EmailConfigTableCard>
        <EmailTableCardHeader
          icon={<PaletteOutlined sx={iconGlyphSx(theme, 22)} />}
          title="Resellers using platform design"
          subtitle="These resellers send transcript emails with the platform template until they publish and switch to their own design."
          action={
            canUpdate ? (
              <Button
                type="button"
                variant="primary"
                startIcon={<AddCircleIcon sx={iconGlyphSx(theme, 20)} />}
                sx={gradientPrimaryButtonSx}
                disabled={!platformPublished}
                onClick={openModal}
              >
                Assign reseller
              </Button>
            ) : null
          }
        />

        {!platformPublished ? (
          <Typography variant="small" sx={{ color: "text.secondary", mb: 2 }}>
            Publish the platform email design first under the Platform design tab.
          </Typography>
        ) : null}

        <DataTable<PlatformTemplateAssignmentListItem>
          columns={columns}
          rows={rows}
          getRowId={(r) => r.resellerId}
          minWidth={640}
          actionColumn={
            canUpdate
              ? {
                  label: "Actions",
                  align: "right",
                  render: (row) => (
                    <EmailTableActions
                      editLabel="Edit"
                      deleteLabel="Use own design"
                      canEdit={false}
                      onDelete={
                        row.hasCustomPublished
                          ? () =>
                              setDeleteTarget({
                                resellerId: row.resellerId,
                                resellerName: row.resellerName,
                              })
                          : undefined
                      }
                    />
                  ),
                }
              : undefined
          }
        />

        {rows.length === 0 && !listQuery.isLoading ? (
          <Typography variant="small" sx={{ color: "text.secondary", mt: 1.5 }}>
            No resellers on platform design yet — assign one or switch from the reseller design editor.
          </Typography>
        ) : null}
      </EmailConfigTableCard>

      <PlatformTemplateAssignmentModal open={modalOpen} onClose={closeModal} onSaved={closeModal} />

      <EmailDeleteConfirmModal
        open={Boolean(deleteTarget)}
        title="Switch to own design?"
        description={
          deleteTarget
            ? `${deleteTarget.resellerName} will use their published custom template instead of the platform default.`
            : ""
        }
        confirmLabel="Switch to own"
        onDismiss={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmRemove()}
        isLoading={removeMutation.isPending}
      />
    </>
  );
}
