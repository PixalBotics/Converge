"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { InputField, Typography } from "@/components/common";
import { useUsersListQuery } from "@/lib/hooks";
import { buildChatRosterUserOptions } from "../utils/chat-roster-user-options";

export type MultiUserCheckboxPickerProps = {
  parentCompanyId?: string;
  userType?: "Internal" | "External";
  departmentId?: string;
  selectedIds: string[];
  onChangeSelectedIds: (ids: string[]) => void;
  canEdit?: boolean;
  disabled?: boolean;
  emptyHint?: string;
  /** Hidden from list unless already selected (e.g. live chat agents when picking QA). */
  excludeUserIds?: string[];
  excludeReason?: string;
};

export function MultiUserCheckboxPicker({
  userType,
  departmentId,
  selectedIds,
  onChangeSelectedIds,
  canEdit = true,
  disabled = false,
  emptyHint,
  excludeUserIds = [],
  excludeReason = "Not eligible for this role",
}: MultiUserCheckboxPickerProps) {
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const deptId = departmentId?.trim() ?? "";

  const usersQuery = useUsersListQuery(
    {
      all: true,
      userType,
      departmentId: deptId || undefined,
    },
    {
      enabled: Boolean(userType) && Boolean(deptId),
    },
  );

  const excludeSet = useMemo(
    () => new Set(excludeUserIds.map((id) => id.trim()).filter(Boolean)),
    [excludeUserIds],
  );
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const options = useMemo(
    () =>
      buildChatRosterUserOptions(usersQuery.data, {
        userType,
        trustApiScope: true,
      }),
    [usersQuery.data, userType],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const byId = new Map(options.map((o) => [o.id, o]));
    for (const id of selectedIds) {
      if (!byId.has(id)) byId.set(id, { id, label: id.slice(0, 8), email: "" });
    }
    const all = [...byId.values()].filter((u) => {
      if (!excludeSet.has(u.id)) return true;
      return selectedSet.has(u.id);
    });
    if (!q) return all.sort((a, b) => a.label.localeCompare(b.label));
    return all
      .filter(
        (u) =>
          u.label.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q),
      )
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [options, search, selectedIds, excludeSet, selectedSet]);

  const hiddenExcludedCount = useMemo(() => {
    let n = 0;
    for (const id of excludeSet) {
      if (!selectedSet.has(id) && options.some((o) => o.id === id)) n += 1;
    }
    return n;
  }, [excludeSet, selectedSet, options]);

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

  return (
    <Box sx={{ opacity: disabled ? 0.6 : 1 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", mb: 1.5 }}>
        <InputField
          label="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name, email, pool…"
          disabled={!canEdit || disabled}
          sx={{ flex: 1, minWidth: 200, maxWidth: 400 }}
        />
        {canEdit && !disabled ? (
          <>
            <Box
              component="button"
              type="button"
              onClick={pickAllVisible}
              sx={{
                border: "none",
                bgcolor: "transparent",
                cursor: "pointer",
                p: 0,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: theme.palette.primary.main, fontWeight: 600 }}
              >
                Select all shown
              </Typography>
            </Box>
            <Box
              component="button"
              type="button"
              onClick={clearVisible}
              sx={{
                border: "none",
                bgcolor: "transparent",
                cursor: "pointer",
                p: 0,
              }}
            >
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Clear shown
              </Typography>
            </Box>
          </>
        ) : null}
      </Box>

      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
        {selectedIds.length} selected
        {userType ? ` · ${userType} users` : ""}
        {deptId ? " · this department" : ""}
        {hiddenExcludedCount > 0
          ? ` · ${hiddenExcludedCount} hidden (${excludeReason.toLowerCase()})`
          : ""}
      </Typography>

      {usersQuery.isLoading ? (
        <Typography sx={{ color: theme.app.dashboard.textMuted, fontSize: 13, py: 2 }}>
          Loading users…
        </Typography>
      ) : null}

      {!usersQuery.isLoading && options.length === 0 ? (
        <Typography sx={{ color: theme.palette.warning.light, fontSize: 13, py: 1 }}>
          {emptyHint ??
            "No users in this department. Add users under User management first."}
        </Typography>
      ) : null}

      {!usersQuery.isLoading && filtered.length > 0 ? (
        <Box
          sx={{
            maxHeight: 320,
            overflow: "auto",
            borderRadius: 2,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            bgcolor: "rgba(255,255,255,0.02)",
            p: 0.5,
          }}
        >
          {filtered.map((u) => (
            <FormControlLabel
              key={u.id}
              sx={{
                alignItems: "flex-start",
                mx: 0,
                px: 1,
                py: 0.35,
                width: "100%",
                borderRadius: 1,
                "&:hover": { bgcolor: theme.app.dashboard.overlayLight },
              }}
              control={
                <Checkbox
                  size="small"
                  checked={selectedIds.includes(u.id)}
                  onChange={() => toggle(u.id)}
                  disabled={!canEdit || disabled}
                />
              }
              label={
                <Typography sx={{ fontSize: 13, pt: 0.35, lineHeight: 1.4 }}>{u.label}</Typography>
              }
            />
          ))}
        </Box>
      ) : null}

      {!usersQuery.isLoading && options.length > 0 && filtered.length === 0 ? (
        <Typography sx={{ color: theme.app.dashboard.textMuted, fontSize: 13, py: 1 }}>
          No users match your search.
        </Typography>
      ) : null}
    </Box>
  );
}
