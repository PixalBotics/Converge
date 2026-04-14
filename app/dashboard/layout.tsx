"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { LoadingScreen } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { DashboardSidebar, DashboardHeader } from "@/components/dashboard";
import { dashboardMainGlassSx, dashboardMainTextSx } from "./dashboard.styles";
import { mainBackgroundGradient } from "@/theme/theme";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <LoadingScreen message="Redirecting to login..." />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        boxSizing: "border-box",
        bgcolor: "transparent",
        background: (theme) =>
          (theme as { appBackground?: string }).appBackground ?? mainBackgroundGradient,
        p: { xs: 0, md: 2 },
        gap: { xs: 0, md: 2 },
      }}
    >
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <Box
          component="main"
          sx={
            [
              {
                flex: 1,
                py: { xs: 2, sm: 3 },
                px: { xs: 1.5, sm: 2, md: 0 },
                overflow: "auto",
              },
              dashboardMainTextSx,
              dashboardMainGlassSx,
            ] as SxProps<Theme>
          }
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
