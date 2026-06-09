"use client";

import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard } from "@/components/common";

const SETTINGS_TABS = [
  { href: "/dashboard/chat-settings/close-policy", label: "Close policy" },
  { href: "/dashboard/chat-settings/qa-policy", label: "QA policy" },
] as const;

export function ChatSettingsSubnav() {
  const theme = useTheme() as AppTheme;
  const pathname = usePathname();
  const router = useRouter();

  const active =
    SETTINGS_TABS.find((t) => pathname === t.href || pathname.startsWith(`${t.href}/`))
      ?.href ?? SETTINGS_TABS[0].href;

  return (
    <DashboardCard sx={{ flexShrink: 0, p: 0, height: "auto", minHeight: 0 }}>
      <Tabs
        value={active}
        onChange={(_, href: string) => router.push(href)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 44,
          px: { xs: 0.5, md: 1 },
          borderBottom: `1px solid ${theme.app.dashboard.cardBorder}`,
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600, minHeight: 44 },
        }}
      >
        {SETTINGS_TABS.map((tab) => (
          <Tab key={tab.href} value={tab.href} label={tab.label} />
        ))}
      </Tabs>
    </DashboardCard>
  );
}
