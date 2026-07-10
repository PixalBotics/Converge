"use client";

import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { overviewHeader } from "../dashboard.styles";

export function DashboardPageHeader() {
  const { user } = useAuth();
  const roleName = user?.roleLabel?.trim();
  const title = roleName ? `${roleName} Dashboard` : "Dashboard";

  return (
    <Box sx={overviewHeader}>
      <Typography variant="regularLarge" fontWeight={700} color="white">
        {title}
      </Typography>
    </Box>
  );
}
