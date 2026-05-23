"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { ServiceChannel, WebsiteAssignmentTier } from "@/api/types/website-assignments.types";
import { useUsersListQuery } from "@/lib/hooks";
import { buildRosterUserOptions } from "../utils/roster-user-options";
import { mergeSx } from "@/lib/mui/merge-sx";
import {
  rosterChannelPanelSx,
  rosterRankBannerSx,
  rosterTierRowSx,
} from "../styles/website-assignment-ui.styles";

const TIERS: WebsiteAssignmentTier[] = ["Primary", "Secondary", "Backup"];

const TIER_HINTS: Record<WebsiteAssignmentTier, string> = {
  Primary: "Department chats route here first",
  Secondary: "Used when Primary is busy or unavailable",
  Backup: "Last resort after Primary and Secondary",
};

export type SlotDraft = Record<WebsiteAssignmentTier, string>;

export function emptySlotDraft(): SlotDraft {
  return { Primary: "", Secondary: "", Backup: "" };
}

export function formatAgentLabel(name: string, email?: string, department?: string): string {
  const n = name.trim() || "Unnamed user";
  const parts = [n];
  if (email?.trim()) parts.push(email.trim());
  else if (department?.trim()) parts.push(department.trim());
  return parts.join(" · ");
}

type RosterSlotPickerProps = {
  title: string;
  channel: ServiceChannel;
  departmentId: string;
  departmentName: string;
  draft: SlotDraft;
  disabled?: boolean;
  canEdit: boolean;
  onChange: (tier: WebsiteAssignmentTier, userId: string) => void;
};

export function RosterSlotPicker({
  title,
  channel,
  departmentId,
  departmentName,
  draft,
  disabled = false,
  canEdit,
  onChange,
}: RosterSlotPickerProps) {
  const theme = useTheme() as AppTheme;

  const usersQuery = useUsersListQuery(
    { all: true, userType: channel, departmentId },
    { enabled: canEdit && !disabled && departmentId.trim().length > 0 },
  );

  const userOptions = useMemo(
    () => buildRosterUserOptions(usersQuery.data, departmentId),
    [usersQuery.data, departmentId],
  );

  const selectableCount = useMemo(
    () => userOptions.filter((u) => !u.disabled).length,
    [userOptions],
  );

  const takenByOther = (tier: WebsiteAssignmentTier, candidateId: string) => {
    if (!candidateId) return false;
    for (const t of TIERS) {
      if (t === tier) continue;
      if (draft[t] === candidateId) return true;
    }
    return false;
  };

  const findLabel = (userId: string) => userOptions.find((o) => o.id === userId)?.label;

  return (
    <Box sx={mergeSx(rosterChannelPanelSx, { opacity: disabled ? 0.5 : 1 })}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
        <Typography fontWeight={700} sx={{ fontSize: 15 }}>
          {title}
        </Typography>
        <Chip label={channel} size="small" sx={{ height: 24, fontWeight: 600, fontSize: 11 }} />
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          {departmentName}
        </Typography>
      </Box>

      <Box sx={rosterRankBannerSx}>
        <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
          Routing order for this department: <strong>Primary → Secondary → Backup</strong>. Live chats
          always try Primary first, then Secondary, then Backup.
        </Typography>
      </Box>

      {usersQuery.isLoading ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1 }}>
          Loading {channel.toLowerCase()} team members…
        </Typography>
      ) : null}

      {!usersQuery.isLoading && userOptions.length === 0 ? (
        <Typography variant="body2" sx={{ color: theme.palette.warning.light, mb: 1 }}>
          No {channel.toLowerCase()} users in this department. Add users under User management first.
        </Typography>
      ) : null}

      {!usersQuery.isLoading && userOptions.length > 0 && selectableCount === 0 ? (
        <Typography variant="body2" sx={{ color: theme.palette.warning.light, mb: 1 }}>
          All users in this department are department heads. Assign pool members or pool heads instead.
        </Typography>
      ) : null}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {TIERS.map((tier) => (
          <Box key={tier} sx={rosterTierRowSx}>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {tier}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
                {TIER_HINTS[tier]}
              </Typography>
            </Box>
            <FormControl fullWidth size="small" disabled={!canEdit || disabled}>
              <InputLabel id={`roster-${channel}-${departmentId}-${tier}`}>Team member</InputLabel>
              <Select
                labelId={`roster-${channel}-${departmentId}-${tier}`}
                label="Team member"
                value={draft[tier]}
                onChange={(e) => onChange(tier, e.target.value)}
                displayEmpty
                renderValue={(v) => {
                  if (!v) {
                    return (
                      <Typography component="span" variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                        Not assigned
                      </Typography>
                    );
                  }
                  return findLabel(v) ?? "Assigned member";
                }}
              >
                <MenuItem value="">
                  <em>Not assigned</em>
                </MenuItem>
                {userOptions.map((u) => (
                  <MenuItem
                    key={u.id}
                    value={u.id}
                    disabled={u.disabled || takenByOther(tier, u.id)}
                    title={u.disabledReason}
                  >
                    {u.label}
                    {u.disabled ? " (not eligible)" : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
