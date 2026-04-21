"use client";

import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, SearchBar, TablePagination, Typography } from "@/components/common";
import { rolesCard, rolesPaginationWrapper } from "@/app/dashboard/roles/roles.styles";

export type UserType = "Internal" | "External";

export type UserListRow = {
  id: string;
  name: string;
  email: string;
  type: UserType;
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
}: UsersSidebarProps) {
  const theme = useTheme() as AppTheme;

  return (
    <DashboardCard sx={{ ...rolesCard, p: { xs: 1.25, sm: 1.5, md: 1.75 } }}>
      <Typography variant="mediumLarge" fontWeight={700} color="white" sx={{ mb: 1 }}>
        Users
      </Typography>
      <SearchBar value={search} onChange={onSearchChange} placeholder="Search user (name/email)..." />
      <Box sx={{ mt: 1.25, mb: 1, borderTop: "1px solid rgba(255,255,255,0.08)" }} />

      <Box sx={{ maxHeight: { xs: 360, lg: "calc(100vh - 320px)" }, overflow: "auto" }}>
        <List dense disablePadding>
          {users.map((u) => {
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
                    <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }} noWrap>
                      {u.email}
                    </Typography>
                  }
                />
              </ListItemButton>
            );
          })}
          {users.length === 0 ? (
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
              {isLoading ? "Loading…" : "No users found."}
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

