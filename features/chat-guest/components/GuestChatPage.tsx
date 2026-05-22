"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import LockOutlined from "@mui/icons-material/LockOutlined";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { ChatMessageList } from "@/features/chat-operations/components/ChatMessageList";
import { PanelColumn, PanelHeader, QueueAvatar } from "@/features/chat-operations/styles/chat-operations.styled";
import { parseVisitorInfo } from "@/features/chat-operations/utils/visitor-info";
import { extractVisitorPresentation } from "@/services/chat/visitor-presentation";
import { useGuestChatSession } from "../hooks/useGuestChatSession";
import { GuestSupervisorActions } from "./GuestSupervisorActions";
import { guestBannerSx, guestCardSx, guestHeaderCardSx, guestPageShellSx } from "../styles/chat-guest.styles";

export function GuestChatPage() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailToken = searchParams.get("token");

  const guest = useGuestChatSession(emailToken);

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
  const subtitle = vp
    ? [vp.originLabel, vp.locationLabel].filter(Boolean).join(" · ")
    : guest.session?.websiteLabel ?? null;

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
              Department guest access — read-only transcript unless your link allows whisper or takeover.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Paper elevation={0} sx={[guestCardSx, { bgcolor: theme.app.dashboard.cardBg }]}>
        {guest.phase === "loading" ? (
          <Box sx={{ p: 4, flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography sx={{ color: theme.app.dashboard.textMuted }}>Opening secure session…</Typography>
          </Box>
        ) : null}

        {(guest.phase === "error" || guest.phase === "no_access") && guest.error ? (
          <Box sx={{ p: 4, flex: 1 }}>
            <Typography sx={{ color: theme.app.text.primary, mb: 2 }}>{guest.error}</Typography>
            {guest.session?.urlStrictSingleOpen ? (
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                This link allows a single browser session. If you already opened it, continue in that browser or
                request a new link.
              </Typography>
            ) : null}
          </Box>
        ) : null}

        {guest.phase === "ready" && guest.session ? (
          <>
            <Box sx={guestBannerSx}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, width: "100%" }}>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 11 }}>
                  Read-only transcript
                  {guest.transcript?.chatCompleted ? " · chat completed" : ""}
                </Typography>
                <Box sx={{ display: "flex", gap: 0.75 }}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    disabled={guest.refreshing}
                    onClick={() => void guest.refreshTranscript()}
                  >
                    {guest.refreshing ? "Refreshing…" : "Refresh"}
                  </Button>
                  <Button type="button" variant="secondary" size="small" onClick={guest.signOutGuest}>
                    End session
                  </Button>
                </Box>
              </Box>
            </Box>

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
                messages={guest.messages}
                visitorInitials={visitorInfo.initials}
                visitorDisplayName={title}
                agentDisplayName="Agent"
                showEmptyPlaceholder={guest.messages.length === 0}
              />
            </PanelColumn>

            <GuestSupervisorActions
              session={guest.session}
              onActionComplete={() => void guest.refreshTranscript()}
            />
          </>
        ) : null}
      </Paper>
    </Box>
  );
}
