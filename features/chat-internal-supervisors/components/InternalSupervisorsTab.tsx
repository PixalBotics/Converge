"use client";

import { useMemo, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import SupervisorAccountOutlined from "@mui/icons-material/SupervisorAccountOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DataTable, Typography, dataTableActionButton } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import type { ChatScopeFilterState } from "@/features/chat-shared/types";
import { fetchInternalSupervisorsForParentCompany } from "@/services/chat/internal-supervisors.api";
import type { InternalSupervisorListRow } from "@/services/chat/internal-supervisors-list.types";
import { InvolvementTabToolbarCard } from "@/features/chat-involvement/components/InvolvementTabToolbarCard";
import { formatPoolDepartmentLabel } from "@/app/dashboard/pools/pool-catalog.constants";
import {
  useInternalSupervisorListQuery,
  useSaveInternalSupervisorForUserMutation,
} from "../hooks/useInternalSupervisorLists";
import { InternalSupervisorAssignModal } from "./InternalSupervisorAssignModal";

function toListQuery(
  filters: ChatScopeFilterState,
  canFilterByResellerId: boolean,
  tableSearch: string,
) {
  return {
    all: true as const,
    resellerId: canFilterByResellerId ? filters.resellerId : undefined,
    parentCompanyId: filters.parentCompanyId || undefined,
    search: tableSearch.trim() || undefined,
  };
}

interface InternalSupervisorsTabProps {
  filters: ChatScopeFilterState;
  canFilterByResellerId: boolean;
  canEdit: boolean;
  apiEnabled: boolean;
}

export function InternalSupervisorsTab({
  filters,
  canFilterByResellerId,
  canEdit,
  apiEnabled,
}: InternalSupervisorsTabProps) {
  const theme = useTheme() as AppTheme;
  const [tableSearch, setTableSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const listQuery = useInternalSupervisorListQuery(
    toListQuery(filters, canFilterByResellerId, tableSearch),
    apiEnabled,
  );
  const saveMutation = useSaveInternalSupervisorForUserMutation();

  const rows = listQuery.data ?? [];

  const removeRow = async (row: InternalSupervisorListRow) => {
    try {
      const current = await fetchInternalSupervisorsForParentCompany(row.parentCompanyId);
      const remainingPoolIds = current
        .filter((r) => r.userId === row.userId && r.poolId !== row.poolId)
        .map((r) => r.poolId);
      await saveMutation.mutateAsync({ userId: row.userId, poolIds: remainingPoolIds });
      publishAppToast({ message: "Internal supervisor assignment removed.", variant: "success" });
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err, "Could not remove assignment."),
        variant: "error",
      });
    }
  };

  const columns = useMemo<DataTableColumn<InternalSupervisorListRow>[]>(
    () => [
      {
        id: "parent",
        label: "Parent company",
        render: (_, row) => row.parentCompany.parentCompanyName || row.parentCompanyId.slice(0, 8),
      },
      {
        id: "reseller",
        label: "Reseller",
        render: (_, row) => row.parentCompany.resellerName || "—",
      },
      {
        id: "pool",
        label: "Pool",
        render: (_, row) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 13 }}>{row.poolName}</Typography>
            <Chip label="Internal" size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
          </Box>
        ),
      },
      {
        id: "department",
        label: "Department",
        render: (_, row) => formatPoolDepartmentLabel(row.departmentName, "Internal"),
      },
      {
        id: "user",
        label: "Supervisor",
        render: (_, row) => row.user.name?.trim() || row.user.email || row.userId.slice(0, 8),
      },
      {
        id: "email",
        label: "Email",
        render: (_, row) => (
          <Typography sx={{ fontSize: 13, color: theme.app.dashboard.textMuted }}>
            {row.user.email || "—"}
          </Typography>
        ),
      },
      ...(canEdit
        ? [
            {
              id: "actions",
              label: "",
              render: (_: unknown, row: InternalSupervisorListRow) => (
                <IconButton
                  size="small"
                  sx={{
                    ...dataTableActionButton,
                    color: theme.app.dashboard.accentRedLight,
                  }}
                  aria-label="Remove internal supervisor"
                  disabled={saveMutation.isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    void removeRow(row);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              ),
            },
          ]
        : []),
    ],
    [canEdit, saveMutation.isPending, theme.app.dashboard.accentRedLight, theme.app.dashboard.textMuted],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minHeight: 0 }}>
      <InvolvementTabToolbarCard
        icon={<SupervisorAccountOutlined />}
        iconColor={theme.app.dashboard.accentBlue}
        title="Internal supervisors"
        description="Internal users supervising internal pools only. External chat supervision uses involvement assignments."
        searchValue={tableSearch}
        onSearchChange={setTableSearch}
        searchPlaceholder="Parent, pool, supervisor, or email…"
        addLabel="Assign supervisor"
        onAdd={() => setAddOpen(true)}
        canAdd={canEdit}
      >
        <DataTable<InternalSupervisorListRow>
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          isLoading={listQuery.isLoading}
          emptyState={{
            title: listQuery.isError ? "Could not load" : "No internal supervisors",
            description: listQuery.isError
              ? "Check permissions and try again."
              : "No rows in your scope yet. Use Assign supervisor.",
          }}
        />
      </InvolvementTabToolbarCard>

      <InternalSupervisorAssignModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        canEdit={canEdit}
        saving={saveMutation.isPending}
        onSave={(userId, poolIds) => {
          saveMutation.mutate(
            { userId, poolIds },
            {
              onSuccess: () => {
                setAddOpen(false);
                publishAppToast({ message: "Internal supervisor saved.", variant: "success" });
              },
              onError: (err) => {
                publishAppToast({
                  message: extractApiErrorMessageForToast(err, "Could not save supervisor."),
                  variant: "error",
                });
              },
            },
          );
        }}
      />
    </Box>
  );
}
