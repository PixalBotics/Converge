"use client";

import { useCallback, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  SearchBar,
  SelectField,
  TablePagination,
  ToolbarFilterPopover,
  ToolbarFilterPopoverPanel,
  Typography,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesCard, rolesPaginationWrapper } from "@/app/dashboard/roles/roles.styles";
import { HRMS_SHIFTS_LIST_SEARCH_MAX } from "@/lib/utils/hrms";
import {
  userShiftFilterPopoverPairRowSx,
  userShiftFilterPopoverStackSx,
  userShiftUsersSearchActionsSx,
  userShiftUsersSearchColumnSx,
  userShiftUsersSearchFieldSx,
} from "../user-shift.styles";

export type UserType = "Internal" | "External";

export type UserListRow = {
  id: string;
  name: string;
  email: string;
  type: UserType;
  resellerId: string;
  parentCompanyId: string;
  resellerName: string;
  parentCompanyName: string;
};

export type UsersSidebarProps = {
  users: UserListRow[];
  selectedUserId: string;
  onSelectUserId: (id: string) => void;
  searchDraft: string;
  onSearchDraftChange: (value: string) => void;
  onSearchApply: () => void;
  searchApplyDisabled: boolean;
  searchApplied: string;
  page: number;
  pageCount: number;
  totalLabel: string;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  typeFilter: "all" | UserType;
  onTypeFilterChange: (value: "all" | UserType) => void;
  resellerId: string;
  onResellerIdChange: (value: string) => void;
  resellerOptions: Array<{ value: string; label: string }>;
  isResellersLoading?: boolean;
  parentCompanyId: string;
  onParentCompanyIdChange: (value: string) => void;
  parentCompanyOptions: Array<{ value: string; label: string }>;
  isParentCompaniesLoading?: boolean;
  departmentId: string;
  onDepartmentIdChange: (value: string) => void;
  departmentOptions: Array<{ value: string; label: string }>;
  isDepartmentsLoading?: boolean;
  externalScopeReady?: boolean;
  internalScopeReady?: boolean;
  /** When false, Internal chip is hidden (external non–platform-admin sessions). */
  showInternalTypeCapsule?: boolean;
  /** Reset type, scope, and search to defaults (same as pool / department shift “Clear filters”). */
  onClearFilters: () => void;
};

