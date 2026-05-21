"use client";

import Box from "@mui/material/Box";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { chatLiveNavLinkSx, chatLiveNavRowSx } from "../styles/chat-live.styles";

export type ChatLiveNavItem = {
  href: string;
  label: string;
};

const DEFAULT_NAV: ChatLiveNavItem[] = [
  { href: "/dashboard/chat-operations", label: "Inbox" },
  { href: "/dashboard/chat-monitor", label: "Monitor" },
  { href: "/dashboard/chat-qa", label: "QA inbox" },
  { href: "/dashboard/chat-reports", label: "Reports" },
  { href: "/dashboard/chat-settings", label: "Settings" },
];

interface ChatLivePageHeaderProps {
  title: string;
  subtitle?: string;
  navItems?: ChatLiveNavItem[];
  trailing?: React.ReactNode;
}

export function ChatLivePageHeader({
  title,
  subtitle,
  navItems = DEFAULT_NAV,
  trailing,
}: ChatLivePageHeaderProps) {
  const theme = useTheme() as AppTheme;
  const pathname = usePathname();

  return (
    <Box sx={{ flexShrink: 0 }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1.5,
          mb: 1,
        }}
      >
        <Box>
          <Typography variant="regularLarge" fontWeight={700} sx={{ color: theme.app.text.primary }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, mt: 0.35, maxWidth: 560 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {trailing}
      </Box>
      <Box sx={chatLiveNavRowSx}>
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Typography
              key={item.href}
              component={NextLink}
              href={item.href}
              sx={chatLiveNavLinkSx(active)}
            >
              {item.label}
            </Typography>
          );
        })}
      </Box>
    </Box>
  );
}
