"use client";

import type { ReactNode } from "react";
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
import {
  CHAT_CONFIGURE_NAV_ITEMS,
  CHAT_LIVE_NAV_ITEMS,
} from "../constants/chat-live-nav";
import { ChatLiveViewSwitch, type ChatLiveViewOption } from "./ChatLiveViewSwitch";

export type ChatLiveNavItem = {
  href: string;
  label: string;
};

export type ChatLiveNavPreset = "triage" | "configure" | "none";

interface ChatLivePageHeaderProps {
  title: string;
  subtitle?: string;
  /** Triage = inbox/monitor/QA. Configure = roster/reports/widget/settings. None = hide. */
  navPreset?: ChatLiveNavPreset;
  navItems?: ChatLiveNavItem[];
  trailing?: ReactNode;
  /** Inbox/monitor view switch (underline tabs, no extra card). */
  viewSwitch?: {
    options: ChatLiveViewOption[];
    value: string;
    onChange: (id: string) => void;
    ariaLabel?: string;
  };
}

function resolveNavItems(
  preset: ChatLiveNavPreset,
  override?: ChatLiveNavItem[],
): ChatLiveNavItem[] {
  if (override !== undefined) return override;
  if (preset === "none") return [];
  if (preset === "configure") return CHAT_CONFIGURE_NAV_ITEMS;
  return CHAT_LIVE_NAV_ITEMS;
}

export function ChatLivePageHeader({
  title,
  subtitle,
  navPreset = "triage",
  navItems,
  trailing,
  viewSwitch,
}: ChatLivePageHeaderProps) {
  const theme = useTheme() as AppTheme;
  const pathname = usePathname();
  const stripItems = resolveNavItems(navPreset, navItems);

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
        <Box sx={{ minWidth: 0, flex: 1 }}>
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
              sx={{ color: theme.app.dashboard.textMuted, mt: 0.4, maxWidth: 720, lineHeight: 1.45 }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {trailing ? <Box sx={{ flexShrink: 0 }}>{trailing}</Box> : null}
      </Box>

      {viewSwitch ? (
        <ChatLiveViewSwitch
          options={viewSwitch.options}
          value={viewSwitch.value}
          onChange={viewSwitch.onChange}
          ariaLabel={viewSwitch.ariaLabel}
        />
      ) : null}

      {stripItems.length > 0 ? (
        <Box sx={chatLiveNavRowSx}>
          <Box sx={chatLiveNavStripSx} role="tablist" aria-label="Live chat sections">
            {stripItems.map((item) => {
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
