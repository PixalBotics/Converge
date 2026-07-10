"use client";

import Box from "@mui/material/Box";
import { useMemo } from "react";
import { Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { dashboardPageHero } from "../dashboard.styles";

function formatTodayLabel(): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

export function DashboardPageHeader() {
  const { user } = useAuth();
  const roleName = user?.roleLabel?.trim();
  const title = useMemo(
    () => (roleName ? `${roleName} dashboard` : "Dashboard"),
    [roleName],
  );

  return (
    <Box sx={dashboardPageHero}>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="regularLarge"
          fontWeight={800}
          color="white"
          sx={{ textTransform: "capitalize", lineHeight: 1.2 }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "rgba(255,255,255,0.62)", mt: 0.5, fontSize: 13 }}
        >
          {formatTodayLabel()}
        </Typography>
      </Box>
    </Box>
  );
}
