"use client";

import { useState } from "react";
import Add from "@mui/icons-material/Add";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import EditOutlined from "@mui/icons-material/EditOutlined";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DataTable,
  FormModal,
  InputField,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import type { ChatRoutingRule, UpsertChatRouteBody } from "@/services/chat/chat-settings.types";
import type { CatalogOption } from "../utils/catalog";

const EMPTY_ROUTE: UpsertChatRouteBody = {
  routingKey: "",
  departmentType: "Internal",
  clientLabel: "",
  departmentId: "",
  poolId: "",
  displayOrder: 0,
  isActive: true,
};

interface RoutingRulesTabProps {
  routes: ChatRoutingRule[];
  departments: CatalogOption[];
  pools: CatalogOption[];
  canEdit: boolean;
  busy: boolean;
  onCreate: (body: UpsertChatRouteBody) => void;
  onPatch: (routeId: string, body: Partial<UpsertChatRouteBody>) => void;
  onDelete: (routeId: string) => void;
}

export function RoutingRulesTab({
  routes,
  departments,
  pools,
  canEdit,
  busy,
  onCreate,
  onPatch,
  onDelete,
}: RoutingRulesTabProps) {
  const theme = useTheme() as AppTheme;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<UpsertChatRouteBody>(EMPTY_ROUTE);

  const openCreate = () => {
    setEditingId(null);
    setDraft(EMPTY_ROUTE);
    setModalOpen(true);
  };

  const openEdit = (route: ChatRoutingRule) => {
    setEditingId(route.id);
    setDraft({
      routingKey: route.routingKey,
      departmentType: (route.departmentType as UpsertChatRouteBody["departmentType"]) ?? "Internal",
      clientLabel: route.clientLabel,
      departmentId: route.departmentId,
      poolId: route.poolId ?? "",
      displayOrder: route.displayOrder ?? 0,
      isActive: route.isActive ?? true,
    });
    setModalOpen(true);
  };

  const columns: DataTableColumn<ChatRoutingRule>[] = [
    { id: "routingKey", label: "Key", render: (_, row) => row.routingKey },
    { id: "clientLabel", label: "Label", render: (_, row) => row.clientLabel },
    {
      id: "channel",
      label: "Channel",
      render: (_, row) => row.departmentType,
    },
    {
      id: "department",
      label: "Department",
      render: (_, row) => row.department?.name ?? row.departmentId,
    },
    {
      id: "pool",
      label: "Pool",
      render: (_, row) => row.pool?.name ?? (row.poolId ? row.poolId : "—"),
    },
    {
      id: "active",
      label: "Active",
      render: (_, row) => (row.isActive ? "Yes" : "No"),
    },
    ...(canEdit
      ? [
          {
            id: "actions",
            label: "",
            render: (_: unknown, row: ChatRoutingRule) => (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton size="small" aria-label="Edit route" onClick={() => openEdit(row)}>
                  <EditOutlined fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="Delete route"
                  onClick={() => onDelete(row.id)}
                  disabled={busy}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Box>
            ),
          } as DataTableColumn<ChatRoutingRule>,
        ]
      : []),
  ];

  const saveRoute = () => {
    const body: UpsertChatRouteBody = {
      ...draft,
      routingKey: draft.routingKey.trim(),
      clientLabel: draft.clientLabel.trim(),
      poolId: draft.poolId?.trim() || undefined,
    };
    if (!body.routingKey || !body.clientLabel || !body.departmentId) return;
    if (editingId) {
      onPatch(editingId, body);
    } else {
      onCreate(body);
    }
    setModalOpen(false);
  };

  return (
    <Box>
      {canEdit ? (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            type="button"
            variant="primary"
            startIcon={<Add />}
            sx={gradientPrimaryButtonSx}
            onClick={openCreate}
          >
            Add route
          </Button>
        </Box>
      ) : null}

      <DataTable
        columns={columns}
        rows={routes}
        getRowId={(r) => r.id}
        emptyState={{ title: "No routing rules", description: "Add a rule to map visitor topics to departments." }}
      />

      <FormModal
        open={modalOpen}
        title={editingId ? "Edit routing rule" : "New routing rule"}
        onClose={() => setModalOpen(false)}
        onSave={saveRoute}
        primaryButtonLabel={editingId ? "Update" : "Create"}
        primaryButtonDisabled={busy}
        maxWidth={560}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <InputField
            label="Routing key"
            value={draft.routingKey}
            onChange={(e) => setDraft((p) => ({ ...p, routingKey: e.target.value }))}
            placeholder="billing"
          />
          <InputField
            label="Client label"
            value={draft.clientLabel}
            onChange={(e) => setDraft((p) => ({ ...p, clientLabel: e.target.value }))}
            placeholder="Billing & invoices"
          />
          <FormControl fullWidth size="small">
            <InputLabel>Channel</InputLabel>
            <Select
              label="Channel"
              value={draft.departmentType ?? "Internal"}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  departmentType: e.target.value as UpsertChatRouteBody["departmentType"],
                }))
              }
            >
              <MenuItem value="Internal">Internal</MenuItem>
              <MenuItem value="External">External</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Department</InputLabel>
            <Select
              label="Department"
              value={draft.departmentId}
              onChange={(e) => setDraft((p) => ({ ...p, departmentId: e.target.value }))}
            >
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Pool (optional)</InputLabel>
            <Select
              label="Pool (optional)"
              value={draft.poolId ?? ""}
              onChange={(e) => setDraft((p) => ({ ...p, poolId: e.target.value }))}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {pools.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <InputField
            label="Display order"
            type="number"
            value={String(draft.displayOrder ?? 0)}
            onChange={(e) =>
              setDraft((p) => ({ ...p, displayOrder: Number(e.target.value) || 0 }))
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={draft.isActive !== false}
                onChange={(_, v) => setDraft((p) => ({ ...p, isActive: v }))}
              />
            }
            label="Active"
          />
        </Box>
      </FormModal>

      <Typography variant="caption" sx={{ display: "block", mt: 2, color: theme.app.dashboard.textMuted }}>
        Topic keys map visitor selections to departments (and optional pools) for this parent company.
      </Typography>
    </Box>
  );
}
