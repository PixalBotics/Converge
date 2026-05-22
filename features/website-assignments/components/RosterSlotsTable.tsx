"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { SelectField, Typography } from "@/components/common";
import type { ServiceChannel, WebsiteAssignmentTier } from "@/api/types/website-assignments.types";
import { useUsersListQuery } from "@/lib/hooks";
import { buildRosterUserOptions } from "../utils/roster-user-options";
import { ROSTER_TIERS } from "../utils/roster-draft.utils";
import type { SlotDraft } from "./RosterSlotPicker";
import { formatAgentLabel } from "./RosterSlotPicker";

const TIER_LABELS: Record<WebsiteAssignmentTier, string> = {
  Primary: "Primary — first agent for new chats",
  Secondary: "Secondary — when Primary is busy",
  Backup: "Backup — last resort",
};

type RosterSlotsTableProps = {
  channel: ServiceChannel;
  departmentId: string;
  draft: SlotDraft;
  disabled?: boolean;
  canEdit: boolean;
  onChange: (tier: WebsiteAssignmentTier, userId: string) => void;
};

export function RosterSlotsTable({
  channel,
  departmentId,
  draft,
  disabled = false,
  canEdit,
  onChange,
}: RosterSlotsTableProps) {
  const theme = useTheme() as AppTheme;

  const usersQuery = useUsersListQuery(
    { all: true, userType: channel, departmentId },
    { enabled: canEdit && !disabled && departmentId.trim().length > 0 },
  );

  const userOptions = useMemo(
    () => buildRosterUserOptions(usersQuery.data, departmentId),
    [usersQuery.data, departmentId],
  );

  const selectOptions = useMemo(() => {
    const base = [{ value: "", label: "Not assigned" }];
    return [
      ...base,
      ...userOptions.map((u) => ({
        value: u.id,
        label: u.disabled ? `${u.label} (not eligible)` : u.label,
      })),
    ];
  }, [userOptions]);

  const takenByOther = (tier: WebsiteAssignmentTier, candidateId: string) => {
    if (!candidateId) return false;
    for (const t of ROSTER_TIERS) {
      if (t === tier) continue;
      if (draft[t] === candidateId) return true;
    }
    return false;
  };

  return (
    <Box sx={{ opacity: disabled ? 0.5 : 1 }}>
      {usersQuery.isLoading ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1 }}>
          Loading {channel.toLowerCase()} users for this department…
        </Typography>
      ) : null}
      <Table
        size="small"
        sx={{
          "& .MuiTableCell-root": {
            borderColor: theme.app.dashboard.cardBorder,
            py: 1.25,
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, width: { xs: "36%", sm: "28%" } }}>Rank</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Team member</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ROSTER_TIERS.map((tier) => {
            const value = draft[tier];
            const filteredOptions = selectOptions.filter((o) => {
              if (!o.value) return true;
              if (o.value === value) return true;
              if (takenByOther(tier, o.value)) return false;
              const u = userOptions.find((x) => x.id === o.value);
              return !u?.disabled;
            });
            return (
              <TableRow key={tier}>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {tier}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                    {TIER_LABELS[tier]}
                  </Typography>
                </TableCell>
                <TableCell>
                  <SelectField
                    label={`${tier} agent`}
                    value={value}
                    onChange={(v) => onChange(tier, v)}
                    options={filteredOptions}
                    disabled={!canEdit || disabled}
                    menuMaxRows={4}
                    searchPlaceholder="Search user…"
                  />
                  {value ? (
                    <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mt: 0.5 }}>
                      {formatAgentLabel(
                        userOptions.find((u) => u.id === value)?.label ?? "Assigned",
                      )}
                    </Typography>
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
