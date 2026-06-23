"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, DataTable, Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { extractProfileFromMePayload } from "@/lib/auth/me-payload";
import { useMeQuery } from "@/lib/hooks/query";

type PermissionRow = {
  id: string;
  no: number;
  permission: string;
};

const permissionColumns: DataTableColumn<PermissionRow>[] = [
  { id: "no", label: "#", align: "center", cellVariant: "muted" },
  { id: "permission", label: "Permission" },
];

function ProfileRows({
  rows,
}: {
  rows: { label: string; value: string }[];
}) {
  const theme = useTheme() as AppTheme;

  const rowPairs = useMemo(() => {
    const pairs: { label: string; value: string }[][] = [];
    for (let i = 0; i < rows.length; i += 2) {
      pairs.push(rows.slice(i, i + 2));
    }
    return pairs;
  }, [rows]);

  const fieldSx = {
    m: 0,
    display: "grid",
    gridTemplateColumns: { xs: "120px 1fr", sm: "140px 1fr" },
    gap: 1.5,
    alignItems: "start",
    "& dt": { color: theme.app.dashboard.textMuted, fontSize: "0.875rem" },
    "& dd": { m: 0, color: theme.app.text.primary, fontSize: "0.875rem", wordBreak: "break-word" },
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {rowPairs.map((pair, index) => (
        <Box
          key={index}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 1.5, md: 3 },
          }}
        >
          {pair.map(({ label, value }) => (
            <Box key={label} component="dl" sx={fieldSx}>
              <Typography component="dt" variant="body2">
                {label}
              </Typography>
              <Typography component="dd" variant="body2">
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

function PermissionTable({
  items,
  emptyLabel,
  isLoading,
}: {
  items: string[];
  emptyLabel: string;
  isLoading?: boolean;
}) {
  const rows = useMemo(
    () =>
      items.map((permission, index) => ({
        id: permission,
        no: index + 1,
        permission,
      })),
    [items],
  );

  return (
    <DataTable<PermissionRow>
      columns={permissionColumns}
      rows={rows}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      loadingRowCount={6}
      minWidth={320}
      emptyState={{ description: emptyLabel }}
    />
  );
}

export function SettingsProfilePanel() {
  const theme = useTheme() as AppTheme;
  const meQuery = useMeQuery();
  const profile = useMemo(
    () => (meQuery.data ? extractProfileFromMePayload(meQuery.data) : null),
    [meQuery.data],
  );

  const loading = meQuery.isLoading || meQuery.isFetching;
  const placeholder = loading ? "…" : "—";

  const profileRows = [
    { label: "Name", value: profile?.displayName ?? placeholder },
    { label: "Email", value: profile?.email ?? placeholder },
    { label: "Role", value: profile?.roleLabel ?? placeholder },
    { label: "License key", value: profile?.licenseKey ?? placeholder },
    { label: "User key", value: profile?.userId ?? placeholder },
    { label: "User type", value: profile?.userType ?? placeholder },
    { label: "Department", value: profile?.department ?? placeholder },
    { label: "Designation", value: profile?.designation ?? placeholder },
    { label: "Theme", value: profile?.theme ?? placeholder },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
      <Box>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          Settings › Profile
        </Typography>
        <Typography fontWeight={700} color="white" sx={{ mt: 0.5, fontSize: 22, lineHeight: "22px" }}>
          Profile
        </Typography>
      </Box>

      <DashboardCard sx={{ p: 2, width: "100%" }}>
        <ProfileRows rows={profileRows} />
      </DashboardCard>

      <DashboardCard sx={{ p: 2, width: "100%" }}>
        <Typography
          variant="body2"
          sx={{ color: theme.app.dashboard.textMuted, mb: 1.5, fontWeight: 600 }}
        >
          Operational permissions
        </Typography>
        <PermissionTable
          items={profile?.operationalPermissions ?? []}
          emptyLabel={loading ? "…" : "—"}
          isLoading={loading}
        />
      </DashboardCard>

      <DashboardCard sx={{ p: 2, width: "100%" }}>
        <Typography
          variant="body2"
          sx={{ color: theme.app.dashboard.textMuted, mb: 1.5, fontWeight: 600 }}
        >
          Page permissions
        </Typography>
        <PermissionTable items={profile?.pagePermissions ?? []} emptyLabel={loading ? "…" : "—"} isLoading={loading} />
      </DashboardCard>
    </Box>
  );
}
