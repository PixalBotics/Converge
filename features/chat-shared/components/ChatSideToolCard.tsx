"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { dashboardCardSurfaceProps } from "@/features/chat-operations/styles/chat-semantic";
import { isSimpleCssColor, safeAlpha } from "@/lib/theme/safe-alpha";
import { Typography } from "@/components/common";

export type ChatSideToolCardAccent = "default" | "guest" | "supervisor" | "danger";

export type ChatSideToolCardProps = {
  title: string;
  subtitle?: string;
  accent?: ChatSideToolCardAccent;
  children: React.ReactNode;
  sx?: object;
};

function accentColors(accent: ChatSideToolCardAccent, theme: AppTheme) {
  const d = theme.app.dashboard;
  switch (accent) {
    case "guest":
      return { main: d.accentCyan, bg: d.blueTintBg };
    case "supervisor":
      return { main: d.accentPurple, bg: safeAlpha(d.accentPurple, 0.12) };
    case "danger":
      return { main: theme.palette.error.main, bg: safeAlpha(theme.palette.error.main, 0.08) };
    default:
      return { main: d.accentBlue, bg: safeAlpha(d.accentBlue, 0.08) };
  }
}

/** Sidebar tool block (guest links, supervisor whisper/takeover). */
export function ChatSideToolCard({
  title,
  subtitle,
  accent = "default",
  children,
  sx,
}: ChatSideToolCardProps) {
  const theme = useTheme() as AppTheme;
  const { main, bg } = accentColors(accent, theme);

  return (
    <Box
      sx={{
        mt: 2,
        p: 1.75,
        borderRadius: "10px",
        border: `1px solid ${safeAlpha(main, 0.28)}`,
        ...dashboardCardSurfaceProps(theme, 0.72),
        ...(isSimpleCssColor(bg)
          ? { background: `linear-gradient(165deg, ${bg} 0%, ${safeAlpha(theme.app.dashboard.overlayLight, 0.22)} 100%)` }
          : {}),
        ...sx,
      }}
    >
      <Typography fontWeight={700} sx={{ fontSize: 14, color: theme.app.text.primary, mb: subtitle ? 0.35 : 1 }}>
        {title}
      </Typography>
      {subtitle ? (
        <Typography
          variant="caption"
          sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5, lineHeight: 1.45 }}
        >
          {subtitle}
        </Typography>
      ) : null}
      {children}
    </Box>
  );
}
