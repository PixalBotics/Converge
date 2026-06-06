"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";

export function SettingsProfilePanel() {
  const theme = useTheme() as AppTheme;
  const { user } = useAuth();

  const rows = [
    { label: "Name", value: user?.displayName ?? "—" },
    { label: "Email", value: user?.email ?? "—" },
    { label: "Role", value: user?.role ?? "—" },
    { label: "User type", value: user?.userType ?? "—" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          Settings › Profile
        </Typography>
        <Typography fontWeight={700} color="white" sx={{ mt: 0.5, fontSize: 22, lineHeight: "22px" }}>
          Profile
        </Typography>
      </Box>

      <DashboardCard sx={{ p: 2, maxWidth: 560 }}>
        <Box
          component="dl"
          sx={{
            m: 0,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "140px 1fr" },
            gap: 1.5,
            "& dt": { color: theme.app.dashboard.textMuted, fontSize: "0.875rem" },
            "& dd": { m: 0, color: theme.app.text.primary, fontSize: "0.875rem" },
          }}
        >
          {rows.map(({ label, value }) => (
            <Box key={label} sx={{ display: "contents" }}>
              <Typography component="dt" variant="body2">
                {label}
              </Typography>
              <Typography component="dd" variant="body2">
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
      </DashboardCard>
    </Box>
  );
}
