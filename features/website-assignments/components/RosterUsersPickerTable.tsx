"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { InputField, Typography } from "@/components/common";
import type { ServiceChannel, WebsiteAssignmentTier } from "@/api/types/website-assignments.types";
import { useUsersListQuery } from "@/lib/hooks";
import { buildRosterUserOptions } from "../utils/roster-user-options";
import { ROSTER_TIERS } from "../utils/roster-draft.utils";
import type { SlotDraft } from "./RosterSlotPicker";

type RosterUsersPickerTableProps = {
  channel: ServiceChannel;
  departmentId: string;
  departmentName?: string;
  draft: SlotDraft;
  disabled?: boolean;
  canEdit: boolean;
  onChange: (draft: SlotDraft) => void;
};

export function RosterUsersPickerTable({
  channel,
  departmentId,
  departmentName,
  draft,
  disabled = false,
  canEdit,
  onChange,
}: RosterUsersPickerTableProps) {
  const theme = useTheme() as AppTheme;
  const [userSearch, setUserSearch] = useState("");

  const usersQuery = useUsersListQuery(
    { all: true, userType: channel, departmentId },
    { enabled: !disabled && departmentId.trim().length > 0 },
  );

  const userOptions = useMemo(
    () => buildRosterUserOptions(usersQuery.data, departmentId),
    [usersQuery.data, departmentId],
  );

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return userOptions;
    return userOptions.filter((u) => u.label.toLowerCase().includes(q));
  }, [userOptions, userSearch]);

  const assignTier = (tier: WebsiteAssignmentTier, userId: string) => {
    if (!canEdit || disabled) return;
    const next = { ...draft };
    if (next[tier] === userId) {
      next[tier] = "";
    } else {
      for (const t of ROSTER_TIERS) {
        if (t !== tier && next[t] === userId) next[t] = "";
      }
      next[tier] = userId;
    }
    onChange(next);
  };

  const tierTakenByOther = (tier: WebsiteAssignmentTier, userId: string) => {
    for (const t of ROSTER_TIERS) {
      if (t === tier) continue;
      if (draft[t] === userId) return true;
    }
    return false;
  };

  const selectedSummary = ROSTER_TIERS.map((tier) => {
    const id = draft[tier];
    if (!id) return null;
    const u = userOptions.find((o) => o.id === id);
    return { tier, label: u?.label ?? "Assigned user" };
  }).filter(Boolean) as { tier: WebsiteAssignmentTier; label: string }[];

  return (
    <Box sx={{ opacity: disabled ? 0.5 : 1 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5, alignItems: "center" }}>
        <Typography variant="body2" fontWeight={600}>
          {channel} team
          {departmentName ? ` · ${departmentName}` : ""}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          Pick one user per column (click again to clear).
        </Typography>
      </Box>

      {selectedSummary.length > 0 ? (
        <Box
          sx={{
            mb: 1.5,
            p: 1,
            borderRadius: 1.5,
            bgcolor: `${theme.palette.primary.main}10`,
            border: `1px solid ${theme.palette.primary.main}33`,
          }}
        >
          {selectedSummary.map(({ tier, label }) => (
            <Typography key={tier} variant="caption" sx={{ display: "block", lineHeight: 1.5 }}>
              <strong>{tier}:</strong> {label}
            </Typography>
          ))}
        </Box>
      ) : null}

      <InputField
        label="Search users"
        value={userSearch}
        onChange={(e) => setUserSearch((e.target as HTMLInputElement).value)}
        placeholder="Name, email, pool…"
        disabled={!canEdit || disabled}
        sx={{ mb: 1.5, maxWidth: 360 }}
      />

      {usersQuery.isLoading ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
          Loading {channel.toLowerCase()} users…
        </Typography>
      ) : null}

      {!usersQuery.isLoading && userOptions.length === 0 ? (
        <Typography variant="body2" sx={{ color: theme.palette.warning.light, py: 1 }}>
          No {channel.toLowerCase()} users in this department. Add users under User management first.
        </Typography>
      ) : null}

      {!usersQuery.isLoading && userOptions.length > 0 ? (
        <TableContainer
          sx={{
            maxHeight: 320,
            borderRadius: 2,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            bgcolor: "rgba(255,255,255,0.02)",
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, minWidth: 140 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 72 }} align="center">
                  Primary
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: 72 }} align="center">
                  Secondary
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: 72 }} align="center">
                  Backup
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 1 }}>
                      No users match your search.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const blocked = user.disabled;
                  return (
                    <TableRow
                      key={user.id}
                      hover={canEdit && !disabled && !blocked}
                      sx={{
                        opacity: blocked ? 0.45 : 1,
                        bgcolor:
                          draft.Primary === user.id ||
                          draft.Secondary === user.id ||
                          draft.Backup === user.id
                            ? `${theme.palette.primary.main}0c`
                            : undefined,
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {user.label.split(" · ")[0]}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                          {user.label.includes(" · ")
                            ? user.label.split(" · ").slice(1).join(" · ")
                            : user.id.slice(0, 8)}
                          {blocked ? ` · ${user.disabledReason ?? "Not eligible"}` : ""}
                        </Typography>
                      </TableCell>
                      {ROSTER_TIERS.map((tier) => {
                        const checked = draft[tier] === user.id;
                        const takenElsewhere = tierTakenByOther(tier, user.id);
                        const radioDisabled =
                          !canEdit || disabled || blocked || (takenElsewhere && !checked);
                        return (
                          <TableCell key={tier} align="center" padding="checkbox">
                            <Radio
                              size="small"
                              checked={checked}
                              disabled={radioDisabled}
                              onChange={() => assignTier(tier, user.id)}
                              inputProps={{
                                "aria-label": `${tier} — ${user.label}`,
                              }}
                              sx={{ p: 0.5 }}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
    </Box>
  );
}
