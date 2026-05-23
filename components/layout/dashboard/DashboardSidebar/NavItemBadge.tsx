"use client";

import Box from "@mui/material/Box";
import { useNotificationsContext } from "@/lib/notifications/NotificationsContext";

const HREF_BADGE: Record<string, keyof { chat: number; qa: number; hrms_leave: number }> = {
  "/dashboard/chat-operations": "chat",
  "/dashboard/chat-qa": "qa",
  "/dashboard/leave/approval-inbox": "hrms_leave",
};

export function NavItemBadge({ href }: { href: string }) {
  const ctx = useNotificationsContext();
  if (!ctx) return null;

  const key = Object.entries(HREF_BADGE).find(([prefix]) => href.startsWith(prefix))?.[1];
  if (!key) return null;

  const count = ctx.badgeCounts[key];
  if (!count || count <= 0) return null;

  return (
    <Box
      component="span"
      sx={{
        minWidth: 18,
        height: 18,
        px: 0.5,
        borderRadius: 9,
        bgcolor: "error.main",
        color: "#fff",
        fontSize: 10,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {count > 99 ? "99+" : count}
    </Box>
  );
}
