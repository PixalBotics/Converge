"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Add from "@mui/icons-material/Add";
import EditOutlined from "@mui/icons-material/EditOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardFilterSection,
  DataTable,
  InputField,
  SelectField,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import type { ClosePolicyListRow } from "@/services/chat/close-policy-list.types";
import type { ChatScopeFilterState } from "@/features/chat-shared/types";
import { useClosePolicyListQuery } from "../hooks/useChatSettings";
import { ClosePolicyStatusChip } from "./ClosePolicyStatusChip";
import { ClosePolicyModal } from "./ClosePolicyModal";
import {
  formatAgentNoResponseTimers,
  formatSupervisorClose,
  formatVisitorIdleTimers,
  matchesClosePolicyStatusFilter,
  type ClosePolicyStatusFilter,
} from "../utils/close-policy-display";

interface ClosePolicyListTabProps {
  filters: ChatScopeFilterState;
  canFilterByResellerId: boolean;
  canEdit: boolean;
  onNotifyError: (e: unknown) => void;
  onNotifySuccess: (message: string) => void;
}

const STATUS_FILTER_OPTIONS: { value: ClosePolicyStatusFilter; label: string }[] = [
  { value: "all", label: "All policies" },
  { value: "enabled", label: "Enabled only" },
  { value: "disabled", label: "Disabled only" },
];

export function ClosePolicyListTab({
  filters,
  canFilterByResellerId,
  canEdit,
  onNotifyError,
  onNotifySuccess,
}: ClosePolicyListTabProps) {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const searchParams = useSearchParams();
  const deepLinkHandled = useRef(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editWebsiteId, setEditWebsiteId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClosePolicyStatusFilter>("all");

  useEffect(() => {
    if (deepLinkHandled.current) return;
    const websiteParam = searchParams.get("website")?.trim();
    if (!websiteParam) return;
    deepLinkHandled.current = true;
    setEditWebsiteId(websiteParam);
    setModalOpen(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("website");
    const qs = params.toString();
    router.replace(qs ? `/dashboard/chat-settings/close-policy?${qs}` : "/dashboard/chat-settings/close-policy", {
      scroll: false,
    });
  }, [router, searchParams]);

  const listQuery = useClosePolicyListQuery({
    resellerId: canFilterByResellerId ? filters.resellerId : undefined,
    parentCompanyId: filters.parentCompanyId,
    childCompanyId: filters.childCompanyId,
    websiteId: filters.websiteId,
    search: search.trim() || undefined,
  });

  const rows = useMemo(() => {
    const raw = listQuery.data ?? [];
    return raw.filter((row) => matchesClosePolicyStatusFilter(row.closePolicy, statusFilter));
  }, [listQuery.data, statusFilter]);

  const openAdd = () => {
    setEditWebsiteId("");
    setModalOpen(true);
  };

  const openEdit = (websiteId: string) => {
    setEditWebsiteId(websiteId);
    setModalOpen(true);
  };

  const columns = useMemo<DataTableColumn<ClosePolicyListRow>[]>(
    () => [
      {
        id: "website",
        label: "Website",
        render: (_, row) => (
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
              {row.websiteName || row.websiteUrl || row.websiteId.slice(0, 8)}
            </Typography>
            {row.websiteUrl && row.websiteName ? (
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                {row.websiteUrl}
              </Typography>
            ) : null}
          </Box>
        ),
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
      {
        id: "policy",
        label: "Policy",
        render: (_, row) => (
          <ClosePolicyStatusChip enabled={row.closePolicy.enabled} />
        ),
      },
      {
        id: "visitor",
        label: "Visitor idle",
        render: (_, row) => (
          <Typography sx={{ fontSize: 12, color: theme.app.dashboard.textMuted, maxWidth: 200 }}>
            {formatVisitorIdleTimers(row.closePolicy)}
          </Typography>
        ),
      },
      {
        id: "agent",
        label: "Agent no reply",
        render: (_, row) => (
          <Typography sx={{ fontSize: 12, color: theme.app.dashboard.textMuted, maxWidth: 220 }}>
            {formatAgentNoResponseTimers(row.closePolicy)}
          </Typography>
        ),
      },
      {
        id: "supervisor",
        label: "Supervisor",
        render: (_, row) => (
          <Typography sx={{ fontSize: 12, color: theme.app.dashboard.textMuted }}>
            {formatSupervisorClose(row.closePolicy)}
          </Typography>
        ),
      },
      ...(canEdit
        ? [
            {
              id: "actions",
              label: "",
              render: (_: unknown, row: ClosePolicyListRow) => (
                <IconButton
                  size="small"
                  aria-label="Edit close policy"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(row.websiteId);
                  }}
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minHeight: 0, flex: 1 }}>
      <DashboardFilterSection
        titleSlot={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <SettingsOutlined sx={{ color: theme.app.dashboard.accentBlue, fontSize: 22 }} />
            <Typography fontWeight={700} sx={{ fontSize: 15, color: theme.app.text.primary }}>
              Close policies in scope
            </Typography>
          </Box>
        }
        actionSlot={
          canEdit ? (
            <Button
              type="button"
              variant="primary"
              sx={gradientPrimaryButtonSx}
              startIcon={<Add />}
              onClick={openAdd}
            >
              Add close policy
            </Button>
          ) : null
        }
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 200px" },
          gap: 1.5,
        }}
      >
        <InputField
          label="Search websites"
          placeholder="Name, URL, company, reseller…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          dense
        />
        <SelectField
          label="Policy status"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as ClosePolicyStatusFilter)}
          options={STATUS_FILTER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataTable<ClosePolicyListRow>
          columns={columns}
          rows={rows}
          getRowId={(row) => row.websiteId}
          isLoading={listQuery.isLoading}
          emptyState={{
            title: listQuery.isError ? "Could not load" : "No websites in scope",
            description: listQuery.isError
              ? "Check permissions and try again."
              : canEdit
                ? "Adjust filters or use Add close policy to configure a website."
                : "No websites match the current filters.",
          }}
          onRowClick={canEdit ? (row) => openEdit(row.websiteId) : undefined}
        />
      </Box>

      <ClosePolicyModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditWebsiteId("");
        }}
        canEdit={canEdit}
        initialWebsiteId={editWebsiteId}
        onSaved={() => onNotifySuccess("Close policy saved")}
        onError={onNotifyError}
      />
    </Box>
  );
}