export function UsersSidebar({
  users,
  selectedUserId,
  onSelectUserId,
  searchDraft,
  onSearchDraftChange,
  onSearchApply,
  searchApplyDisabled,
  searchApplied,
  page,
  pageCount,
  totalLabel,
  onPageChange,
  isLoading,
  typeFilter,
  onTypeFilterChange,
  resellerId,
  onResellerIdChange,
  resellerOptions,
  isResellersLoading = false,
  parentCompanyId,
  onParentCompanyIdChange,
  parentCompanyOptions,
  isParentCompaniesLoading = false,
  departmentId,
  onDepartmentIdChange,
  departmentOptions,
  isDepartmentsLoading = false,
  externalScopeReady = false,
  internalScopeReady = false,
  showInternalTypeCapsule = true,
  onClearFilters,
}: UsersSidebarProps) {
  const theme = useTheme() as AppTheme;
  const [filterOpen, setFilterOpen] = useState(false);

  const internalUsers = users.filter((u) => u.type === "Internal");
  const externalUsers = users.filter((u) => u.type === "External");

  const filterHint = useMemo(() => {
    if (typeFilter === "External" && externalScopeReady) return "External list uses reseller → parent company → department, then GET /users with that scope.";
    if (typeFilter === "External") return "Pick reseller, parent company, and department to load external users.";
    if (typeFilter === "Internal" && internalScopeReady) return "Internal list is filtered by the selected department.";
    if (typeFilter === "Internal") return "Pick a department to load internal users.";
    return "All: both internal and external users for the current page (API scope). Open Filter to narrow.";
  }, [typeFilter, externalScopeReady, internalScopeReady]);

  const filterActive = useMemo(
    () =>
      typeFilter !== "all" ||
      Boolean(resellerId.trim()) ||
      Boolean(parentCompanyId.trim()) ||
      Boolean(departmentId.trim()) ||
      Boolean(searchDraft.trim()) ||
      Boolean(searchApplied.trim()),
    [typeFilter, resellerId, parentCompanyId, departmentId, searchDraft, searchApplied],
  );

  const filterClearDisabled = useMemo(
    () =>
      typeFilter === "all" &&
      !resellerId.trim() &&
      !parentCompanyId.trim() &&
      !departmentId.trim() &&
      !searchDraft.trim() &&
      !searchApplied.trim(),
    [typeFilter, resellerId, parentCompanyId, departmentId, searchDraft, searchApplied],
  );

  const handleClearFilters = useCallback(() => {
    onClearFilters();
    setFilterOpen(false);
  }, [onClearFilters]);

  const userListFilterPanel = useMemo(() => {
    return (
      <ToolbarFilterPopoverPanel
        footer={
          <>
            <Button type="button" variant="secondary" disabled={filterClearDisabled} onClick={handleClearFilters}>
              Clear filters
            </Button>
            <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={() => setFilterOpen(false)}>
              Done
            </Button>
          </>
        }
      >
        <Typography variant="medium" fontWeight={700} sx={{ color: theme.palette.text.primary, mb: 1.5 }}>
          Filters
        </Typography>
        <Box sx={userShiftFilterPopoverStackSx}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Chip
                size="small"
                label="All"
                clickable
                onClick={() => onTypeFilterChange("all")}
                color={typeFilter === "all" ? "primary" : "default"}
                variant={typeFilter === "all" ? "filled" : "outlined"}
              />
              {showInternalTypeCapsule ? (
                <Chip
                  size="small"
                  label="Internal"
                  clickable
                  onClick={() => onTypeFilterChange("Internal")}
                  color={typeFilter === "Internal" ? "primary" : "default"}
                  variant={typeFilter === "Internal" ? "filled" : "outlined"}
                />
              ) : null}
              <Chip
                size="small"
                label="External"
                clickable
                onClick={() => onTypeFilterChange("External")}
                color={typeFilter === "External" ? "primary" : "default"}
                variant={typeFilter === "External" ? "filled" : "outlined"}
              />
            </Box>
            {typeFilter === "External" ? (
              <Box sx={userShiftFilterPopoverPairRowSx}>
                <SelectField
                  label="Reseller"
                  value={resellerId}
                  onChange={onResellerIdChange}
                  options={resellerOptions}
                  menuMaxRows={7}
                  disabled={isResellersLoading}
                />
                <SelectField
                  label="Parent Company"
                  value={parentCompanyId}
                  onChange={onParentCompanyIdChange}
                  options={parentCompanyOptions}
                  menuMaxRows={7}
                  disabled={!resellerId.trim() || isParentCompaniesLoading}
                />
              </Box>
            ) : null}
            {typeFilter === "External" ? (
              <SelectField
                label="Department"
                value={departmentId}
                onChange={onDepartmentIdChange}
                options={departmentOptions}
                menuMaxRows={7}
                disabled={!parentCompanyId.trim() || isDepartmentsLoading}
              />
            ) : null}
            {typeFilter === "Internal" ? (
              <SelectField
                label="Department"
                value={departmentId}
                onChange={onDepartmentIdChange}
                options={departmentOptions}
                menuMaxRows={7}
                disabled={isDepartmentsLoading}
              />
            ) : null}
          </Box>
          <Typography
            variant="body2"
            sx={{
              mt: 1.5,
              color: theme.app.dashboard.textMuted,
              alignSelf: "stretch",
              whiteSpace: "normal",
              lineHeight: 1.5,
            }}
          >
            {filterHint}
          </Typography>
      </ToolbarFilterPopoverPanel>
    );
  }, [
    theme,
    typeFilter,
    showInternalTypeCapsule,
    onTypeFilterChange,
    resellerId,
    onResellerIdChange,
    resellerOptions,
    isResellersLoading,
    parentCompanyId,
    onParentCompanyIdChange,
    parentCompanyOptions,
    isParentCompaniesLoading,
    departmentId,
    onDepartmentIdChange,
    departmentOptions,
    isDepartmentsLoading,
    filterHint,
    filterClearDisabled,
    handleClearFilters,
  ]);

  const renderUserRow = (u: UserListRow) => {
    const selected = u.id === selectedUserId;
    return (
      <ListItemButton
        key={u.id}
        selected={selected}
        onClick={() => onSelectUserId(u.id)}
        sx={{
          borderRadius: 2,
          mb: 0.5,
          border: `1px solid ${theme.palette.divider}`,
          "&.Mui-selected": {
            background: "rgba(88,101,242,0.18)",
            borderColor: "rgba(88,101,242,0.4)",
          },
          "&.Mui-selected:hover": {
            background: "rgba(88,101,242,0.22)",
          },
        }}
      >
        <ListItemText
          secondaryTypographyProps={{ component: "div" }}
          primary={
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 650 }} noWrap>
                {u.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: u.type === "External" ? theme.app.dashboard.accentRedLight : theme.app.dashboard.accentGreenLight,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {u.type}
              </Typography>
            </Box>
          }
          secondary={
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, mt: 0.25 }}>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }} noWrap>
                {u.email}
              </Typography>
              {u.type === "External" ? (
                <>
                  <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }} noWrap>
                    Reseller: {u.type === "External" ? u.resellerName : "—"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }} noWrap>
                    Parent: {u.type === "External" ? u.parentCompanyName : "—"}
                  </Typography>
                </>
              ) : null}
            </Box>
          }
        />
      </ListItemButton>
    );
  };

  return (
    <DashboardCard sx={{ ...rolesCard, p: { xs: 1.25, sm: 1.5, md: 1.75 } }}>
      <Typography variant="mediumLarge" fontWeight={700} sx={{ mb: 0.5, color: "text.primary" }}>
        Users
      </Typography>
      <Typography variant="caption" sx={{ display: "block", mb: 1.25, color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
        Use <strong>Filter</strong> for type and scope. <strong>Search</strong> applies your text to the user list (API).
      </Typography>
      <Box sx={userShiftUsersSearchColumnSx}>
        <Box sx={userShiftUsersSearchFieldSx}>
          <SearchBar
            value={searchDraft}
            onChange={(v) => onSearchDraftChange(v.slice(0, HRMS_SHIFTS_LIST_SEARCH_MAX))}
            placeholder="Search name, email, company…"
          />
        </Box>
        <Box sx={userShiftUsersSearchActionsSx}>
          <Button
            type="button"
            variant="primary"
            disabled={searchApplyDisabled}
            onClick={onSearchApply}
            sx={{
              flexShrink: 0,
              alignSelf: { xs: "stretch", sm: "center" },
              minHeight: 40,
              px: 2.5,
              py: 1,
              whiteSpace: "nowrap",
              width: { xs: "100%", sm: "auto" },
              minWidth: { xs: 0, sm: 120 },
            }}
          >
            Search
          </Button>
          <Box sx={{ flexShrink: 0, display: "inline-flex", alignItems: "center" }}>
            <ToolbarFilterPopover open={filterOpen} onOpenChange={setFilterOpen} active={filterActive}>
              {userListFilterPanel}
            </ToolbarFilterPopover>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 1.25, mb: 1, borderTop: `1px solid ${theme.palette.divider}` }} />

      <Box sx={{ maxHeight: { xs: 360, lg: "calc(100vh - 320px)" }, overflow: "auto" }}>
        <List dense disablePadding>
          {(typeFilter === "all" || typeFilter === "Internal") && internalUsers.length > 0 ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, px: 0.5, py: 0.5, display: "block" }}>
              Internal ({internalUsers.length})
            </Typography>
          ) : null}
          {(typeFilter === "all" || typeFilter === "Internal") ? internalUsers.map(renderUserRow) : null}

          {(typeFilter === "all" || typeFilter === "External") && externalUsers.length > 0 ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, px: 0.5, py: 0.5, display: "block", mt: 0.5 }}>
              External ({externalUsers.length})
            </Typography>
          ) : null}
          {(typeFilter === "all" || typeFilter === "External") ? externalUsers.map(renderUserRow) : null}

          {users.length === 0 ? (
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
              {isLoading
                ? "Loading…"
                : typeFilter === "External" && !externalScopeReady
                  ? "Select external filters first (Filter button)."
                  : typeFilter === "Internal" && !internalScopeReady
                    ? "Select department first (Filter button)."
                    : "No users found."}
            </Typography>
          ) : null}
        </List>
      </Box>

      <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          {isLoading ? "Loading…" : totalLabel}
        </Typography>
        <Box sx={rolesPaginationWrapper}>
          <TablePagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
        </Box>
      </Box>
    </DashboardCard>
  );
}
