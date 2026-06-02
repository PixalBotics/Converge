"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { safeAlpha } from "@/lib/theme/safe-alpha";
import { Button, Typography } from "@/components/common";
import { getAccessToken } from "@/api";
import { canSendGuestLink } from "@/lib/permissions/chat-access";
import {
  getGuestLinkSendTarget,
  listConversationGuestLinks,
  sendDepartmentGuestLink,
} from "@/services/chat/guest-link.api";
import type { GuestLinkRow, GuestLinkSendTarget } from "@/services/chat/guest.types";
import { ChatSideToolCard } from "@/features/chat-shared";

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function matchedViaLabel(via: GuestLinkSendTarget["matchedVia"]): string {
  if (via === "inquiry_external_topic") return "Inquire topic → external dept";
  if (via === "conversation_department") return "Chat department";
  return "Manual override";
}

function statusBadgeSx(
  theme: AppTheme,
  tone: "neutral" | "success" | "warning",
): object {
  const d = theme.app.dashboard;
  const accent =
    tone === "success"
      ? theme.palette.success.main
      : tone === "warning"
        ? theme.palette.warning.main
        : d.accentBlue;
  return {
    display: "inline-flex",
    alignItems: "center",
    height: 20,
    px: 0.75,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 600,
    lineHeight: 1,
    color: tone === "neutral" ? d.textMuted : accent,
    bgcolor: safeAlpha(accent, tone === "neutral" ? 0.1 : 0.14),
    border: `1px solid ${safeAlpha(accent, 0.32)}`,
  };
}

interface GuestLinkPanelProps {
  conversationId: string | null;
  hasOperational: (p: string) => boolean;
  disabled?: boolean;
}

export function GuestLinkPanel({
  conversationId,
  hasOperational,
  disabled = false,
}: GuestLinkPanelProps) {
  const theme = useTheme() as AppTheme;
  const token = getAccessToken() ?? "";
  const canSend = canSendGuestLink(hasOperational);

  const [links, setLinks] = useState<GuestLinkRow[]>([]);
  const [target, setTarget] = useState<GuestLinkSendTarget | null>(null);
  const [targetLoading, setTargetLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const refreshLinks = useCallback(async () => {
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

  const refreshTarget = useCallback(async () => {
    if (!conversationId || !token || !canSend) {
      setTarget(null);
      return;
    }
    setTargetLoading(true);
    try {
      const t = await getGuestLinkSendTarget(conversationId, token);
      setTarget(t);
    } catch {
      setTarget(null);
    } finally {
      setTargetLoading(false);
    }
  }, [canSend, conversationId, token]);

  useEffect(() => {
    void refreshLinks();
    void refreshTarget();
  }, [refreshLinks, refreshTarget]);

  if (!conversationId || !canSend) return null;

  const runSend = async () => {
    if (!token) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await sendDepartmentGuestLink(conversationId, undefined, token);
      const sentList = res.sent ?? res.recipients ?? [];
      const count = sentList.length;
      const dept = res.departmentName ?? target?.departmentName;
      const topic = res.topicLabel ?? target?.topicLabel;
      setStatus(
        count > 0
          ? `Sent to ${count} supervisor${count === 1 ? "" : "s"}${dept ? ` (${dept}${topic ? ` · ${topic}` : ""})` : ""}.`
          : "No links sent.",
      );
      await refreshLinks();
      await refreshTarget();
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

  const sendDisabled =
    busy || disabled || targetLoading || (target != null && !target.canSend);

  return (
    <ChatSideToolCard
      accent="guest"
      title="Send involvement link"
      subtitle="Emails involvement supervisors for this chat's inquire topic (external department)."
    >
      <Box
        sx={{
          mt: 0.5,
          mb: 1,
          p: 1.25,
          borderRadius: 1.5,
          bgcolor: safeAlpha(theme.app.dashboard.overlayLight, 0.4),
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
        }}
      >
        {targetLoading ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            Checking target department…
          </Typography>
        ) : target ? (
          <>
            {target.topicLabel ? (
              <Typography variant="caption" sx={{ display: "block", fontSize: 11, mb: 0.5 }}>
                <strong>Inquire topic:</strong> {target.topicLabel}
              </Typography>
            ) : null}
            <Typography variant="caption" sx={{ display: "block", fontSize: 11, mb: 0.5 }}>
              <strong>Involvement department:</strong> {target.departmentName}
            </Typography>
            {target.conversationDepartmentName &&
            target.chatRoutedElsewhere ? (
              <Typography
                variant="caption"
                sx={{ display: "block", fontSize: 10, color: theme.app.dashboard.textMuted, mb: 0.5 }}
              >
                Chat routed to: {target.conversationDepartmentName} (agents)
              </Typography>
            ) : null}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.75 }}>
              <Box component="span" sx={statusBadgeSx(theme, "neutral")}>
                {matchedViaLabel(target.matchedVia)}
              </Box>
              <Box
                component="span"
                sx={statusBadgeSx(theme, target.canSend ? "success" : "warning")}
              >
                {target.canSend
                  ? `${target.supervisorCount} supervisor${target.supervisorCount === 1 ? "" : "s"}`
                  : "No supervisors"}
              </Box>
            </Box>
            {target.hint ? (
              <Typography
                variant="caption"
                sx={{ display: "block", mt: 0.75, color: theme.palette.warning.light, fontSize: 10 }}
              >
                {target.hint}
              </Typography>
            ) : null}
          </>
        ) : (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 11 }}>
            Could not load send target. Refresh or check chat routing.
          </Typography>
        )}
      </Box>

      <Button
        type="button"
        variant="primary"
        size="small"
        fullWidth
        sx={{
          backgroundColor: theme.app.dashboard.accentBlue,
          color: theme.app.dashboard.gradientButtonText,
          minWidth: 0,
          "&:hover": {
            backgroundColor: theme.app.dashboard.buttonIndigo,
          },
          "&.Mui-disabled": {
            backgroundColor: theme.app.dashboard.accentBlue,
            color: theme.app.dashboard.gradientButtonText,
            opacity: 0.45,
          },
        }}
        disabled={sendDisabled}
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
                  bgcolor: safeAlpha(theme.app.dashboard.overlayLight, 0.35),
                }}
              >
                <Box component="span" sx={{ ...statusBadgeSx(theme, "neutral"), mb: 0.5, display: "inline-flex" }}>
                  {label}
                </Box>
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
