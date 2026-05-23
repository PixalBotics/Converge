"use client";

import Box from "@mui/material/Box";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import {
  chatLiveHeaderCardSx,
  chatLiveNavLinkSx,
  chatLiveNavRowSx,
  chatLiveNavStripSx,
} from "../styles/chat-live.styles";

export type ChatLiveNavItem = {
  href: string;
  label: string;
};

const DEFAULT_NAV: ChatLiveNavItem[] = [
  { href: "/dashboard/chat-operations", label: "Inbox" },
  { href: "/dashboard/chat-monitor", label: "Monitor" },
  { href: "/dashboard/chat-qa", label: "QA inbox" },
  { href: "/dashboard/chat-reports", label: "Reports" },
  { href: "/dashboard/chat-involvement", label: "Involvement" },
  { href: "/dashboard/chat-settings", label: "Canned" },
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
    <Box sx={chatLiveHeaderCardSx}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="regularLarge"
            fontWeight={700}
            sx={{ color: theme.app.text.primary, letterSpacing: "-0.02em" }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography
              variant="medium"
              sx={{ color: theme.app.dashboard.textMuted, mt: 0.4, maxWidth: 640, lineHeight: 1.45 }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {trailing ? <Box sx={{ flexShrink: 0 }}>{trailing}</Box> : null}
      </Box>
      {navItems.length > 0 ? (
        <Box sx={chatLiveNavRowSx}>
          <Box sx={chatLiveNavStripSx} role="tablist" aria-label="Live chat sections">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  role="tab"
                  aria-selected={active}
                  style={{ textDecoration: "none" }}
                >
                  <Typography component="span" sx={chatLiveNavLinkSx(active)}>
                    {item.label}
                  </Typography>
                </NextLink>
              );
            })}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
