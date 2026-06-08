"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { InputField, Typography } from "@/components/common";
import { listQaDirectoryUsers } from "@/services/chat/qa-directory.api";

export type QaDirectoryUserPickerProps = {
  userType: "Internal" | "External";
  departmentId?: string;
  poolId?: string;
  websiteId: string;
  selectedIds: string[];
  onChangeSelectedIds: (ids: string[]) => void;
  canEdit?: boolean;
  disabled?: boolean;
  emptyHint?: string;
};

function userLabel(
  u: { firstName: string | null; lastName: string | null; email: string; id: string },
): string {
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  if (name) return u.email ? `${name} · ${u.email}` : name;
  return u.email || u.id.slice(0, 8);
}

export function QaDirectoryUserPicker({
  userType,
  departmentId,
  poolId,
  websiteId,
  selectedIds,
  onChangeSelectedIds,
  canEdit = true,
  disabled = false,
  emptyHint,
}: QaDirectoryUserPickerProps) {
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const deptId = departmentId?.trim() ?? "";
  const pool = poolId?.trim() ?? "";
  const siteId = websiteId.trim();
  const scopeId = userType === "Internal" ? pool : deptId;

  const usersQuery = useQuery({
    queryKey: ["qa-directory-users", userType, pool, deptId, siteId] as const,
    queryFn: () =>
      listQaDirectoryUsers({
        userType,
        ...(pool ? { poolId: pool } : {}),
        ...(deptId ? { departmentId: deptId } : {}),
        websiteId: siteId || undefined,
      }),
    enabled: Boolean(scopeId),
    staleTime: 30_000,
  });

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filtered = useMemo(() => {
    const rows = usersQuery.data ?? [];
    const q = search.trim().toLowerCase();
    const visible = rows.filter((u) => !u.excluded || selectedSet.has(u.id));
    if (!q) return visible.sort((a, b) => userLabel(a).localeCompare(userLabel(b)));
    return visible
      .filter(
        (u) =>
          userLabel(u).toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q),
      )
      .sort((a, b) => userLabel(a).localeCompare(userLabel(b)));
  }, [usersQuery.data, search, selectedSet]);

  const hiddenExcludedCount = useMemo(() => {
    const rows = usersQuery.data ?? [];
    return rows.filter((u) => u.excluded && !selectedSet.has(u.id)).length;
  }, [usersQuery.data, selectedSet]);

  const toggle = (userId: string) => {
    if (!canEdit || disabled) return;
    onChangeSelectedIds(
      selectedIds.includes(userId)
        ? selectedIds.filter((id) => id !== userId)
        : [...selectedIds, userId],
    );
  };

  const pickAllVisible = () => {
    const ids = new Set(selectedIds);
    for (const u of filtered) ids.add(u.id);
    onChangeSelectedIds([...ids]);
  };

  const clearVisible = () => {
    const visible = new Set(filtered.map((u) => u.id));
    onChangeSelectedIds(selectedIds.filter((id) => !visible.has(id)));
  };

  if (!scopeId) {
    return (
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 1 }}>
        {userType === "Internal" ? "Choose a pool to list users." : "Choose a department to list users."}
      </Typography>
    );
  }

  if (usersQuery.isLoading) {
    return (
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 1 }}>
        Loading users…
      </Typography>
    );
  }

  if (usersQuery.isError) {
    return (
      <Typography variant="body2" color="error" sx={{ py: 1 }}>
        Could not load users for this {userType === "Internal" ? "pool" : "department"}.
      </Typography>
    );
  }

  return (
    <Box sx={{ opacity: disabled ? 0.6 : 1 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", mb: 1.5 }}>
        <InputField
          label="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={disabled}
          placeholder="Name or email…"
        />
        {canEdit && !disabled ? (
          <>
            <Box
              component="button"
              type="button"
              onClick={pickAllVisible}
              sx={{
                cursor: "pointer",
                color: theme.app.dashboard.accentBlue,
                border: "none",
                bgcolor: "transparent",
                fontWeight: 600,
                fontSize: 12,
                p: 0,
              }}
            >
              Select visible
            </Box>
            <Box
              component="button"
              type="button"
              onClick={clearVisible}
              sx={{
                cursor: "pointer",
                color: theme.app.dashboard.textMuted,
                border: "none",
                bgcolor: "transparent",
                fontSize: 12,
                p: 0,
              }}
            >
              Clear visible
            </Box>
          </>
        ) : null}
      </Box>

      {hiddenExcludedCount > 0 ? (
        <Typography
          variant="caption"
          sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}
        >
          {hiddenExcludedCount} user(s) hidden — on the live chat roster for this website.
        </Typography>
      ) : null}

      {filtered.length === 0 ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          {emptyHint ??
            `No eligible users in this ${userType === "Internal" ? "pool" : "department"} (live chat agents are excluded).`}
        </Typography>
      ) : (
        <Box
          sx={{
            maxHeight: 280,
            overflow: "auto",
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            borderRadius: 1.5,
            p: 1,
          }}
        >
          {filtered.map((u) => (
            <FormControlLabel
              key={u.id}
              control={
                <Checkbox
                  size="small"
                  checked={selectedSet.has(u.id)}
                  onChange={() => toggle(u.id)}
                  disabled={!canEdit || disabled}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontSize: 13 }}>
                  {userLabel(u)}
                </Typography>
              }
              sx={{ display: "flex", ml: 0, mr: 0, py: 0.25 }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
