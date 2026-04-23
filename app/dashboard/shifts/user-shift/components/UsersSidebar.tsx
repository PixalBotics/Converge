"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, SearchBar, SelectField, TablePagination, Typography } from "@/components/common";
import { rolesCard, rolesPaginationWrapper } from "@/app/dashboard/roles/roles.styles";

export type UserType = "Internal" | "External";

export type UserListRow = {
  id: string;
  name: string;
  email: string;
  type: UserType;
  resellerId: string;
  parentCompanyId: string;
};

export type UsersSidebarProps = {
  users: UserListRow[];
  selectedUserId: string;
  onSelectUserId: (id: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
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
};

export function UsersSidebar({
  users,
  selectedUserId,
  onSelectUserId,
  search,
  onSearchChange,
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
}: UsersSidebarProps) {
  const theme = useTheme() as AppTheme;
  const internalUsers = users.filter((u) => u.type === "Internal");
  const externalUsers = users.filter((u) => u.type === "External");

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
          border: "1px solid rgba(255,255,255,0.06)",
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
          primary={
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Typography variant="body2" sx={{ color: "white", fontWeight: 650 }} noWrap>
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
                    Reseller: {u.resellerId}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }} noWrap>
                    Parent Co: {u.parentCompanyId}
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
      <Typography variant="mediumLarge" fontWeight={700} color="white" sx={{ mb: 1 }}>
        Users
      </Typography>
      <SearchBar value={search} onChange={onSearchChange} placeholder="Search user (name/email)..." />
      <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip
          size="small"
          label="All"
          clickable
          onClick={() => onTypeFilterChange("all")}
          color={typeFilter === "all" ? "primary" : "default"}
          variant={typeFilter === "all" ? "filled" : "outlined"}
        />
        <Chip
          size="small"
          label="Internal"
          clickable
          onClick={() => onTypeFilterChange("Internal")}
          color={typeFilter === "Internal" ? "primary" : "default"}
          variant={typeFilter === "Internal" ? "filled" : "outlined"}
        />
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
        <Box sx={{ mt: 1.25, display: "grid", gap: 1 }}>
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
          <SelectField
            label="Department"
            value={departmentId}
            onChange={onDepartmentIdChange}
            options={departmentOptions}
            menuMaxRows={7}
            disabled={!parentCompanyId.trim() || isDepartmentsLoading}
          />
          {!externalScopeReady ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              Select reseller, parent company, and department to load external users.
            </Typography>
          ) : null}
        </Box>
      ) : typeFilter === "Internal" ? (
        <Box sx={{ mt: 1.25, display: "grid", gap: 1 }}>
          <SelectField
            label="Department"
            value={departmentId}
            onChange={onDepartmentIdChange}
            options={departmentOptions}
            menuMaxRows={7}
            disabled={isDepartmentsLoading}
          />
          {!internalScopeReady ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              Select department to load internal users.
            </Typography>
          ) : null}
        </Box>
      ) : null}
      <Box sx={{ mt: 1.25, mb: 1, borderTop: "1px solid rgba(255,255,255,0.08)" }} />

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
                  ? "Select external filters first."
                  : typeFilter === "Internal" && !internalScopeReady
                    ? "Select department first."
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

