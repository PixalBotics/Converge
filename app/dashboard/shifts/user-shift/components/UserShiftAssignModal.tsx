"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  DataTable,
  FormModal,
  InputField,
  SearchBar,
  SelectField,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { WorkingWeekDayToggles } from "@/app/dashboard/shifts/components";
import type { UserListRow, UserType } from "./UsersSidebar";

const MODAL_USER_TABLE_LOADING_ROWS = 8;

export type SelectOption = { value: string; label: string };
export type SelectedUserMeta = {
  name: string;
  email: string;
  type: "Internal" | "External";
  resellerId: string;
  parentCompanyId: string;
  resellerName: string;
  parentCompanyName: string;
  departmentName: string;
  designationName: string;
};

export type UserShiftAssignModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  userId: string;
  onUserIdChange: (id: string) => void;
  /** Users loaded for the current sidebar scope (same list as the sidebar). */
  users: UserListRow[];
  usersLoading?: boolean;
  /** When false, Internal filter chip is hidden (external-only sessions). */
  showInternalUserTypeFilter?: boolean;
  /** When the modal opens, user-type table filter starts here (from sidebar list scope). */
  userListTypeFilter?: "all" | UserType;
  shiftId: string;
  onShiftIdChange: (id: string) => void;
  shiftOptions: SelectOption[];
  effectiveFrom: string;
  onEffectiveFromChange: (v: string) => void;
  effectiveTo: string;
  onEffectiveToChange: (v: string) => void;
  selectedUserMeta: SelectedUserMeta | null;
  assignOverrideWeek: boolean;
  onAssignOverrideWeekChange: (v: boolean) => void;
  assignWorkingMask: number;
  onAssignWorkingMaskChange: (mask: number) => void;
};

type TableUserRow = UserListRow & Record<string, unknown>;

