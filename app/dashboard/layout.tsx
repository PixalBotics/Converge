"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import { useAuth } from "@/lib/auth";
import { DashboardSidebar, DashboardHeader } from "@/components/dashboard";
import { dashboardText } from "./dashboard.styles";

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

  if (isLoading) return null;
  if (!isAuthenticated) return null;

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "transparent",
        background: (theme) => (theme as { appBackground?: string }).appBackground ?? "radial-gradient(50% 50% at 50% 50%, #09013F 0%, #00011A 100%)",
      }}
    >
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3 }, overflow: "auto", ...dashboardText }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
