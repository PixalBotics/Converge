"use client";

import { useMemo, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { MoreHoriz as MoreHorizIcon, Person as PersonIcon } from "@mui/icons-material";
import { AddCircleIcon } from "@/components/dashboard/icons/AddCircleIcon";
import {
  Typography,
  DashboardCard,
  DataTable,
  dataTableActionButton,
  Button,
  SearchBar,
  FilterButton,
  TablePagination,
  FormModal,
  InputField,
  SelectField,
  Checkbox,
  Divider,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import {
  rolesPageWrapper,
  rolesHeader,
  rolesAddButtonWrapper,
  rolesAddButton,
  rolesCard,
  rolesCardHeader,
  rolesIconBox,
  rolesSearchRow,
  rolesSearchFieldWrapper,
  rolesFooterRow,
  rolesPaginationWrapper,
} from "./roles.styles";

const PERMISSION_CATEGORIES: { title: string; permissions: { id: string; label: string }[] }[] = [
  {
    title: "User Management",
    permissions: [
      { id: "view-users", label: "View Users" },
      { id: "create-user", label: "Create User" },
      { id: "edit-user", label: "Edit User" },
      { id: "delete-user", label: "Delete User" },
    ],
  },
  {
    title: "Department Management",
    permissions: [
      { id: "create-department", label: "Create Department" },
      { id: "edit-department", label: "Edit Department" },
    ],
  },
  {
    title: "Chat Operations",
    permissions: [
      { id: "handle-chat", label: "Handle Chat" },
      { id: "takeover-chat", label: "Takeover Chat" },
      { id: "whisper", label: "Whisper (Internal notes)" },
      { id: "transfer-chat", label: "Transfer Chat" },
      { id: "close-chat", label: "Close Chat" },
    ],
  },
  {
    title: "Department Management",
    permissions: [{ id: "quality-assurance", label: "Quality Assurance" }],
  },
  {
    title: "Company & Billing",
    permissions: [
      { id: "manage-company-info", label: "Manage Company Info" },
      { id: "manage-website-widgets", label: "Manage Website Widgets" },
    ],
  },
];

const ALL_PERMISSION_IDS = PERMISSION_CATEGORIES.flatMap((c) => c.permissions.map((p) => p.id));

interface RoleRow extends Record<string, unknown> {
  departmentsName: string;
  roleType: "Platform" | "Department";
  linkedDepartment: string;
  totalUsers: string;
}

const ROLES_DATA: RoleRow[] = [
  { departmentsName: "Super Admin", roleType: "Platform", linkedDepartment: "-", totalUsers: "3 User" },
  { departmentsName: "Support Manager", roleType: "Department", linkedDepartment: "Customer Support", totalUsers: "3 User" },
  { departmentsName: "Chat Agent", roleType: "Department", linkedDepartment: "-", totalUsers: "3 User" },
  { departmentsName: "QA Analyst", roleType: "Platform", linkedDepartment: "-", totalUsers: "3 User" },
  { departmentsName: "Super Admin", roleType: "Platform", linkedDepartment: "-", totalUsers: "3 User" },
  { departmentsName: "Support Manager", roleType: "Department", linkedDepartment: "Customer Support", totalUsers: "3 User" },
  { departmentsName: "Chat Agent", roleType: "Department", linkedDepartment: "-", totalUsers: "3 User" },
  { departmentsName: "QA Analyst", roleType: "Platform", linkedDepartment: "-", totalUsers: "3 User" },
];

const initialPermissions: Record<string, boolean> = Object.fromEntries(
  ALL_PERMISSION_IDS.map((id) => [id, false])
);

export default function RolesPage() {
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageCount = 3;
  const totalEntries = "256K";
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleType, setRoleType] = useState("Platform");
  const [linkedDepartment, setLinkedDepartment] = useState("");
  const [permissions, setPermissions] = useState<Record<string, boolean>>(initialPermissions);

  const allSelected = useMemo(
    () => ALL_PERMISSION_IDS.every((id) => permissions[id]),
    [permissions]
  );
  const handleSelectAll = useCallback(() => {
    const next = !allSelected;
    setPermissions((prev) => ({
      ...prev,
      ...Object.fromEntries(ALL_PERMISSION_IDS.map((id) => [id, next])),
    }));
  }, [allSelected]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return ROLES_DATA;
    return ROLES_DATA.filter(
      (row) =>
        row.departmentsName.toLowerCase().includes(query) ||
        row.roleType.toLowerCase().includes(query) ||
        row.linkedDepartment.toLowerCase().includes(query) ||
        row.totalUsers.toLowerCase().includes(query)
    );
  }, [search]);

  const columns = useMemo<DataTableColumn<RoleRow>[]>(
    () => [
      { id: "departmentsName", label: "Departments Name", cellVariant: "default" },
      {
        id: "roleType",
        label: "Role Type",
        render: (value) => (
          <Box
            component="span"
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 500,
              bgcolor: String(value) === "Platform" ? theme.app.dashboard.blueTintBg : theme.app.dashboard.pinkTintBg,
              color: String(value) === "Platform" ? theme.app.dashboard.blueTint : theme.app.dashboard.accentPinkLight,
            }}
          >
            {String(value ?? "—")}
          </Box>
        ),
      },
      { id: "linkedDepartment", label: "Linked Department", cellVariant: "muted" },
      { id: "totalUsers", label: "Total Users", cellVariant: "muted" },
    ],
    [theme]
  );

  const start = (page - 1) * 8 + 1;
  const end = Math.min(page * 8, filteredRows.length);

  return (
    <Box sx={rolesPageWrapper}>
      <Box sx={rolesHeader}>
        <Typography
          variant="regularLarge"
          fontWeight={700}
          sx={{ color: theme.app.text.primary }}
        >
          Roles
        </Typography>
        <Box sx={rolesAddButtonWrapper}>
          <Button variant="primary" sx={rolesAddButton} onClick={() => setIsAddRoleOpen(true)}>
            <AddCircleIcon width={16} height={16} />
            <Typography
              component="span"
              variant="medium"
              sx={{ color: theme.app.text.primary }}
            >
              Add New Role
            </Typography>
          </Button>
        </Box>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={rolesCardHeader}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={rolesIconBox}>
              <PersonIcon sx={{ fontSize: 20, color: theme.app.dashboard.iconMuted }} />
            </Box>
            <Typography
              variant="mediumLarge"
              fontWeight={600}
              sx={{ color: theme.app.text.primary }}
            >
              Departments
            </Typography>
          </Box>
          <Box sx={rolesSearchRow}>
            <Box sx={rolesSearchFieldWrapper}>
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search anything..."
                sx={{ minWidth: "100%" }}
              />
            </Box>
            <FilterButton sx={{ whiteSpace: "nowrap" }} />
          </Box>
        </Box>

        <DataTable<RoleRow>
          columns={columns}
          rows={filteredRows}
          getRowId={(row, idx) => `${row.departmentsName}-${row.roleType}-${idx}`}
          minWidth={800}
          actionColumn={{
            label: "Action",
            render: () => (
              <IconButton size="small" sx={dataTableActionButton}>
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            ),
          }}
        />

        <Box sx={rolesFooterRow}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            Showing data {start} to {end} of {totalEntries} entries
          </Typography>
          <Box sx={rolesPaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>

      <FormModal
        open={isAddRoleOpen}
        title="Create New Role"
        description="Define role details and granular permissions."
        onClose={() => setIsAddRoleOpen(false)}
        onSave={() => setIsAddRoleOpen(false)}
        sx={{ maxWidth: 720 }}
      >
        <InputField
          label="Role Name"
          placeholder="Role Name"
          value={roleName}
          onChange={(e) => setRoleName((e.target as HTMLInputElement).value)}
        />
        <SelectField
          label="Role Type"
          value={roleType}
          onChange={setRoleType}
          options={[
            { label: "Platform", value: "Platform" },
            { label: "Department", value: "Department" },
          ]}
        />
        <SelectField
          label="Linked Department"
          value={linkedDepartment}
          onChange={setLinkedDepartment}
          options={[
            { label: "Linked Department", value: "" },
            { label: "Customer Support", value: "Customer Support" },
            { label: "Engineering", value: "Engineering" },
          ]}
        />
        <Box sx={{ mt: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
            }}
          >
            <Typography
              variant="medium"
              fontWeight={600}
              sx={{ color: theme.app.text.primary }}
            >
              Permissions
            </Typography>
            <Box
              component="button"
              type="button"
              onClick={handleSelectAll}
              sx={{
                color: theme.app.dashboard.textMuted95,
                cursor: "pointer",
                background: "none",
                border: "none",
                textDecoration: "underline",
                fontSize: 14,
                fontFamily: "inherit",
                "&:hover": { color: theme.app.text.primary },
              }}
            >
              Select All
            </Box>
          </Box>
          <Divider />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 1.5,
            }}
          >
            {PERMISSION_CATEGORIES.map((category, idx) => (
              <Box
                key={`${category.title}-${idx}`}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  background: theme.app.dashboard.glassGradient,
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  boxShadow: theme.app.dashboard.glassShadow,
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: theme.app.text.primary, mb: 1, fontSize: 13 }}
                >
                  {category.title}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {category.permissions.map((perm) => (
                    <Box
                      key={perm.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Checkbox
                        checked={!!permissions[perm.id]}
                        onChange={(_, checked) =>
                          setPermissions((p) => ({ ...p, [perm.id]: checked }))
                        }
                        sx={{
                          color: theme.app.dashboard.white7,
                          "&.Mui-checked": { color: theme.app.dashboard.accentGreen },
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: theme.app.text.primary, fontSize: 13 }}
                      >
                        {perm.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </FormModal>
    </Box>
  );
}
