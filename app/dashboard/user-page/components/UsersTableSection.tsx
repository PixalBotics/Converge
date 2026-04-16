"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { MoreHoriz as MoreHorizIcon, AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import { Typography, DashboardCard, DataTable, dataTableActionButton, TablePagination } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { userIconPath } from "@/assets";
import type { AppTheme } from "@/theme/theme";
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
  } = props;

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
    [theme],
  );

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
          theme={theme}
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
            render: () => (
              <IconButton size="small" sx={dataTableActionButton}>
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            ),
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
    </DashboardCard>
  );
}
