"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { SelectField, Typography } from "@/components/common";
import { useQaChannelDepartmentsQuery } from "@/features/chat-qa/hooks/useQaChannelDepartmentsQuery";
import { QaDirectoryUserPicker } from "@/features/chat-qa/components/QaDirectoryUserPicker";
import {
  assignmentStepChipSx,
  assignmentStepRowSx,
  rosterChannelPanelSx,
} from "@/features/website-assignments/styles/website-assignment-ui.styles";
import type { QaRosterUser } from "@/services/chat/qa-roster.api";

type QaChannel = "Internal" | "External";

type QaRosterChannelPanelProps = {
  channel: QaChannel;
  websiteId: string;
  parentCompanyId: string;
  resellerId?: string;
  canFilterByResellerId: boolean;
  assigned: QaRosterUser[];
  selectedIds: string[];
  onChangeSelectedIds: (ids: string[]) => void;
  chatAgentUserIds: string[];
  canEdit: boolean;
  disabled?: boolean;
};

function reviewerLabel(row: QaRosterUser): string {
  const u = row.user;
  const name = [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim();
  if (name) return u?.email ? `${name} · ${u.email}` : name;
  return u?.email ?? row.userId.slice(0, 8);
}

export function QaRosterChannelPanel({
  channel,
  websiteId,
  parentCompanyId,
  resellerId,
  canFilterByResellerId,
  assigned,
  selectedIds,
  onChangeSelectedIds,
  chatAgentUserIds,
  canEdit,
  disabled = false,
}: QaRosterChannelPanelProps) {
  const theme = useTheme() as AppTheme;
  const [departmentId, setDepartmentId] = useState("");

  const deptCatalog = useQaChannelDepartmentsQuery(
    {
      channel,
      parentCompanyId: channel === "External" ? parentCompanyId : undefined,
      resellerId,
      requireResellerId: canFilterByResellerId,
    },
    Boolean(websiteId),
  );

  const departments = useMemo(() => deptCatalog.data ?? [], [deptCatalog.data]);
  const defaultDepartmentId = departments[0]?.id ?? "";

  useEffect(() => {
    setDepartmentId(defaultDepartmentId);
  }, [channel, websiteId, defaultDepartmentId]);

  const deptOptions = useMemo(
    () => [
      {
        value: "",
        label: deptCatalog.isLoading
          ? "Loading departments…"
          : departments.length
            ? "Select department…"
            : `No ${channel.toLowerCase()} departments`,
      },
      ...departments.map((d) => ({ value: d.id, label: d.label })),
    ],
    [channel, departments, deptCatalog.isLoading],
  );

  const deptReady =
    channel === "Internal"
      ? !canFilterByResellerId || Boolean(resellerId?.trim())
      : Boolean(parentCompanyId.trim());

  return (
    <Box sx={rosterChannelPanelSx}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Typography fontWeight={700} sx={{ fontSize: 15 }}>
          {channel} QA reviewers
        </Typography>
        <Chip
          label={`${selectedIds.length} selected`}
          size="small"
          sx={{
            height: 24,
            fontWeight: 600,
            bgcolor: alpha(theme.app.dashboard.accentViolet, 0.12),
            color: theme.app.dashboard.accentViolet,
          }}
        />
      </Box>

      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5, lineHeight: 1.5 }}>
        Dedicated QA staff only — users on the <strong>live chat roster</strong> for this website are
        hidden. They handle chats; QA reviewers score closed conversations in the QA inbox.
      </Typography>

      {assigned.length > 0 ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
          {assigned.map((row) => (
            <Chip
              key={row.userId}
              label={reviewerLabel(row)}
              size="small"
              variant="outlined"
              sx={{ height: 26, fontSize: 11, maxWidth: "100%" }}
            />
          ))}
        </Box>
      ) : (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
          No {channel.toLowerCase()} QA reviewers saved yet.
        </Typography>
      )}

      <SelectField
        label={channel === "Internal" ? "Internal department" : "External department"}
        value={departmentId}
        onChange={setDepartmentId}
        options={deptOptions}
        disabled={!canEdit || disabled || deptCatalog.isLoading || !deptReady || departments.length === 0}
        menuMaxRows={8}
        searchPlaceholder="Search department…"
      />

      <Box sx={{ ...assignmentStepRowSx, mt: 1.5, mb: 1 }}>
        <Chip
          label={`${channel} department`}
          size="small"
          sx={assignmentStepChipSx(Boolean(departmentId))}
        />
        <Chip
          label="Pick QA reviewers"
          size="small"
          sx={assignmentStepChipSx(selectedIds.length > 0)}
        />
      </Box>

      {departmentId && deptReady ? (
        <QaDirectoryUserPicker
          userType={channel}
          departmentId={departmentId}
          websiteId={websiteId}
          selectedIds={selectedIds}
          onChangeSelectedIds={onChangeSelectedIds}
          canEdit={canEdit}
          disabled={disabled}
          emptyHint={`No eligible ${channel.toLowerCase()} users in this department (or all are chat agents).`}
        />
      ) : (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 1 }}>
          {!deptReady
            ? channel === "External"
              ? "Select parent company in website scope above."
              : "Select reseller in website scope above."
            : "Choose a department to list users."}
        </Typography>
      )}
    </Box>
  );
}
