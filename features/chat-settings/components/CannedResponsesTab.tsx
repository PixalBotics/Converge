"use client";

import { useMemo, useState } from "react";
import Add from "@mui/icons-material/Add";
import EditOutlined from "@mui/icons-material/EditOutlined";
import QuickreplyOutlined from "@mui/icons-material/QuickreplyOutlined";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { mergeSx } from "@/lib/mui/merge-sx";
import type { CannedResponseListRow } from "@/services/chat/canned-responses.types";
import type { ChatScopeFilterState } from "@/features/chat-shared/types";
import {
  useCannedResponsesListQuery,
  useReplaceWebsiteCannedMutation,
} from "../hooks/useCannedResponses";
import { CannedMessagesModal } from "./CannedMessagesModal";

interface CannedResponsesTabProps {
  filters: ChatScopeFilterState;
  canFilterByResellerId: boolean;
  canEdit: boolean;
  onNotifyError: (e: unknown) => void;
  onNotifySuccess: (message: string) => void;
  /** When true, renders inside a parent card (no extra filter chrome). */
  embedded?: boolean;
}

export function CannedResponsesTab({
  filters,
  canFilterByResellerId,
  canEdit,
  onNotifyError,
  onNotifySuccess,
  embedded = false,
}: CannedResponsesTabProps) {
  const theme = useTheme() as AppTheme;
  const [modalOpen, setModalOpen] = useState(false);
  const [editWebsiteId, setEditWebsiteId] = useState("");

  const listQuery = useCannedResponsesListQuery({
    resellerId: canFilterByResellerId ? filters.resellerId : undefined,
    parentCompanyId: filters.parentCompanyId,
    childCompanyId: filters.childCompanyId,
    websiteId: filters.websiteId,
  });

  const saveMutation = useReplaceWebsiteCannedMutation();

  const rows = listQuery.data ?? [];

  const openAdd = () => {
    setEditWebsiteId("");
    setModalOpen(true);
  };

  const openEditForWebsite = (websiteId: string) => {
    setEditWebsiteId(websiteId);
    setModalOpen(true);
  };

  const columns = useMemo<DataTableColumn<CannedResponseListRow>[]>(
    () => [
      {
        id: "website",
        label: "Website",
        render: (_, row) => row.websiteName || row.websiteUrl || row.websiteId.slice(0, 8),
      },
      {
        id: "reseller",
        label: "Reseller",
        render: (_, row) => row.resellerName ?? "—",
      },
      {
        id: "parent",
        label: "Parent",
        render: (_, row) => row.parentCompanyName ?? "—",
      },
      {
        id: "child",
        label: "Child",
        render: (_, row) => row.childCompanyName ?? "—",
      },
      { id: "title", label: "Title", render: (_, row) => row.title },
      {
        id: "body",
        label: "Message",
        render: (_, row) => (
          <Typography
            sx={{
              fontSize: 13,
              color: theme.app.dashboard.textMuted,
              maxWidth: 280,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.body}
          </Typography>
        ),
      },
      ...(canEdit
        ? [
            {
              id: "actions",
              label: "",
              render: (_: unknown, row: CannedResponseListRow) => (
                <IconButton
                  size="small"
                  aria-label="Edit canned messages for website"
                  onClick={() => openEditForWebsite(row.websiteId)}
                >
                  <EditOutlined fontSize="small" />
                </IconButton>
              ),
            },
          ]
        : []),
    ],
    [canEdit, theme.app.dashboard.textMuted],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: embedded ? 1.5 : 2, minHeight: 0, flex: 1 }}>
      {!embedded ? (
        <DashboardCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
              <QuickreplyOutlined sx={{ color: theme.app.dashboard.accentBlue, fontSize: 22 }} />
              <Box>
                <Typography variant="mediumLarge" color="white" fontWeight={600}>
                  Canned messages
                </Typography>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                  Per-website quick replies for agents.
                </Typography>
              </Box>
            </Box>
            {canEdit ? (
              <Button
                type="button"
                variant="primary"
                sx={mergeSx(gradientPrimaryButtonSx, { flexShrink: 0 })}
                startIcon={<Add />}
                onClick={openAdd}
              >
                Add messages
              </Button>
            ) : null}
          </Box>
        </DashboardCard>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
            <QuickreplyOutlined sx={{ color: theme.app.dashboard.accentBlue, fontSize: 22 }} />
            <Typography variant="mediumLarge" color="white" fontWeight={600}>
              Messages in scope
            </Typography>
          </Box>
          {canEdit ? (
            <Button
              type="button"
              variant="primary"
              sx={mergeSx(gradientPrimaryButtonSx, { flexShrink: 0 })}
              startIcon={<Add />}
              onClick={openAdd}
            >
              Add messages
            </Button>
          ) : null}
        </Box>
      )}

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataTable<CannedResponseListRow>
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        isLoading={listQuery.isLoading}
        emptyState={{
          title: listQuery.isError ? "Could not load" : "No canned messages",
          description: listQuery.isError
            ? "Check permissions and try again."
            : "Use Add messages to create quick replies for a website in this scope.",
        }}
        onRowClick={canEdit ? (row) => openEditForWebsite(row.websiteId) : undefined}
        />
      </Box>

      <CannedMessagesModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditWebsiteId("");
        }}
        canEdit={canEdit}
        saving={saveMutation.isPending}
        initialWebsiteId={editWebsiteId}
        onSave={(websiteId, items) => {
          saveMutation.mutate(
            { websiteId, body: { items } },
            {
              onSuccess: () => {
                onNotifySuccess("Canned messages saved");
                setModalOpen(false);
                setEditWebsiteId("");
              },
              onError: onNotifyError,
            },
          );
        }}
      />
    </Box>
  );
}
