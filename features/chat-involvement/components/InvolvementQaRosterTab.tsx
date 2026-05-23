"use client";

import { useMemo, useState } from "react";
import Add from "@mui/icons-material/Add";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DataTable } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import type { ChatScopeFilterState } from "@/features/chat-shared/types";
import { fetchQaWebsiteRoster, type QaRosterListRow } from "@/services/chat/qa-roster.api";
import {
  useQaRosterListQuery,
  useSaveQaRosterWebsiteMutation,
} from "../hooks/useInvolvementLists";
import { InvolvementTabToolbarCard } from "./InvolvementTabToolbarCard";
import { QaAddReviewersModal } from "./QaAddReviewersModal";

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

function userLabel(row: QaRosterListRow): string {
  const u = row.user;
  if (!u) return row.userId.slice(0, 8);
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  if (name) return u.email ? `${name} · ${u.email}` : name;
  return u.email ?? row.userId.slice(0, 8);
}

interface InvolvementQaRosterTabProps {
  filters: ChatScopeFilterState;
  canFilterByResellerId: boolean;
  apiEnabled: boolean;
}

export function InvolvementQaRosterTab({
  filters,
  canFilterByResellerId,
  apiEnabled,
}: InvolvementQaRosterTabProps) {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canEdit = hasOperational(OP.qa.chatAssign) || hasOperational(OP.chatWidget.update);

  const [tableSearch, setTableSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const listQuery = useQaRosterListQuery(
    toListQuery(filters, canFilterByResellerId, tableSearch),
    apiEnabled,
  );
  const saveMutation = useSaveQaRosterWebsiteMutation();

  const rows = listQuery.data ?? [];

  const removeRow = async (row: QaRosterListRow) => {
    try {
      const roster = await fetchQaWebsiteRoster(row.websiteId);
      const internal = roster.internal.map((r) => r.userId);
      const external = roster.external.map((r) => r.userId);
      const channel = row.channelScope;
      await saveMutation.mutateAsync({
        websiteId: row.websiteId,
        internalUserIds:
          channel === "internal" ? internal.filter((id) => id !== row.userId) : internal,
        externalUserIds:
          channel === "external" ? external.filter((id) => id !== row.userId) : external,
      });
      publishAppToast({ message: "QA reviewer removed.", variant: "success" });
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err, "Could not remove reviewer."),
        variant: "error",
      });
    }
  };

  const columns = useMemo<DataTableColumn<QaRosterListRow>[]>(
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
        id: "channel",
        label: "Channel",
        render: (_, row) => (
          <Chip
            label={row.channelScope === "external" ? "External" : "Internal"}
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: 11 }}
          />
        ),
      },
      {
        id: "reviewer",
        label: "Reviewer",
        render: (_, row) => userLabel(row),
      },
      ...(canEdit
        ? [
            {
              id: "actions",
              label: "",
              render: (_: unknown, row: QaRosterListRow) => (
                <IconButton
                  size="small"
                  aria-label="Remove reviewer"
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
    [canEdit, saveMutation.isPending],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <InvolvementTabToolbarCard
        icon={<FactCheckOutlined />}
        iconColor={theme.app.dashboard.accentViolet}
        title="QA roster"
        description="Filter the table above. Add opens one modal — external users assign external QA only; internal users pick internal or external."
        searchValue={tableSearch}
        onSearchChange={setTableSearch}
        searchPlaceholder="Search website, reviewer, email…"
        addLabel="Add QA reviewer"
        onAdd={() => setAddOpen(true)}
        canAdd={canEdit}
      />

      <DataTable<QaRosterListRow>
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        isLoading={listQuery.isLoading}
        emptyState={{
          title: listQuery.isError ? "Could not load" : "No QA reviewers",
          description: listQuery.isError
            ? "Check permissions and try again."
            : "No rows in your scope yet. Use Add QA reviewer.",
        }}
      />

      <QaAddReviewersModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        canEdit={canEdit}
        saving={saveMutation.isPending}
        onSave={async (websiteId, internalUserIds, externalUserIds) => {
          try {
            await saveMutation.mutateAsync({
              websiteId,
              internalUserIds,
              externalUserIds,
            });
            publishAppToast({ message: "QA roster saved.", variant: "success" });
            setAddOpen(false);
          } catch (err) {
            publishAppToast({
              message: extractApiErrorMessageForToast(err, "Could not save QA roster."),
              variant: "error",
            });
          }
        }}
      />
    </Box>
  );
}