export function UserShiftAssignModal({
  open,
  onClose,
  onSave,
  isSaving,
  userId,
  onUserIdChange,
  users,
  usersLoading = false,
  showInternalUserTypeFilter = true,
  userListTypeFilter = "all",
  shiftId,
  onShiftIdChange,
  shiftOptions,
  effectiveFrom,
  onEffectiveFromChange,
  effectiveTo,
  onEffectiveToChange,
  selectedUserMeta,
  assignOverrideWeek,
  onAssignOverrideWeekChange,
  assignWorkingMask,
  onAssignWorkingMaskChange,
}: UserShiftAssignModalProps) {
  const theme = useTheme() as AppTheme;
  const [typeFilter, setTypeFilter] = useState<"all" | UserType>("all");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (!open) return;
    setSearchInput("");
    if (!showInternalUserTypeFilter) {
      setTypeFilter("External");
      return;
    }
    if (userListTypeFilter === "Internal" || userListTypeFilter === "External") {
      setTypeFilter(userListTypeFilter);
    } else {
      setTypeFilter("all");
    }
  }, [open, showInternalUserTypeFilter, userListTypeFilter]);

  const searchNorm = searchInput.trim().toLowerCase();

  const tableRowsFull = useMemo<TableUserRow[]>(() => {
    let list = users;
    if (typeFilter !== "all") {
      list = list.filter((u) => u.type === typeFilter);
    }
    if (searchNorm) {
      list = list.filter((u) => {
        const hay = [
          u.name,
          u.email,
          u.type,
          u.resellerId,
          u.parentCompanyId,
          u.resellerName,
          u.parentCompanyName,
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(searchNorm);
      });
    }
    const uid = userId.trim();
    if (uid) {
      const selected = users.find((u) => u.id === uid);
      const alreadyIn = list.some((u) => u.id === uid);
      const keepSelectedVisible =
        selected && (typeFilter === "all" || selected.type === typeFilter);
      if (selected && !alreadyIn && keepSelectedVisible) {
        return [selected, ...list] as TableUserRow[];
      }
    }
    return list as TableUserRow[];
  }, [users, typeFilter, searchNorm, userId]);

  const columns = useMemo<DataTableColumn<TableUserRow>[]>(
    () => [
      { id: "name", label: "Name" },
      { id: "email", label: "Email", cellVariant: "muted" },
      {
        id: "type",
        label: "Type",
        render: (_, row) => (
          <Chip
            size="small"
            label={row.type}
            sx={{
              height: 22,
              fontWeight: 700,
              borderColor:
                row.type === "External"
                  ? alpha(theme.app.dashboard.accentRedLight, 0.55)
                  : alpha(theme.app.dashboard.accentGreenLight, 0.55),
              color: row.type === "External" ? theme.app.dashboard.accentRedLight : theme.app.dashboard.accentGreenLight,
              bgcolor: "transparent",
            }}
            variant="outlined"
          />
        ),
      },
      {
        id: "resellerName",
        label: "Reseller",
        cellVariant: "muted",
        render: (_, row) => (row.type === "Internal" ? "—" : row.resellerName || "—"),
      },
      {
        id: "parentCompanyName",
        label: "Parent",
        cellVariant: "muted",
        render: (_, row) => (row.type === "Internal" ? "—" : row.parentCompanyName || "—"),
      },
    ],
    [theme],
  );

  const panelSx = useMemo(
    () => ({
      borderRadius: "10px",
      border: `1px solid ${theme.palette.divider}`,
      bgcolor:
        theme.palette.mode === "light"
          ? alpha(theme.palette.common.black, 0.03)
          : alpha(theme.app.dashboard.white95, 0.06),
      overflow: "visible" as const,
    }),
    [theme],
  );

  const toolbarSx = {
    px: { xs: 1.5, sm: 2 },
    py: 1.25,
    display: "flex",
    flexWrap: "wrap" as const,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 1.5,
    borderBottom: `1px solid ${theme.palette.divider}`,
    bgcolor: alpha(theme.palette.divider, theme.palette.mode === "light" ? 0.35 : 0.2),
  };

  return (
    <FormModal
      open={open}
      title="Add user shift"
      description="Choose a user, then shift and dates — all steps stay in this dialog."
      onClose={onClose}
      onSave={onSave}
      primaryButtonLabel={isSaving ? "Saving…" : "Assign"}
      primaryButtonDisabled={isSaving}
      cancelButtonLabel="Close"
      maxWidth={960}
      fitContent
    >
      {/* User picker: single SaaS-style surface (toolbar + table + summary inside one frame) */}
      <Box sx={panelSx}>
        <Box sx={{ px: { xs: 1.5, sm: 2 }, pt: 1.5, pb: 1 }}>
          <Typography variant="medium" fontWeight={700} sx={{ color: theme.palette.text.primary }}>
            Users
          </Typography>
          <Typography variant="caption" sx={{ display: "block", mt: 0.35, color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}>
            Type filter matches the list when you open this dialog. A selected user only appears if their type matches the filter (pick All to see everyone in scope).
          </Typography>
        </Box>

        <Box sx={toolbarSx}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                letterSpacing: "0.06em",
                color: theme.palette.text.secondary,
              }}
            >
              Type
            </Typography>
            <Chip
              size="small"
              label="All"
              clickable
              onClick={() => setTypeFilter("all")}
              color={typeFilter === "all" ? "primary" : "default"}
              variant={typeFilter === "all" ? "filled" : "outlined"}
            />
            {showInternalUserTypeFilter ? (
              <Chip
                size="small"
                label="Internal"
                clickable
                onClick={() => setTypeFilter("Internal")}
                color={typeFilter === "Internal" ? "primary" : "default"}
                variant={typeFilter === "Internal" ? "filled" : "outlined"}
              />
            ) : null}
            <Chip
              size="small"
              label="External"
              clickable
              onClick={() => setTypeFilter("External")}
              color={typeFilter === "External" ? "primary" : "default"}
              variant={typeFilter === "External" ? "filled" : "outlined"}
            />
          </Box>
          <Box sx={{ flex: "1 1 220px", minWidth: 0, maxWidth: { xs: "100%", sm: 380 } }}>
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search name, email, reseller, parent…"
            />
          </Box>
        </Box>

        <DataTable<TableUserRow>
          columns={columns}
          rows={tableRowsFull}
          isLoading={usersLoading}
          loadingRowCount={MODAL_USER_TABLE_LOADING_ROWS}
          getRowId={(row) => row.id}
          selectedRowId={userId.trim() || null}
          onRowClick={(row) => onUserIdChange(row.id)}
          minWidth={720}
          size="small"
          scrollY
          containerSx={{
            maxHeight: { xs: 380, sm: 420 },
            overflowX: "auto",
            overflowY: "auto",
            borderRadius: 0,
            scrollbarWidth: "thin",
            msOverflowStyle: "auto",
            "&::-webkit-scrollbar": {
              display: "block",
              width: 10,
              height: 10,
            },
          }}
          emptyState={{
            title: "No users to show",
            description: usersLoading
              ? "Loading users…"
              : users.length === 0
                ? "Load users from the sidebar filters first, or adjust filters in this panel."
                : "No users match the current filters in this panel.",
          }}
        />

        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            py: 1,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.divider, theme.palette.mode === "light" ? 0.25 : 0.15),
          }}
        >
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            {usersLoading
              ? "Loading…"
              : `${tableRowsFull.length} shown · ${users.length} in scope`}
          </Typography>
          {userId.trim() && selectedUserMeta ? (
            <Typography variant="caption" sx={{ color: theme.palette.text.primary, fontWeight: 600, maxWidth: "100%" }} noWrap>
              Selected: {selectedUserMeta.name} ({selectedUserMeta.type})
            </Typography>
          ) : (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              No user selected
            </Typography>
          )}
        </Box>

        {selectedUserMeta ? (
          <Box
            sx={{
              px: { xs: 1.5, sm: 2 },
              py: 1.25,
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.action.hover,
            }}
          >
            <Typography variant="caption" sx={{ display: "block", mb: 0.75, color: theme.palette.text.secondary, fontWeight: 700 }}>
              Selection detail
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
              {selectedUserMeta.name} ({selectedUserMeta.type})
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mt: 0.35 }}>
              {selectedUserMeta.email}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
              Department: {selectedUserMeta.departmentName} · Designation: {selectedUserMeta.designationName}
            </Typography>
            {selectedUserMeta.type === "External" ? (
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mt: 0.35 }}>
                Reseller: {selectedUserMeta.resellerName} · Parent: {selectedUserMeta.parentCompanyName}
              </Typography>
            ) : null}
          </Box>
        ) : null}
      </Box>

      {/* Assignment: second inset panel */}
      <Box sx={{ ...panelSx, mt: 2 }}>
        <Box sx={{ px: { xs: 1.5, sm: 2 }, pt: 1.5, pb: 1 }}>
          <Typography variant="medium" fontWeight={700} sx={{ color: theme.palette.text.primary }}>
            Shift & schedule
          </Typography>
          <Typography variant="caption" sx={{ display: "block", mt: 0.35, color: theme.app.dashboard.textMuted }}>
            Template and effective range for this assignment.
          </Typography>
        </Box>
        <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
          <SelectField
            label="Shift"
            value={shiftId}
            onChange={onShiftIdChange}
            options={shiftOptions}
            searchable
            searchPlaceholder="Search shift…"
            menuMaxRows={7}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            <InputField
              label="Effective from"
              type="date"
              value={effectiveFrom}
              onChange={(e) => onEffectiveFromChange(e.target.value)}
            />
            <InputField
              label="Effective to"
              type="date"
              value={effectiveTo}
              onChange={(e) => onEffectiveToChange(e.target.value)}
            />
          </Box>
        </Box>
        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            py: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.divider, theme.palette.mode === "light" ? 0.25 : 0.15),
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mb: 1,
              fontWeight: 800,
              letterSpacing: "0.06em",
              color: theme.palette.text.secondary,
            }}
          >
            Weekly pattern override
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={assignOverrideWeek}
                onChange={(e) => onAssignOverrideWeekChange(e.target.checked)}
                disabled={isSaving}
                size="small"
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                  Use custom working days
                </Typography>
                <Typography variant="caption" sx={{ display: "block", color: theme.app.dashboard.textMuted, mt: 0.25, lineHeight: 1.45 }}>
                  Leave off to inherit the shift template. Turn on to send an explicit mask with this assignment.
                </Typography>
              </Box>
            }
            sx={{ alignItems: "flex-start", ml: 0, mr: 0, mb: assignOverrideWeek ? 1 : 0 }}
          />
          {assignOverrideWeek ? (
            <WorkingWeekDayToggles
              value={assignWorkingMask}
              onChange={onAssignWorkingMaskChange}
              disabled={isSaving}
            />
          ) : null}
        </Box>
      </Box>
    </FormModal>
  );
}
