"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { getAccessToken } from "@/api";
import { canSendGuestLink } from "@/lib/permissions/chat-access";
import {
  listConversationGuestLinks,
  sendDepartmentGuestLink,
} from "@/services/chat/guest-link.api";
import type { GuestLinkRow } from "@/services/chat/guest.types";
import { ChatSideToolCard } from "@/features/chat-shared";

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

interface GuestLinkPanelProps {
  conversationId: string | null;
  hasOperational: (p: string) => boolean;
  disabled?: boolean;
  /** When explicitly false, panel is hidden (website `guestAccess.enabled`). Omit while loading. */
  guestAccessEnabled?: boolean | null;
}

export function GuestLinkPanel({
  conversationId,
  hasOperational,
  disabled = false,
  guestAccessEnabled = null,
}: GuestLinkPanelProps) {
  const theme = useTheme() as AppTheme;
  const token = getAccessToken() ?? "";
  const canSend = canSendGuestLink(hasOperational);

  const [links, setLinks] = useState<GuestLinkRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!conversationId || !token || !canSend) {
      setLinks([]);
      return;
    }
    try {
      const rows = await listConversationGuestLinks(conversationId, token);
      setLinks(rows);
    } catch {
      setLinks([]);
    }
  }, [canSend, conversationId, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!conversationId || !canSend || guestAccessEnabled === false) return null;

  const runSend = async () => {
    if (!token) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await sendDepartmentGuestLink(conversationId, undefined, token);
      const count = res.sent?.length ?? 0;
      setStatus(
        count > 0
          ? `Sent involvement link to ${count} supervisor${count === 1 ? "" : "s"}.`
          : "No links sent.",
      );
      await refresh();
    } catch (err) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String(
              (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                "Could not send guest links.",
            )
          : "Could not send guest links.";
      setStatus(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ChatSideToolCard
      accent="guest"
      title="Send involvement link"
      subtitle="Emails all involvement supervisors for this chat's department (one shared one-time URL)."
    >
      <Button
        type="button"
        variant="primary"
        size="small"
        fullWidth
        sx={{ ...gradientPrimaryButtonSx, mt: 0.5 }}
        disabled={busy || disabled}
        onClick={() => void runSend()}
      >
        {busy ? "Sending…" : "Send involvement link"}
      </Button>

      {status ? (
        <Typography variant="caption" sx={{ display: "block", mt: 1, color: theme.app.dashboard.textMuted }}>
          {status}
        </Typography>
      ) : null}

      {links.length > 0 ? (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.75 }}>
            Recent links
          </Typography>
          {links.slice(0, 5).map((link) => {
            const revoked = Boolean(link.revokedAt);
            const opened = Boolean(link.firstOpenedAt);
            const label = revoked ? "Revoked" : opened ? "Opened" : "Pending";
            return (
              <Box
                key={link.id}
                sx={{
                  mb: 0.75,
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.app.dashboard.overlayLight, 0.35),
                }}
              >
                <Chip label={label} size="small" sx={{ height: 20, fontSize: 10, mb: 0.5 }} />
                <Typography variant="caption" sx={{ display: "block", fontSize: 11 }}>
                  {link.recipientEmail}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 10 }}>
                  {link.department?.name ?? "Dept"} · expires {formatWhen(link.expiresAt)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      ) : null}
    </ChatSideToolCard>
  );
}
