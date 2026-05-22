"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { FormModal, SelectField, Typography } from "@/components/common";
import { MultiUserCheckboxPicker } from "@/features/chat-shared/components/MultiUserCheckboxPicker";
import { fetchInvolvementUsers } from "@/services/chat/involvement-roster.api";
import { useChannelDepartmentsQuery } from "../hooks/useChannelDepartmentsQuery";
import { useInvolvementModalScope } from "../hooks/useInvolvementModalScope";
import { InvolvementOrgScopeFields } from "./InvolvementOrgScopeFields";

type DraftItem = { departmentId: string; userId: string; sortOrder?: number };

interface InvolvementAddSupervisorsModalProps {
  open: boolean;
  onClose: () => void;
  canEdit: boolean;
  saving: boolean;
  onSave: (websiteId: string, items: DraftItem[]) => void;
}

export function InvolvementAddSupervisorsModal({
  open,
  onClose,
  canEdit,
  saving,
  onSave,
}: InvolvementAddSupervisorsModalProps) {
  const theme = useTheme() as AppTheme;
  const modalScope = useInvolvementModalScope(open);

  const [departmentId, setDepartmentId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const modalResellerId = modalScope.filterResellerId.trim() || undefined;

  const deptCatalog = useChannelDepartmentsQuery(
    {
      channel: "External",
      parentCompanyId: modalScope.parentCompanyId,
      resellerId: modalResellerId,
      requireResellerId: modalScope.canFilterByResellerId,
    },
    open,
  );

  const externalDepts = useMemo(
    () => deptCatalog.data ?? [],
    [deptCatalog.data],
  );

  const defaultDepartmentId = externalDepts[0]?.id ?? "";

  useEffect(() => {
    if (!open) return;
    setDepartmentId("");
    setSelectedUserIds([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setDepartmentId(defaultDepartmentId);
    setSelectedUserIds([]);
  }, [open, modalScope.parentCompanyId, defaultDepartmentId]);

  useEffect(() => {
    if (!open) return;
    setDepartmentId("");
    setSelectedUserIds([]);
  }, [open, modalScope.websiteId]);

  const deptOptions = useMemo(
    () => [
      {
        value: "",
        label: !modalScope.parentCompanyId
          ? "Select parent company first"
          : externalDepts.length
            ? "Select department…"
            : "No external departments",
      },
      ...externalDepts.map((d) => ({ value: d.id, label: d.label })),
    ],
    [externalDepts, modalScope.parentCompanyId],
  );

  const activeDept = externalDepts.find((d) => d.id === departmentId);

  const handleSave = async () => {
    const websiteId = modalScope.websiteId.trim();
    if (!websiteId || !departmentId || selectedUserIds.length === 0) return;
    const fullRoster = await fetchInvolvementUsers(websiteId);
    const existingForDept = new Set(
      fullRoster.filter((r) => r.departmentId === departmentId).map((r) => r.userId),
    );
    const merged = fullRoster.map((r) => ({
      departmentId: r.departmentId,
      userId: r.userId,
      sortOrder: r.sortOrder,
    }));
    let order = merged.length;
    for (const userId of selectedUserIds) {
      if (existingForDept.has(userId)) continue;
      merged.push({ departmentId, userId, sortOrder: order++ });
    }
    const deduped: DraftItem[] = [];
    const seen = new Set<string>();
    for (const row of merged) {
      const key = `${row.departmentId}:${row.userId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(row);
    }
    onSave(websiteId, deduped);
  };

  return (
    <FormModal
      open={open}
      fitContent
      maxWidth={720}
      title="Add involvement users"
      description="Choose organization and website, then external department and users. Independent from table filters."
      onClose={onClose}
      onSave={() => void handleSave()}
      primaryButtonLabel={saving ? "Saving…" : `Add ${selectedUserIds.length || ""} user(s)`}
      primaryButtonDisabled={
        !canEdit ||
        saving ||
        !modalScope.websiteId.trim() ||
        !modalScope.parentCompanyId ||
        !departmentId ||
        selectedUserIds.length === 0
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <InvolvementOrgScopeFields scope={modalScope} canEdit={canEdit} disabled={saving} />

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <Chip label="External department" size="small" color="primary" variant="outlined" />
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            Departments for selected parent company only.
          </Typography>
        </Box>

        <SelectField
          label="Department"
          value={departmentId}
          onChange={setDepartmentId}
          options={deptOptions}
          disabled={
            !canEdit ||
            saving ||
            !modalScope.websiteId.trim() ||
            !modalScope.parentCompanyId ||
            (modalScope.canFilterByResellerId && !modalResellerId) ||
            externalDepts.length === 0
          }
          menuMaxRows={8}
          searchPlaceholder="Search department…"
        />

        {activeDept ? (
          <Box
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
              bgcolor: `${theme.palette.primary.main}08`,
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              {activeDept.label}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              External users for this department, parent company
              {modalResellerId ? ", and reseller scope." : "."}
            </Typography>
          </Box>
        ) : null}

        {modalScope.websiteId.trim() && departmentId && modalScope.parentCompanyId ? (
          <MultiUserCheckboxPicker
            userType="External"
            departmentId={departmentId}
            selectedIds={selectedUserIds}
            onChangeSelectedIds={setSelectedUserIds}
            canEdit={canEdit}
            disabled={saving}
          />
        ) : (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            Complete org + website + department to list users.
          </Typography>
        )}
      </Box>
    </FormModal>
  );
}
