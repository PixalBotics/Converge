"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import {
  AttachMoney as AttachMoneyIcon,
  Login as LoginIcon,
  OpenInNew as OpenInNewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import NextLink from "next/link";
import {
  Typography,
  DashboardCard,
  DataTable,
  dataTableActionButton,
  TablePagination,
  DeleteUserConfirmModal,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { userIconPath } from "@/assets";
import { useAuth } from "@/lib/auth/AuthContext";
import type { AppTheme } from "@/theme/theme";
import { useLoginAsMutation, useSoftDeleteUserMutation } from "@/lib/hooks";
import type { FilterKind, UserRow, UserSuggestion } from "../types";
import { EmptyUsersState } from "./EmptyUsersState";
import { UserSearchToolbar } from "./UserSearchToolbar";
import {
  overviewTableCard,
  overviewTableCardHeader,
  overviewIconBox,
  overviewFooterRow,
  overviewPaginationWrapper,
} from "../overview.styles";

type Props = {
  theme: AppTheme;
  filterKind: FilterKind;
  setFilterKind: (v: FilterKind) => void;
  searchInput: string;
  setSearchInput: (v: string) => void;
  suggestions: UserSuggestion[];
  selectedSuggestion?: UserSuggestion;
  setSelectedSuggestion: (v: UserSuggestion | undefined) => void;
  isSuggestionsLoading: boolean;
  onSearch: () => void;
  rows: UserRow[];
  page: number;
  pageCount: number;
  onPageChange: (v: number) => void;
  totalEntries: number;
  onEditUser?: (userId: string) => void;
};

export function UsersTableSection(props: Props) {
  const {
    theme,
    filterKind,
    setFilterKind,
    searchInput,
    setSearchInput,
    suggestions,
    selectedSuggestion,
    setSelectedSuggestion,
    isSuggestionsLoading,
    onSearch,
    rows,
    page,
    pageCount,
    onPageChange,
    totalEntries,
    onEditUser,
  } = props;
  const { hasOperational, user: authUser } = useAuth();
  const loginAsMutation = useLoginAsMutation();
  const softDeleteUserMutation = useSoftDeleteUserMutation();
  const canUseLoginAs = hasOperational("user:login-as");
  const canDeleteUser = hasOperational("user:delete");
  const canEditUser = hasOperational("user:update") || hasOperational("user:edit");
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  const columns = useMemo<DataTableColumn<UserRow>[]>(
    () => [
      {
        id: "user",
        label: "User",
        render: (value, row) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              src={userIconPath}
              sx={{
                width: 32,
                height: 32,
                bgcolor: theme.app.dashboard.buttonIndigo,
                color: theme.app.text.primary,
                fontSize: 14,
              }}
            >
              {(String(row.user ?? "").charAt(0) || "U").toUpperCase()}
            </Avatar>
            <Typography component="span" variant="body2" color="white" fontWeight={500}>
              {String(value ?? "—")}
            </Typography>
          </Box>
        ),
      },
      { id: "email", label: "Email", cellVariant: "default" },
      {
        id: "type",
        label: "Type",
        render: (value) => (
          <Box
            component="span"
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 500,
              bgcolor:
                String(value) === "Internal"
                  ? theme.palette.mode === "light"
                    ? theme.app.dashboard.blueTintBg
                    : "rgba(59, 130, 246, 0.28)"
                  : theme.palette.mode === "light"
                    ? theme.app.dashboard.pinkTintBg
                    : "rgba(236, 72, 153, 0.24)",
              color:
                String(value) === "Internal"
                  ? theme.palette.mode === "light"
                    ? "#111827"
                    : "#FFFFFF"
                  : theme.palette.mode === "light"
                    ? "#111827"
                    : "#FFFFFF",
            }}
          >
            {String(value ?? "—")}
          </Box>
        ),
      },
      { id: "department", label: "Department", cellVariant: "default" },
      { id: "role", label: "Role", cellVariant: "default" },
      { id: "company", label: "Reseller", cellVariant: "default" },
    ],
    [theme, canEditUser, canUseLoginAs, canDeleteUser, authUser?.id, loginAsMutation, onEditUser],
  );

  const handleCloseDeleteModal = () => {
    if (softDeleteUserMutation.isPending) return;
    setDeleteTarget(null);
  };

  const handleConfirmDeleteUser = () => {
    const id = deleteTarget?.id?.trim();
    if (!id) return;
    softDeleteUserMutation.mutate(id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  };

  return (
    <DashboardCard sx={overviewTableCard}>
      <Box sx={overviewTableCardHeader}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={overviewIconBox}>
            <AttachMoneyIcon sx={{ fontSize: 20, color: "white" }} />
          </Box>
          <Typography variant="mediumLarge" color="white">
            Users
          </Typography>
        </Box>
        <UserSearchToolbar
          filterKind={filterKind}
          onFilterKindChange={setFilterKind}
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          suggestions={suggestions}
          selectedSuggestion={selectedSuggestion}
          setSelectedSuggestion={setSelectedSuggestion}
          isSuggestionsLoading={isSuggestionsLoading}
          onSearch={onSearch}
        />
      </Box>

      {rows.length === 0 ? (
        <EmptyUsersState />
      ) : (
        <DataTable<UserRow>
          columns={columns}
          rows={rows}
          getRowId={(row, idx) => `${row.user}-${row.email}-${idx}`}
          minWidth={1100}
          actionColumn={{
            label: "Action",
            render: (row) => {
              const canLoginAs = canUseLoginAs && !!row.id && !!row.licenseKey;
              const isPending = loginAsMutation.isPending
                && loginAsMutation.variables?.targetUserId === row.id;
              const licenseKey = row.licenseKey;
              const isSelf = Boolean(authUser?.id && row.id && authUser.id === row.id);
              const canOpenDelete =
                canDeleteUser && !!row.id && !isSelf;
              return (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 1 }}>
                  {row.id ? (
                    <Link
                      component={NextLink}
                      href={`/dashboard/user-page/user/${encodeURIComponent(row.id)}`}
                      sx={{
                        color: theme.palette.primary.main,
                        textDecoration: "none",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 600,
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Detail
                    </Link>
                  ) : (
                    <IconButton
                      size="small"
                      aria-label="User detail (unavailable)"
                      disabled
                      sx={{ ...dataTableActionButton, color: theme.app.dashboard.white80, opacity: 0.4 }}
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    aria-label="Login As"
                    disabled={!canLoginAs || isPending}
                    onClick={() => {
                      if (!licenseKey) return;
                      loginAsMutation.mutate({
                        targetUserId: row.id,
                        licenseKey,
                      }, {
                        onSuccess: () => {
                          window.location.assign("/dashboard");
                        },
                      });
                    }}
                    sx={{
                      ...dataTableActionButton,
                      color: theme.app.dashboard.accentBlue,
                      opacity: !canLoginAs ? 0.4 : (isPending ? 0.7 : 1),
                    }}
                  >
                    <LoginIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="Edit user"
                    disabled={!row.id || !onEditUser || !canEditUser}
                    onClick={() => {
                      if (row.id && onEditUser && canEditUser) onEditUser(row.id);
                    }}
                    sx={{
                      ...dataTableActionButton,
                      color: theme.app.dashboard.white80,
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label={canOpenDelete ? "Delete user" : "Delete user (unavailable)"}
                    disabled={!canOpenDelete}
                    onClick={() => {
                      if (!canOpenDelete) return;
                      setDeleteTarget(row);
                    }}
                    sx={{
                      ...dataTableActionButton,
                      color: theme.app.dashboard.accentRedLight,
                      opacity: !canOpenDelete ? 0.35 : 1,
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              );
            },
          }}
        />
      )}

      <Box sx={overviewFooterRow}>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
          Showing data 1 to {rows.length} of {totalEntries} entries
        </Typography>
        <Box sx={overviewPaginationWrapper}>
          <TablePagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
        </Box>
      </Box>

      {deleteTarget ? (
        <DeleteUserConfirmModal
          open
          displayName={String(deleteTarget.user ?? "")}
          email={String(deleteTarget.email ?? "")}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDeleteUser}
          isDeleting={softDeleteUserMutation.isPending}
          theme={theme}
        />
      ) : null}
    </DashboardCard>
  );
}
