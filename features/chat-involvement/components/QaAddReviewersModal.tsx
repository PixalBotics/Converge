"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { FormModal, SelectField, Typography } from "@/components/common";
import { MultiUserCheckboxPicker } from "@/features/chat-shared/components/MultiUserCheckboxPicker";
import { useAuth } from "@/lib/auth";
import {
  assignmentStepChipSx,
  assignmentStepRowSx,
} from "@/features/website-assignments/styles/website-assignment-ui.styles";
import { fetchQaWebsiteRoster } from "@/services/chat/qa-roster.api";
import { useChannelDepartmentsQuery } from "../hooks/useChannelDepartmentsQuery";
import { useInvolvementModalScope } from "../hooks/useInvolvementModalScope";
import { InvolvementOrgScopeFields } from "./InvolvementOrgScopeFields";

type QaChannel = "Internal" | "External";

function parseSessionUserType(raw?: string | null): "Internal" | "External" {
  return String(raw ?? "").trim().toLowerCase() === "external" ? "External" : "Internal";
}

interface QaAddReviewersModalProps {
  open: boolean;
  onClose: () => void;
  canEdit: boolean;
  saving: boolean;
  onSave: (
    websiteId: string,
    internalUserIds: string[],
    externalUserIds: string[],
  ) => void | Promise<void>;
}

export function QaAddReviewersModal({
  open,
  onClose,
  canEdit,
  saving,
  onSave,
}: QaAddReviewersModalProps) {
  const theme = useTheme() as AppTheme;
  const { user } = useAuth();
  const modalScope = useInvolvementModalScope(open);
  const sessionUserType = parseSessionUserType(user?.userType);
  const isExternalSession = sessionUserType === "External";

  const channelOptions = useMemo(
    () =>
      isExternalSession
        ? [{ value: "External", label: "External QA (your channel)" }]
        : [
            { value: "Internal", label: "Internal QA" },
            { value: "External", label: "External QA" },
          ],
    [isExternalSession],
  );

  const [channel, setChannel] = useState<QaChannel>("Internal");
  const [departmentId, setDepartmentId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const modalResellerId = modalScope.filterResellerId.trim() || undefined;

  const deptCatalog = useChannelDepartmentsQuery(
    {
      channel,
      parentCompanyId: channel === "External" ? modalScope.parentCompanyId : undefined,
      resellerId: modalResellerId,
      requireResellerId: modalScope.canFilterByResellerId,
    },
    open,
  );

  const departments = useMemo(() => deptCatalog.data ?? [], [deptCatalog.data]);

  const defaultDepartmentId = departments[0]?.id ?? "";

  useEffect(() => {
    if (!open) return;
    setChannel(isExternalSession ? "External" : "Internal");
    setDepartmentId("");
    setSelectedUserIds([]);
  }, [open, isExternalSession]);

  useEffect(() => {
    setDepartmentId(defaultDepartmentId);
    setSelectedUserIds([]);
  }, [open, channel, defaultDepartmentId]);

  useEffect(() => {
    setDepartmentId("");
    setSelectedUserIds([]);
  }, [modalScope.websiteId]);

  const deptLabel = channel === "Internal" ? "Internal department" : "External department";

  const deptOptions = useMemo(
    () => [
      {
        value: "",
        label: deptCatalog.isLoading
          ? `Loading ${channel.toLowerCase()} departments…`
          : !modalScope.canFilterByResellerId || modalResellerId
            ? departments.length
              ? `Select ${channel.toLowerCase()} department…`
              : `No ${channel.toLowerCase()} departments`
            : "Select reseller first",
      },
      ...departments.map((d) => ({ value: d.id, label: d.label })),
    ],
    [
      channel,
      departments,
      deptCatalog.isLoading,
      modalScope.canFilterByResellerId,
      modalResellerId,
    ],
  );

  const handleChannelChange = (v: string) => {
    const next = v as QaChannel;
    setChannel(next);
    setDepartmentId("");
    setSelectedUserIds([]);
  };

  const activeDept = departments.find((d) => d.id === departmentId);

  const handleSave = async () => {
    const websiteId = modalScope.websiteId.trim();
    if (!websiteId || !departmentId || selectedUserIds.length === 0) return;
    const roster = await fetchQaWebsiteRoster(websiteId);
    const internal = roster.internal.map((r) => r.userId);
    const external = roster.external.map((r) => r.userId);
    const merged =
      channel === "Internal"
        ? [...new Set([...internal, ...selectedUserIds])]
        : internal;
    const mergedExt =
      channel === "External"
        ? [...new Set([...external, ...selectedUserIds])]
        : external;
    await onSave(websiteId, merged, mergedExt);
  };

  const orgReady =
    channel === "Internal"
      ? Boolean(modalScope.websiteId.trim()) &&
        (!modalScope.canFilterByResellerId || Boolean(modalResellerId))
      : Boolean(modalScope.websiteId.trim()) && Boolean(modalScope.parentCompanyId);

  return (
    <FormModal
      open={open}
      fitContent
      maxWidth={720}
      title="Add QA reviewers"
      description="Pick organization, website, channel, department, then reviewers (department-wise — same as involvement supervisors)."
      onClose={onClose}
      onSave={() => void handleSave()}
      primaryButtonLabel={saving ? "Saving…" : `Add ${selectedUserIds.length} reviewer(s)`}
      primaryButtonDisabled={
        !canEdit ||
        saving ||
        !orgReady ||
        !departmentId ||
        selectedUserIds.length === 0
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <InvolvementOrgScopeFields scope={modalScope} canEdit={canEdit} disabled={saving} />

        <SelectField
          label="QA type"
          value={channel}
          onChange={handleChannelChange}
          options={channelOptions}
          disabled={!canEdit || saving || isExternalSession}
          menuMaxRows={4}
        />

        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mt: -1 }}>
          {channel === "Internal"
            ? "Internal QA uses internal departments and internal users only."
            : "External QA uses external departments under the selected parent company."}
        </Typography>

        <SelectField
          label={deptLabel}
          value={departmentId}
          onChange={setDepartmentId}
          options={deptOptions}
          disabled={
            !canEdit ||
            saving ||
            deptCatalog.isLoading ||
            (channel === "Internal"
              ? modalScope.canFilterByResellerId && !modalResellerId
              : !orgReady) ||
            departments.length === 0
          }
          menuMaxRows={8}
          searchPlaceholder={`Search ${channel.toLowerCase()} department…`}
        />

        <Box sx={assignmentStepRowSx}>
          <Chip label={`${channel} department`} size="small" sx={assignmentStepChipSx(Boolean(departmentId))} />
          <Chip
            label="Select reviewers"
            size="small"
            sx={assignmentStepChipSx(selectedUserIds.length > 0)}
          />
        </Box>

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
              {channel} users in this department only.
            </Typography>
          </Box>
        ) : null}

        {departmentId &&
        (channel === "Internal"
          ? !modalScope.canFilterByResellerId || Boolean(modalResellerId)
          : orgReady) ? (
          <MultiUserCheckboxPicker
            userType={channel}
            departmentId={departmentId}
            selectedIds={selectedUserIds}
            onChangeSelectedIds={setSelectedUserIds}
            canEdit={canEdit}
            disabled={saving}
            emptyHint={`No ${channel.toLowerCase()} users in this department.`}
          />
        ) : (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            Complete org, website, and department to list users.
          </Typography>
        )}
      </Box>
    </FormModal>
  );
}
