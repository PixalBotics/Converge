"use client";

import { useMemo, useState } from "react";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DataTable, Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import type { ChatScopeFilterState } from "@/features/chat-shared/types";
import { fetchInvolvementUsers } from "@/services/chat/involvement-roster.api";
import type { InvolvementListRow } from "@/services/chat/involvement-list.types";
import {
  useInvolvementListQuery,
  useSaveInvolvementWebsiteMutation,
} from "../hooks/useInvolvementLists";
import { InvolvementAddSupervisorsModal } from "./InvolvementAddSupervisorsModal";
import { InvolvementTabToolbarCard } from "./InvolvementTabToolbarCard";

function toListQuery(
  filters: ChatScopeFilterState,
  canFilterByResellerId: boolean,
  tableSearch: string,
) {
  return {
    all: true as const,
    resellerId: canFilterByResellerId ? filters.resellerId : undefined,
    parentCompanyId: filters.parentCompanyId || undefined,
    childCompanyId: filters.childCompanyId || undefined,
    websiteId: filters.websiteId || undefined,
    search: tableSearch.trim() || undefined,
  };
}

interface InvolvementUsersTabProps {
  filters: ChatScopeFilterState;
  canFilterByResellerId: boolean;
  canEdit: boolean;
  apiEnabled: boolean;
}

export function InvolvementUsersTab({
  filters,
  canFilterByResellerId,
  canEdit,
  apiEnabled,
}: InvolvementUsersTabProps) {
  const theme = useTheme() as AppTheme;
  const [tableSearch, setTableSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const listQuery = useInvolvementListQuery(
    toListQuery(filters, canFilterByResellerId, tableSearch),
    apiEnabled,
  );
  const saveMutation = useSaveInvolvementWebsiteMutation();

  const rows = listQuery.data ?? [];

  const removeRow = async (row: InvolvementListRow) => {
    try {
      const current = await fetchInvolvementUsers(row.websiteId);
      const items = current
        .filter(
          (r) => !(r.departmentId === row.departmentId && r.userId === row.userId),
        )
        .map((r, index) => ({
          departmentId: r.departmentId,
          userId: r.userId,
          sortOrder: index,
        }));
      await saveMutation.mutateAsync({ websiteId: row.websiteId, items });
      publishAppToast({ message: "Involvement user removed.", variant: "success" });
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err, "Could not remove involvement user."),
        variant: "error",
      });
    }
  };

  const columns = useMemo<DataTableColumn<InvolvementListRow>[]>(
    () => [
      {
        id: "website",
        label: "Website",
        render: (_, row) =>
          row.website.websiteName || row.website.websiteUrl || row.websiteId.slice(0, 8),
      },
      {
        id: "reseller",
        label: "Reseller",
        render: (_, row) => row.website.resellerName || "—",
      },
      {
        id: "parent",
        label: "Parent",
        render: (_, row) => row.website.parentCompanyName || "—",
      },
      {
        id: "child",
        label: "Child",
        render: (_, row) => row.website.childCompanyName || "—",
      },
      {
        id: "department",
        label: "Department",
        render: (_, row) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 13 }}>{row.departmentName}</Typography>
            <Chip label="External" size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
          </Box>
        ),
      },
      {
        id: "user",
        label: "User",
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
              render: (_: unknown, row: InvolvementListRow) => (
                <IconButton
                  size="small"
                  aria-label="Remove involvement user"
                  disabled={saveMutation.isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    void removeRow(row);
                  }}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              ),
            },
          ]
        : []),
    ],
    [canEdit, saveMutation.isPending, theme.app.dashboard.textMuted],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <InvolvementTabToolbarCard
        icon={<GroupsOutlined />}
        iconColor={theme.app.dashboard.accentBlue}
        title="Involvement users"
        description="Filter the table above. Add opens one modal (reseller → website → external department → users)."
        searchValue={tableSearch}
        onSearchChange={setTableSearch}
        searchPlaceholder="Search website, department, user, email…"
        addLabel="Add involvement users"
        onAdd={() => setAddOpen(true)}
        canAdd={canEdit}
      />

      <DataTable<InvolvementListRow>
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        isLoading={listQuery.isLoading}
        emptyState={{
          title: listQuery.isError ? "Could not load" : "No involvement users",
          description: listQuery.isError
            ? "Check permissions and try again."
            : "No rows in your scope yet. Use Add involvement users.",
        }}
      />

      <InvolvementAddSupervisorsModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        canEdit={canEdit}
        saving={saveMutation.isPending}
        onSave={(websiteId, items) => {
          saveMutation.mutate(
            { websiteId, items },
            {
              onSuccess: () => {
                publishAppToast({ message: "Involvement users saved.", variant: "success" });
                setAddOpen(false);
              },
              onError: (err) => {
                publishAppToast({
                  message: extractApiErrorMessageForToast(err, "Could not save."),
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
