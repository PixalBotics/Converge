"use client";

import { useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import LockOutlined from "@mui/icons-material/LockOutlined";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import { mergeSx } from "@/lib/mui/merge-sx";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { ChatMessageList } from "@/features/chat-operations/components/ChatMessageList";
import { PanelColumn, PanelHeader, QueueAvatar } from "@/features/chat-operations/styles/chat-operations.styled";
import { parseVisitorInfo } from "@/features/chat-operations/utils/visitor-info";
import { extractVisitorPresentation } from "@/services/chat/visitor-presentation";
import { useConversationTypingEntries } from "@/lib/hooks/chat/useConversationTyping";
import { typingEntriesToPreviews } from "@/lib/hooks/chat/typing-preview-display";
import { useGuestChatSession } from "../hooks/useGuestChatSession";
import { GuestSupervisorActions } from "./GuestSupervisorActions";
import {
  guestBannerSx,
  guestBodyRowSx,
  guestCardSx,
  guestHeaderCardSx,
  guestInboxColumnSx,
  guestPageShellSx,
} from "../styles/chat-guest.styles";

export function GuestChatPage() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailToken = searchParams.get("token");
  const supervisorEmail = searchParams.get("e");

  const guest = useGuestChatSession(emailToken, supervisorEmail);

  useEffect(() => {
    if (!emailToken?.trim() || guest.phase !== "ready") return;
    router.replace("/chat/guest", { scroll: false });
  }, [emailToken, guest.phase, router]);

  const vp =
    guest.transcript && typeof guest.transcript === "object"
      ? extractVisitorPresentation(guest.transcript as Record<string, unknown>)
      : null;
  const visitorInfo = parseVisitorInfo(
    guest.transcript?.visitor ?? null,
    guest.transcript as Record<string, unknown> | undefined,
  );
  const title = vp?.inboxTitle || vp?.displayName || visitorInfo.displayName;
  const remoteTypingEntries = useConversationTypingEntries(
    guest.session?.conversationId ?? null,
    { excludeUserId: guest.session?.involvementUserId ?? null },
  );
  const typingPreviews = useMemo(
    () =>
      typingEntriesToPreviews(remoteTypingEntries, {
        visitorDisplayName: title,
        agentDisplayName: "Agent",
      }),
    [remoteTypingEntries, title],
  );
  const subtitle = vp
    ? [vp.originLabel, vp.locationLabel].filter(Boolean).join(" · ")
    : guest.session?.websiteLabel ?? null;
  const transcriptStatus = String(
    guest.transcript?.status ??
      (guest.transcript?.conversationStatus as string | undefined) ??
      "",
  )
    .trim()
    .toLowerCase();
  const isChatClosed =
    Boolean(guest.transcript?.chatCompleted) ||
    transcriptStatus === "closed" ||
    transcriptStatus === "completed" ||
    transcriptStatus === "resolved";
  const cardSurfaceSx =
    typeof theme.app.dashboard.cardBg === "string" &&
    /gradient/i.test(theme.app.dashboard.cardBg)
      ? { background: theme.app.dashboard.cardBg }
      : { bgcolor: theme.app.dashboard.cardBg };

  return (
    <Box sx={guestPageShellSx}>
      <Box sx={guestHeaderCardSx}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
          <LockOutlined sx={{ fontSize: 22, color: theme.app.dashboard.accentBlue, mt: 0.25 }} />
          <Box>
            <Typography fontWeight={700} sx={{ fontSize: 18, color: theme.app.text.primary }}>
              Secure chat view
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}>
              One supervisor per link — view transcript, whisper, or take over without signing in. Other supervisors
              use Chat Monitor after login.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={mergeSx(guestCardSx, cardSurfaceSx)}
      >
        {guest.phase === "loading" ? (
          <Box sx={{ p: 4, flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography sx={{ color: theme.app.dashboard.textMuted }}>Opening secure session…</Typography>
          </Box>
        ) : null}

        {(guest.phase === "error" || guest.phase === "no_access") && guest.error ? (
          <Box sx={{ p: 4, flex: 1 }}>
            <Typography sx={{ color: theme.app.text.primary, mb: 2 }}>{guest.error}</Typography>
            {/chat monitor/i.test(guest.error) ? (
              <Button
                type="button"
                variant="primary"
                size="small"
                href="/auth/login?next=/dashboard/chat-monitor"
                sx={{ mt: 1 }}
              >
                Sign in to Chat Monitor
              </Button>
            ) : null}
            {guest.session?.urlStrictSingleOpen ? (
              <Typography
                variant="caption"
                sx={{ display: "block", mt: 1.5, color: theme.app.dashboard.textMuted }}
              >
                Only one supervisor can use the guest link per send. Others should sign in to Monitor.
              </Typography>
            ) : null}
          </Box>
        ) : null}

        {guest.phase === "ready" && guest.session ? (
          <>
            <Box sx={guestBannerSx}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, width: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 11 }}>
                    Read-only transcript
                    {isChatClosed ? " · chat completed" : ""}
                  </Typography>
                  {!isChatClosed ? (
                    <Chip
                      label={guest.isConnected ? "Live" : "Syncing…"}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 10,
                        fontWeight: 700,
                        color: guest.isConnected
                          ? theme.app.dashboard.accentGreenLight
                          : theme.app.dashboard.accentCyan,
                        bgcolor: guest.isConnected
                          ? "rgba(34, 197, 94, 0.12)"
                          : "rgba(34, 211, 238, 0.12)",
                        border: guest.isConnected
                          ? "1px solid rgba(34, 197, 94, 0.28)"
                          : `1px solid ${theme.app.dashboard.accentCyan}`,
                      }}
                    />
                  ) : null}
                </Box>
                <Box sx={{ display: "flex", gap: 0.75 }}>
                  <Button type="button" variant="secondary" size="small" onClick={guest.signOutGuest}>
                    End session
                  </Button>
                </Box>
              </Box>
            </Box>

            <Box sx={guestBodyRowSx}>
              <Box sx={guestInboxColumnSx}>
                <PanelHeader sx={{ py: 1.5, display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
                  <QueueAvatar sx={{ width: 44, height: 44 }}>{visitorInfo.initials}</QueueAvatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography fontWeight={700} sx={{ fontSize: 15 }}>
                      {title}
                    </Typography>
                    {subtitle ? (
                      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                        {subtitle}
                      </Typography>
                    ) : null}
                    {guest.session.departmentName ? (
                      <Box sx={{ mt: 0.75 }}>
                        <Chip
                          label={guest.session.departmentName}
                          size="small"
                          sx={{ height: 22, fontSize: 11 }}
                        />
                      </Box>
                    ) : null}
                  </Box>
                </PanelHeader>

                <PanelColumn sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                  <ChatMessageList
                    conversationId={guest.session.conversationId}
                    messages={guest.messages}
                    visitorInitials={visitorInfo.initials}
                    typingPreviews={typingPreviews}
                    visitorDisplayName={title}
                    agentDisplayName="Agent"
                    showEmptyPlaceholder={guest.messages.length === 0}
                  />
                </PanelColumn>
              </Box>

              <GuestSupervisorActions
                layout="sidebar"
                session={guest.session}
                supervisorControlUserId={
                  typeof guest.transcript?.supervisorControlUserId === "string"
                    ? guest.transcript.supervisorControlUserId
                    : null
                }
                assignedAgentId={
                  typeof guest.transcript?.agentId === "string" ? guest.transcript.agentId : null
                }
                chatCompleted={isChatClosed}
                onOptimisticAgentMessage={guest.appendOptimisticMessage}
                onLiveTyping={guest.emitLiveTyping}
                onActionComplete={() => void guest.refreshTranscript()}
                guestSocket={guest.guestSocket}
              />
            </Box>
          </>
        ) : null}
      </Paper>
    </Box>
  );
}
