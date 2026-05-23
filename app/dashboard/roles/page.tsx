"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Person as PersonIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { AddCircleIcon, SearchIcon } from "@/components/common/icons";
import {
  Typography,
  DashboardCard,
  DataTable,
  dataTableActionButton,
  Button,
  SearchBar,
  TablePagination,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { useRolesListQuery, useSoftDeleteRoleMutation } from "@/lib/hooks";
import {
  rolesPageWrapper,
  rolesHeader,
  rolesAddButtonWrapper,
  rolesAddButton,
  rolesCard,
  rolesCardHeader,
  rolesIconBox,
  rolesFooterRow,
  rolesPaginationWrapper,
} from "./roles.styles";
import { DeleteRoleConfirmModal } from "./components/DeleteRoleConfirmModal";
import { RoleModal } from "./components/RoleModal";
import { extractRolesLimit, extractRolesRows, extractRolesTotal, extractRolesTotalPages, type RoleRow } from "./utils";
import { useAuth } from "@/lib/auth";
import { canRoleAction } from "@/lib/permissions";

export default function RolesPage() {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canMutateRoles = canRoleAction(hasOperational);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [roleFormOpen, setRoleFormOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<RoleRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoleRow | null>(null);

  const rolesQuery = useRolesListQuery(
    {
      page,
      limit: 20,
      ...(search.trim() ? { search: search.trim() } : {}),
    },
    { enabled: true },
  );

  const softDeleteRoleMutation = useSoftDeleteRoleMutation();

  const rows = useMemo(() => extractRolesRows(rolesQuery.data), [rolesQuery.data]);
  const totalEntries = useMemo(() => extractRolesTotal(rolesQuery.data), [rolesQuery.data]);
  const pageCount = useMemo(() => extractRolesTotalPages(rolesQuery.data), [rolesQuery.data]);
  const pageLimit = useMemo(() => extractRolesLimit(rolesQuery.data) ?? 20, [rolesQuery.data]);

  useEffect(() => {
    // Clear applied search when SearchBar cross is used.
    if (searchInput.trim().length > 0) return;
    if (!search.trim()) return;
    setSearch("");
    setPage(1);
  }, [searchInput, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const columns = useMemo<DataTableColumn<RoleRow>[]>(
    () => [
      { id: "name", label: "Role name" },
      {
        id: "userCount",
        label: "Users",
        render: (value) => {
          const n = Number(value);
          return Number.isFinite(n) ? String(n) : "—";
        },
      },
    ],
    []
  );

  const start = rows.length > 0 ? (page - 1) * pageLimit + 1 : 0;
  const end = (page - 1) * pageLimit + rows.length;
  const isLoading = rolesQuery.isLoading || rolesQuery.isFetching;

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
        {canMutateRoles ? (
          <Box sx={rolesAddButtonWrapper}>
            <Button
              variant="primary"
              sx={rolesAddButton}
              onClick={() => {
                setRoleToEdit(null);
                setRoleFormOpen(true);
              }}
            >
              <AddCircleIcon width={16} height={16} />
              <Typography component="span" variant="medium" sx={{ color: "inherit" }}>
                Add New Role
              </Typography>
            </Button>
          </Box>
        ) : null}
      </Box>

      <RoleModal
        open={roleFormOpen}
        onClose={() => setRoleFormOpen(false)}
        editRole={roleToEdit}
        onSaved={() => {
          // Ensure list refreshes after save.
          void rolesQuery.refetch();
        }}
      />

      <DeleteRoleConfirmModal
        open={deleteTarget != null}
        roleName={deleteTarget?.name ?? ""}
        onDismiss={() => {
          if (!softDeleteRoleMutation.isPending) setDeleteTarget(null);
        }}
        onConfirm={() => {
          const id = deleteTarget?.id?.trim();
          if (!id) return;
          softDeleteRoleMutation.mutate(id, {
            onSuccess: () => {
              setDeleteTarget(null);
            },
          });
        }}
        isDeleting={softDeleteRoleMutation.isPending}
      />

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
              Roles
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1.25,
              alignItems: "center",
              width: { xs: "100%", md: "min(100%, 520px)" },
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <SearchBar value={searchInput} onChange={setSearchInput} placeholder="Search roles…" sx={{ width: "100%" }} />
            </Box>
            <Button
              type="button"
              variant="primary"
              disabled={searchInput.trim() === search.trim()}
              onClick={() => setSearch(searchInput)}
              sx={{ minWidth: 132, whiteSpace: "nowrap" }}
            >
              <Box component="span" sx={{ display: "inline-flex", lineHeight: 0 }}>
                <SearchIcon width={18} height={18} sx={{ color: "inherit" }} />
              </Box>
              Search
            </Button>
          </Box>
        </Box>

        <DataTable<RoleRow>
          columns={columns}
          rows={rows}
          isLoading={isLoading}
          getRowId={(row) => row.id}
          minWidth={800}
          tableSx={{
            tableLayout: "fixed",
            "& th:nth-of-type(1), & td:nth-of-type(1)": { width: "70%", whiteSpace: "normal", wordBreak: "break-word" },
            "& th:nth-of-type(2), & td:nth-of-type(2)": { width: "15%" },
            "& th:nth-of-type(3), & td:nth-of-type(3)": { width: "15%", textAlign: "right" },
          }}
          actionColumn={{
            label: "Action",
            render: (row) => {
              const rowId = row.id?.trim() ?? "";
              const isDeletingThis =
                softDeleteRoleMutation.isPending &&
                softDeleteRoleMutation.variables === rowId;
              return (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                  <IconButton
                    size="small"
                    aria-label="Edit role"
                    disabled={!rowId || !canMutateRoles}
                    onClick={() => {
                      if (!rowId || !canMutateRoles) return;
                      setRoleToEdit(row);
                      setRoleFormOpen(true);
                    }}
                    sx={{ ...dataTableActionButton, color: theme.app.dashboard.white80 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="Delete role"
                    disabled={!rowId || isDeletingThis || !canMutateRoles}
                    onClick={() => {
                      if (!rowId || !canMutateRoles) return;
                      setDeleteTarget(row);
                    }}
                    sx={{
                      ...dataTableActionButton,
                      color: theme.app.dashboard.accentRedLight,
                      opacity: !rowId ? 0.35 : 1,
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              );
            },
          }}
        />

        <Box sx={rolesFooterRow}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            {isLoading
              ? "Loading roles..."
              : rolesQuery.isError
                ? "Could not load roles."
                : `Showing data ${start} to ${end} of ${totalEntries} entries`}
          </Typography>
          <Box sx={rolesPaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
}
