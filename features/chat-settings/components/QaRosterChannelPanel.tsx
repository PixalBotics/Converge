"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { SelectField, Typography } from "@/components/common";
import { useQaChannelDepartmentsQuery } from "@/features/chat-qa/hooks/useQaChannelDepartmentsQuery";
import { useQaInternalPoolsQuery } from "@/features/chat-qa/hooks/useQaInternalPoolsQuery";
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
  selectedIds?: string[];
  onChangeSelectedIds?: (ids: string[]) => void;
  internalByPool?: Record<string, string[]>;
  onInternalByPoolChange?: (next: Record<string, string[]>) => void;
  chatAgentUserIds: string[];
  canEdit: boolean;
  disabled?: boolean;
};

function reviewerLabel(row: QaRosterUser): string {
  const u = row.user;
  const name = [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim();
  const base = name ? (u?.email ? `${name} · ${u.email}` : name) : (u?.email ?? row.userId.slice(0, 8));
  if (row.pool?.name) return `${base} (${row.pool.name})`;
  return base;
}

export function QaRosterChannelPanel({
  channel,
  websiteId,
  parentCompanyId,
  resellerId,
  canFilterByResellerId,
  assigned,
  selectedIds = [],
  onChangeSelectedIds,
  internalByPool = {},
  onInternalByPoolChange,
  canEdit,
  disabled = false,
}: QaRosterChannelPanelProps) {
  const theme = useTheme() as AppTheme;
  const isInternal = channel === "Internal";
  const [poolId, setPoolId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const poolsCatalog = useQaInternalPoolsQuery(
    {
      parentCompanyId,
      resellerId,
      requireResellerId: canFilterByResellerId,
    },
    isInternal && Boolean(websiteId),
  );

  const deptCatalog = useQaChannelDepartmentsQuery(
    {
      channel,
      parentCompanyId: channel === "External" ? parentCompanyId : undefined,
      resellerId,
      requireResellerId: canFilterByResellerId,
    },
    !isInternal && Boolean(websiteId),
  );

  const pools = useMemo(() => poolsCatalog.data ?? [], [poolsCatalog.data]);
  const departments = useMemo(() => deptCatalog.data ?? [], [deptCatalog.data]);
  const defaultPoolId = pools[0]?.id ?? "";
  const defaultDepartmentId = departments[0]?.id ?? "";

  useEffect(() => {
    if (isInternal) setPoolId(defaultPoolId);
  }, [isInternal, websiteId, defaultPoolId]);

  useEffect(() => {
    if (!isInternal) setDepartmentId(defaultDepartmentId);
  }, [isInternal, websiteId, defaultDepartmentId, channel]);

  const poolOptions = useMemo(
    () => [
      {
        value: "",
        label: poolsCatalog.isLoading
          ? "Loading pools…"
          : pools.length
            ? "Select pool…"
            : "No internal pools for this reseller",
      },
      ...pools.map((p) => ({
        value: p.id,
        label: `${p.label}${p.memberCount > 0 ? ` (${p.memberCount} users)` : " (no users yet)"}`,
      })),
    ],
    [pools, poolsCatalog.isLoading],
  );

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

  const scopeReady = isInternal
    ? Boolean(resellerId?.trim()) ||
      Boolean(parentCompanyId.trim()) ||
      !canFilterByResellerId
    : Boolean(parentCompanyId.trim()) &&
      (!canFilterByResellerId || Boolean(resellerId?.trim()));

  const activePoolSelectedIds = isInternal
    ? (internalByPool[poolId] ?? [])
    : selectedIds;

  const handleSelectionChange = (ids: string[]) => {
    if (isInternal && onInternalByPoolChange && poolId) {
      onInternalByPoolChange({ ...internalByPool, [poolId]: ids });
      return;
    }
    onChangeSelectedIds?.(ids);
  };

  const totalInternalSelected = isInternal
    ? Object.values(internalByPool).reduce((n, ids) => n + ids.length, 0)
    : selectedIds.length;

  const pickerReady = isInternal ? Boolean(poolId) && scopeReady : Boolean(departmentId) && scopeReady;

  return (
    <Box sx={rosterChannelPanelSx}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Typography fontWeight={700} sx={{ fontSize: 15 }}>
          {channel} QA reviewers
        </Typography>
        <Chip
          label={`${isInternal ? totalInternalSelected : selectedIds.length} selected`}
          size="small"
          sx={{
            height: 24,
            fontWeight: 600,
            bgcolor: alpha(theme.app.dashboard.accentViolet, 0.12),
            color: theme.app.dashboard.accentViolet,
          }}
        />
      </Box>

      <Typography
        variant="caption"
        sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5, lineHeight: 1.5 }}
      >
        {isInternal
          ? "Internal QA is pool-wise — pick a pool, then reviewers who handle closed internal chats for that pool."
          : "External QA reviews external-channel chats. Users on the live chat roster for this website are hidden."}
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
        <Typography
          variant="caption"
          sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}
        >
          No {channel.toLowerCase()} QA reviewers saved yet.
        </Typography>
      )}

      {isInternal ? (
        <SelectField
          label="Internal pool"
          value={poolId}
          onChange={setPoolId}
          options={poolOptions}
          disabled={
            !canEdit || disabled || poolsCatalog.isLoading || !scopeReady || pools.length === 0
          }
          menuMaxRows={8}
          searchPlaceholder="Search pool…"
        />
      ) : (
        <SelectField
          label="External department"
          value={departmentId}
          onChange={setDepartmentId}
          options={deptOptions}
          disabled={
            !canEdit || disabled || deptCatalog.isLoading || !scopeReady || departments.length === 0
          }
          menuMaxRows={8}
          searchPlaceholder="Search department…"
        />
      )}

      <Box sx={{ ...assignmentStepRowSx, mt: 1.5, mb: 1 }}>
        <Chip
          label={isInternal ? "Internal pool" : "External department"}
          size="small"
          sx={assignmentStepChipSx(isInternal ? Boolean(poolId) : Boolean(departmentId))}
        />
        <Chip
          label="Pick QA reviewers"
          size="small"
          sx={assignmentStepChipSx(isInternal ? totalInternalSelected > 0 : selectedIds.length > 0)}
        />
      </Box>

      {isInternal && poolsCatalog.isError ? (
        <Typography variant="body2" color="error" sx={{ py: 1 }}>
          Could not load pools. Select reseller above and try again.
        </Typography>
      ) : null}

      {isInternal && scopeReady && !poolsCatalog.isLoading && pools.length === 0 ? (
        <Box
          sx={{
            mt: 1,
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: alpha(theme.app.dashboard.accentBlue, 0.06),
            border: `1px solid ${alpha(theme.app.dashboard.accentBlue, 0.2)}`,
          }}
        >
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.6 }}>
            <strong>No pools found.</strong> Create one first:{" "}
            <strong>HRMS → Pools</strong> (under an internal department), add users to that pool in{" "}
            <strong>User management</strong>, then return here — pick the pool, check QA reviewers,
            and click <strong>Save QA roster</strong>.
          </Typography>
        </Box>
      ) : null}

      {pickerReady ? (
        <QaDirectoryUserPicker
          userType={channel}
          poolId={isInternal ? poolId : undefined}
          departmentId={!isInternal ? departmentId : undefined}
          websiteId={websiteId}
          selectedIds={activePoolSelectedIds}
          onChangeSelectedIds={handleSelectionChange}
          canEdit={canEdit}
          disabled={disabled}
          emptyHint={
            isInternal
              ? "No eligible internal users in this pool (live chat agents are excluded)."
              : "No eligible external users in this department (or all are chat agents)."
          }
        />
      ) : (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 1 }}>
          {!scopeReady
            ? isInternal
              ? canFilterByResellerId
                ? "Select reseller in website scope above (pools are per reseller)."
                : "Waiting for org scope…"
              : "Select parent company in website scope above."
            : isInternal
              ? pools.length === 0
                ? "Create a pool under HRMS → Pools, then pick it here."
                : "Choose a pool to list users."
              : "Choose a department to list users."}
        </Typography>
      )}
    </Box>
  );
}
