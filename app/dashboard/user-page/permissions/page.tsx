"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Typography,
  Button,
  DashboardCard,
  DataTable,
  SearchBar,
  SearchSubmitButton,
  TablePagination,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesCard, rolesFooterRow, rolesIconBox, rolesPageWrapper, rolesPaginationWrapper } from "@/app/dashboard/roles/roles.styles";
import { pageWrapper } from "@/app/dashboard/companies/overview.styles";
import { footerMutedText } from "@/app/dashboard/companies/overview.styles";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import { UserPermissionsModal } from "./components";
import { useUsersListQuery } from "@/lib/hooks/query";
import { extractUsersRows } from "@/app/dashboard/user-page/utils";

export default function UserPermissionsPage() {
  const theme = useTheme() as AppTheme;
  const [open, setOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | undefined>(undefined);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Fetch all users once and filter locally for richer name search (first/middle/last).
  const usersQuery = useUsersListQuery({ all: true }, { enabled: true });

  const normalizedRows = useMemo(() => {
    return extractUsersRows(usersQuery.data)
      .map((u) => ({
        id: u.id,
        displayName: u.user || "—",
        email: u.email || "—",
        reseller: u.reseller || "—",
        parentCompany: u.parentCompany || "—",
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: "base" }));
  }, [usersQuery.data]);

  const filteredRows = useMemo(() => {
    const q = appliedSearch.trim().toLowerCase();
    if (!q) return normalizedRows;
    const includes = (v: string) => v.toLowerCase().includes(q);
    return normalizedRows.filter((u) => {
      if (includes(u.displayName)) return true;
      if (u.email !== "—" && includes(u.email)) return true;
      if (u.reseller !== "—" && includes(u.reseller)) return true;
      if (u.parentCompany !== "—" && includes(u.parentCompany)) return true;
      return false;
    });
  }, [normalizedRows, appliedSearch]);

  const PAGE_SIZE = 20;
  const totalEntries = filteredRows.length;
  const pageCount = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount);
  const rows = useMemo(() => {
    const start = (clampedPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE).map((u) => ({
      id: u.id,
      name: u.displayName,
      email: u.email,
      reseller: u.reseller,
      parentCompany: u.parentCompany,
    }));
  }, [clampedPage, filteredRows]);

  const footerRangeStart = rows.length > 0 ? (clampedPage - 1) * PAGE_SIZE + 1 : 0;
  const footerRangeEnd = (clampedPage - 1) * PAGE_SIZE + rows.length;

  const columns = useMemo<DataTableColumn<{ id: string; name: string; email: string; reseller: string; parentCompany: string }>[]>(
    () => [
      { id: "name", label: "User" },
      { id: "email", label: "Email" },
      { id: "reseller", label: "Reseller" },
      { id: "parentCompany", label: "Parent company" },
    ],
    [],
  );

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 0.75 }}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            User permissions
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.75, color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
            View and manage direct permission overrides for individual users.
          </Typography>
        </Box>

        <Button
          variant="primary"
          sx={gradientPrimaryButtonSx}
          onClick={() => {
            setEditingUserId(undefined);
            setOpen(true);
          }}
        >
          Add permissions
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr" }, gap: 2 }}>
        <DashboardCard sx={rolesCard}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
              <Box sx={rolesIconBox}>
                <AttachMoneyIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
              </Box>
              <Typography variant="mediumLarge" fontWeight={700} color="white" noWrap>
                Users
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: { xs: "100%", md: 420 } }}>
              <SearchBar value={searchInput} onChange={setSearchInput} placeholder="Search by name or email…" />
              <SearchSubmitButton
                disabled={usersQuery.isFetching}
                onClick={() => {
                  setAppliedSearch(searchInput);
                  setPage(1);
                }}
                sx={{ minWidth: 120 }}
              />
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <DataTable<{ id: string; name: string; email: string; reseller: string; parentCompany: string }>
              columns={columns}
              rows={rows}
              isLoading={usersQuery.isLoading || usersQuery.isFetching}
              getRowId={(r) => r.id}
              minWidth={720}
              actionColumn={{
                label: "Action",
                render: (row) => (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                    <Button
                      variant="primary"
                      sx={gradientPrimaryButtonSx}
                      onClick={() => {
                        setEditingUserId(row.id);
                        setOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </Box>
                ),
              }}
            />
          </Box>

          <Box sx={rolesFooterRow}>
            <Typography variant="medium" sx={footerMutedText(theme)}>
              {usersQuery.isLoading
                ? "Loading…"
                : `Showing ${footerRangeStart} to ${footerRangeEnd} of ${totalEntries} users`}
            </Typography>
            <Box sx={rolesPaginationWrapper}>
              <TablePagination page={clampedPage} pageCount={pageCount} onPageChange={setPage} />
            </Box>
          </Box>
        </DashboardCard>
      </Box>

      <UserPermissionsModal
        open={open}
        initialUserId={editingUserId}
        onClose={() => setOpen(false)}
        onSaved={() => {
          // refresh the detail panel after save
          // (query invalidation already happens in mutation; this ensures UI updates immediately)
          // no-op here; keeping hook for future
        }}
      />
    </Box>
  );
}

