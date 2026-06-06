"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import ChatRounded from "@mui/icons-material/ChatRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import Send from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  type MutableRefObject,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import MuiButton from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Typography } from "@/components/common";
import { EmbedActionButton } from "@/components/embed/EmbedActionButton";
import { WidgetProactiveTeaserBubble } from "@/components/embed/WidgetProactiveTeaserBubble";
import { EmbedChatBubble } from "@/components/embed/EmbedChatBubble";
import {
  EmbedChatHeaderStatusChip,
  EmbedChatPanelHeaderRow,
} from "@/components/embed/EmbedChatHeaderStatus";
import {
  resolveEmbedPanelHeaderStatus,
  type EmbedPanelHeaderStatus,
} from "@/lib/widget-runtime/embed-panel-header-status";
import { EmbedChatMediaBubbles } from "@/components/embed/EmbedChatMediaBubble";
import { EmbedInputField } from "@/components/embed/EmbedInputField";
import { resolveClientGeoHints } from "@/lib/widget-runtime/client-geo-hints";
import {
  markWidgetTrackSent,
  shouldSkipWidgetTrack,
} from "@/lib/widget-runtime/widget-track-dedupe";
import { ChatFormattedMessage } from "@/lib/safe-markdown/ChatFormattedMessage";
import { normalizeChatMessageText } from "@/lib/safe-markdown/text";
import { useVisitorChat } from "@/lib/hooks/chat/useVisitorChat";
import {
  isHiddenFromVisitorWidget,
  isVisitorPolicyNoticeMessage,
} from "@/lib/hooks/chat/visitor-widget-messages";
import { LauncherPresetIcon } from "@/lib/chat-widget/launcherIcons";
import {
  resolveInquiryRoutingTargets,
  type RuntimeInquiryOption,
} from "@/lib/chat-widget/widget-inquiry.types";
import {
  buildDefaultFormValues,
  buildDynamicPrechatZod,
  buildVisitorPayloadParts,
  buildVisitorTranscriptDisplay,
  extractPrechatFieldsFromWidgetConfig,
  isPrechatBootstrapVisitorMessage,
  resolvePersonalizedAssistantWelcome,
  type PrechatFieldDto,
} from "@/lib/widget-runtime/prechat-form";
import {
  extractRuntimeChatAppearance,
  resolveEmbedGreetingMessage,
  launcherEmbedRootSx,
  resolveRuntimeConfigRecord,
  type RuntimeChatAppearance,
} from "@/lib/widget-runtime/widget-runtime-appearance";
import {
  EMBED_LAUNCHER_SIZE_PX,
  postEmbedHostResize,
} from "@/lib/widget-runtime/embed-host-messaging";
import {
  notifyWidgetIncoming,
  requestWidgetNotificationPermission,
  truncateNotificationPreview,
  unlockWidgetAudio,
} from "@/lib/widget-runtime/widget-notifications";
import {
  markWidgetReturnVisit,
  shouldRunWidgetAutoOpen,
} from "@/lib/widget-runtime/widget-visit-lifecycle";
import { useEmbedHostResize } from "@/lib/widget-runtime/use-embed-host-resize";
import {
  embedComposerInputSx,
  embedComposerRowSx,
  embedChatBubbleShellSx,
  embedTalkToAgentButtonSx,
  embedPrechatFormBubbleInnerSx,
  embedPrechatFormBubbleShellSx,
  embedInquiryPillSx,
  embedLauncherFabSx,
  embedLabelTextSx,
  embedMutedTextSx,
  embedNativeInputStyle,
  embedPanelPaperSx,
  embedPanelMessageListSx,
  embedEmbeddedChatPanelSx,
  embedComposerFooterSx,
  embedTeaserPreviewSx,
  embedTranscriptBubbleInnerSx,
  embedSendButtonSx,
  resolveEmbedMessageBubbleRole,
} from "@/lib/widget-runtime/embed-theme-sx";
import { EmbedWidgetTheme } from "@/components/embed/EmbedWidgetTheme";
import {
  getWidgetRuntimeConfig,
  postWidgetSession,
} from "@/lib/widget-runtime/widget-public-fetch";
import type { WidgetConfigEnvelope } from "@/lib/widget-runtime/widget-types";
import { decodeJwtExpMs } from "@/lib/widget-runtime/jwt-expiry";
import {
  clearConversationId,
  ensureVisitorSessionId,
  generateClientSessionId,
  persistConversationId,
  persistHybridEscalated,
  persistVisitorSessionId,
  readConversationId,
  readHybridEscalatedConversationId,
  readVisitorSessionId,
  saveWidgetJwt,
} from "@/lib/widget-runtime/browser-storage";
import type { ChatMessage } from "@/services/chat/chat.types";

type BootState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; config: WidgetConfigEnvelope; sessionToken: string };

function optionalUuid(value: string | null | undefined): string | undefined {
  const v = value?.trim();
  if (!v) return undefined;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
    ? v
    : undefined;
}

export interface EmbedWidgetClientProps {
  widgetKey: string;
  parentHost: string;
  parentPageUrl: string;
  /** Dashboard preview — skips widget analytics tracking. */
  sandboxMode?: boolean;
}

export function EmbedWidgetClient({
  widgetKey,
  parentHost,
  parentPageUrl,
  sandboxMode = false,
}: EmbedWidgetClientProps) {
  const [boot, setBoot] = useState<BootState>({ phase: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const cfgRes = await getWidgetRuntimeConfig(widgetKey);
      if (cancelled) return;
      if (!cfgRes.ok) {
        setBoot({
          phase: "error",
          message:
            cfgRes.status === 403
              ? "This widget is not allowed on this domain."
              : cfgRes.message,
        });
        return;
      }

      const originHost =
        parentHost?.trim() ||
        (typeof window !== "undefined" ? window.location.hostname : "");

      const sess = await postWidgetSession({
        widgetKey,
        ...(originHost ? { originHost } : {}),
      });
      if (cancelled) return;
      if (!sess.ok) {
        setBoot({ phase: "error", message: sess.message });
        return;
      }

      const sessionToken =
        typeof sess.data.sessionToken === "string" ? sess.data.sessionToken.trim() : "";
      if (!sessionToken) {
        setBoot({
          phase: "error",
          message: "Session token missing from server response.",
        });
        return;
      }

      saveWidgetJwt(widgetKey, sessionToken);
      setBoot({
        phase: "ready",
        config: cfgRes.data,
        sessionToken,
      });
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [widgetKey, parentHost]);

  useEffect(() => {
    if (boot.phase !== "ready") return;

    let cancelled = false;
    const originHost =
      parentHost?.trim() ||
      (typeof window !== "undefined" ? window.location.hostname : "") ||
      "localhost";

    const skewMs = 60_000;
    const fallbackMs = 14 * 60_000;
    const expMs = decodeJwtExpMs(boot.sessionToken);
    const delayMs = expMs
      ? Math.max(5_000, expMs - Date.now() - skewMs)
      : fallbackMs;

    const id = window.setTimeout(() => {
      void (async () => {
        const sess = await postWidgetSession({
          widgetKey,
          ...(originHost ? { originHost } : {}),
        });
        if (cancelled || !sess.ok) return;
        const next =
          typeof sess.data.sessionToken === "string" ? sess.data.sessionToken.trim() : "";
        if (!next) return;
        saveWidgetJwt(widgetKey, next);
        setBoot((prev) =>
          prev.phase === "ready" ? { ...prev, sessionToken: next } : prev,
        );
      })();
    }, delayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [boot, parentHost, widgetKey]);

  if (boot.phase === "loading") {
    return <EmbedLoadingLauncher />;
  }

  if (boot.phase === "error") {
    return (
      <Box sx={{ p: 1, maxWidth: 200 }}>
        <Typography variant="caption" color="error">
          {boot.message}
        </Typography>
      </Box>
    );
  }

  return (
    <WidgetSurfaces
      widgetKey={widgetKey}
      parentPageUrl={parentPageUrl}
      envelope={boot.config}
      sessionToken={boot.sessionToken}
      sandboxMode={sandboxMode}
    />
  );
}

const WELCOME_ACK_STORAGE_PREFIX = "converge.embed.welcomeAck.";

/** Launcher placeholder while config/session loads. */
function EmbedLoadingLauncher() {
  const loadingAppearance = useMemo(
    () =>
      extractRuntimeChatAppearance({
        theme: { primaryColor: "#1e63d5", borderRadiusPx: 12, fontFamily: "inherit" },
        ui: { backgroundColor: "#f8fafc" },
      }),
    [],
  );

  useEffect(() => {
    postEmbedHostResize(false, loadingAppearance);
  }, [loadingAppearance]);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        right: 0,
        zIndex: 2147483000,
        pointerEvents: "auto",
        width: EMBED_LAUNCHER_SIZE_PX,
        height: EMBED_LAUNCHER_SIZE_PX,
      }}
    >
      <IconButton
        type="button"
        aria-label="Loading chat widget"
        disabled
        sx={{
          ...embedLauncherFabSx(loadingAppearance, "circle", EMBED_LAUNCHER_SIZE_PX),
          opacity: 0.85,
        }}
      >
        <ChatRounded sx={{ fontSize: 30 }} />
      </IconButton>
    </Box>
  );
}

function readWelcomeAcknowledged(widgetKey: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(`${WELCOME_ACK_STORAGE_PREFIX}${widgetKey}`) === "1";
  } catch {
    return false;
  }
}

function writeWelcomeAcknowledged(widgetKey: string) {
  try {
    sessionStorage.setItem(`${WELCOME_ACK_STORAGE_PREFIX}${widgetKey}`, "1");
  } catch {
    /* ignore */
  }
}

/** Bottom-right launcher: greeting → pre-chat form → live chat */
function FloatingChatEmbed({
  widgetKey,
  welcomeText,
  websiteId,
  parentPageUrl,
  mode,
  sessionToken,
  configRecord,
  appearance,
  textUsBelow,
  sandboxMode = false,
}: {
  widgetKey: string;
  welcomeText: string;
  websiteId: string;
  parentPageUrl: string;
  mode: string;
  sessionToken: string;
  configRecord: Record<string, unknown>;
  appearance: RuntimeChatAppearance;
  textUsBelow?: ReactNode;
  sandboxMode?: boolean;
}) {
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [panelHeaderStatus, setPanelHeaderStatus] =
    useState<EmbedPanelHeaderStatus | null>(null);
  const launcherOpenRef = useRef(false);
  const sessionTokenRef = useRef(sessionToken);
  sessionTokenRef.current = sessionToken;
  const [unreadCount, setUnreadCount] = useState(0);
  const [launcherPreview, setLauncherPreview] = useState("");
  const siteKey = `${widgetKey}:${websiteId}`;
  const formEnabledForGate = appearance.formEnabled ?? true;
  const inquiryAllowedForMode =
    mode !== "AI_ONLY" && (appearance.inquiryOptions?.length ?? 0) > 0;
  const needsPrechatGate = formEnabledForGate || inquiryAllowedForMode;
  const greetingMessage = useMemo(
    () => resolveEmbedGreetingMessage(appearance, welcomeText),
    [appearance, welcomeText],
  );
  /** Launcher-only greeting step when there is no pre-chat form / inquiry gate (welcome lives in the form otherwise). */
  const hasGreetingStep = !needsPrechatGate && greetingMessage.length > 0;
  const [greetingAck, setGreetingAck] = useState(
    () => !hasGreetingStep || readWelcomeAcknowledged(widgetKey),
  );

  useEffect(() => {
    setGreetingAck(!hasGreetingStep || readWelcomeAcknowledged(widgetKey));
  }, [widgetKey, hasGreetingStep]);

  useEffect(() => {
    launcherOpenRef.current = launcherOpen;
    if (launcherOpen) {
      setUnreadCount(0);
      setLauncherPreview("");
      if (sandboxMode) return;
      const sid = ensureVisitorSessionId(widgetKey);
      void (async () => {
        if (
          shouldSkipWidgetTrack({
            eventType: "widget_open",
            sessionId: sid,
            pageUrl: parentPageUrl,
          })
        ) {
          return;
        }
        const geo = await resolveClientGeoHints();
        const { trackWidgetAnalytics } = await import("@/services/chat/widget-visitor.api");
        await trackWidgetAnalytics(
          {
            websiteId,
            eventType: "widget_open",
            sessionId: sid,
            pageUrl: parentPageUrl,
            referrerUrl: typeof document !== "undefined" ? document.referrer : undefined,
            timezone: geo.clientTimezone,
            locale: geo.clientLocale,
            screenResolution: geo.clientScreenResolution,
            locationCity: geo.clientLocationCity,
            locationCountry: geo.clientLocationCountry,
            locationRegion: geo.clientLocationRegion,
            locationZipcode: geo.clientLocationZipcode,
          },
          sessionTokenRef.current,
        );
        markWidgetTrackSent({
          eventType: "widget_open",
          sessionId: sid,
          pageUrl: parentPageUrl,
        });
      })();
    } else {
      setPanelHeaderStatus(null);
    }
  }, [launcherOpen, websiteId, siteKey, parentPageUrl, sessionToken, sandboxMode]);

  useEffect(() => {
    if (!greetingAck) {
      setPanelHeaderStatus(null);
    }
  }, [greetingAck]);

  useEffect(() => {
    requestWidgetNotificationPermission();
  }, []);

  useEffect(() => {
    if (!websiteId || sandboxMode) return;
    const sid = ensureVisitorSessionId(widgetKey);
    void (async () => {
      if (
        shouldSkipWidgetTrack({
          eventType: "page_view",
          sessionId: sid,
          pageUrl: parentPageUrl,
        })
      ) {
        return;
      }
      const geo = await resolveClientGeoHints();
      const { trackWidgetAnalytics } = await import("@/services/chat/widget-visitor.api");
      await trackWidgetAnalytics(
        {
          websiteId,
          eventType: "page_view",
          sessionId: sid,
          pageUrl: parentPageUrl,
          referrerUrl: typeof document !== "undefined" ? document.referrer : undefined,
          timezone: geo.clientTimezone,
          locale: geo.clientLocale,
          screenResolution: geo.clientScreenResolution,
          locationCity: geo.clientLocationCity,
          locationCountry: geo.clientLocationCountry,
          locationRegion: geo.clientLocationRegion,
          locationZipcode: geo.clientLocationZipcode,
        },
        sessionTokenRef.current,
      );
      markWidgetTrackSent({
        eventType: "page_view",
        sessionId: sid,
        pageUrl: parentPageUrl,
      });
    })();
  }, [websiteId, siteKey, parentPageUrl, sandboxMode, widgetKey]);

  useEffect(() => {
    const hasPersistedConversation = Boolean(readConversationId(siteKey));
    if (
      !shouldRunWidgetAutoOpen({
        widgetKey,
        autoOpenEnabled: appearance.autoOpenEnabled,
        autoOpenDelaySeconds: appearance.autoOpenDelaySeconds,
        autoOpenOnReturnVisit: appearance.autoOpenOnReturnVisit,
        hasPersistedConversation,
      })
    ) {
      return;
    }
    const id = window.setTimeout(() => {
      unlockWidgetAudio();
      setLauncherOpen(true);
      postEmbedHostResize(true, appearance);
      markWidgetReturnVisit(widgetKey);
    }, appearance.autoOpenDelaySeconds * 1000);
    return () => window.clearTimeout(id);
  }, [
    appearance,
    siteKey,
    widgetKey,
  ]);

  const handleIncomingAlert = useCallback(
    (preview: string) => {
      const panelOpen = launcherOpenRef.current;
      const tabHidden = typeof document !== "undefined" && document.hidden;
      if (panelOpen && !tabHidden) return;

      const text = truncateNotificationPreview(preview);
      if (!text) return;

      if (!panelOpen) {
        setLauncherPreview(text);
        if (appearance.launcherBadgeMode !== "none") {
          setUnreadCount((c) => Math.min(99, c + 1));
        }
      }

      notifyWidgetIncoming(appearance, text, {
        launcherOpen: panelOpen,
        playSound: true,
      });
    },
    [appearance],
  );

  const acknowledgeGreeting = () => {
    setGreetingAck(true);
    writeWelcomeAcknowledged(widgetKey);
  };

  const closeLauncher = () => {
    setLauncherOpen(false);
    postEmbedHostResize(false, appearance);
    setGreetingAck(!hasGreetingStep || readWelcomeAcknowledged(widgetKey));
    markWidgetReturnVisit(widgetKey);
  };

  const { launcher, chatBox } = appearance;
  useEmbedHostResize(launcherOpen, appearance);

  const openLauncher = () => {
    unlockWidgetAudio();
    setLauncherOpen(true);
    postEmbedHostResize(true, appearance);
  };

  const toggleLauncher = () => {
    if (launcherOpen) closeLauncher();
    else openLauncher();
  };

  const panelAlign =
    launcher.position === "left"
      ? "flex-start"
      : launcher.position === "center"
        ? "center"
        : "flex-end";
  const sidePad = launcher.insetSidePx * 2;

  return (
    <Box
      sx={{
        position: "fixed",
        ...launcherEmbedRootSx(launcher.position),
        zIndex: 2147483000,
        display: "flex",
        flexDirection: "column",
        alignItems: panelAlign,
        gap: 1,
        width: "max-content",
        maxWidth: `calc(100vw - ${sidePad}px)`,
        background: "transparent",
        pointerEvents: "none",
        fontFamily:
          chatBox.fontFamily && chatBox.fontFamily !== "inherit"
            ? chatBox.fontFamily
            : (theme) => theme.typography.fontFamily,
      }}
    >
      <Box
        onPointerDown={() => unlockWidgetAudio()}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: panelAlign,
          gap: 1,
          pointerEvents: "auto",
          width: "max-content",
          maxWidth: `calc(100vw - ${sidePad}px)`,
        }}
      >
        {(launcherOpen || greetingAck) ? (
          <Paper
            elevation={0}
            sx={{
              transition: appearance.motionEnabled
                ? "opacity 0.22s ease, transform 0.22s ease"
                : undefined,
              width: chatBox.boxWidth,
              height: chatBox.boxHeight,
              maxWidth: `calc(100vw - ${sidePad}px)`,
              maxHeight: "min(85vh, calc(100vh - 96px))",
              display: launcherOpen ? "flex" : "none",
              flexDirection: "column",
              flexShrink: 0,
              ...embedPanelPaperSx(appearance),
            }}
            aria-hidden={!launcherOpen}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={0.5}
              sx={{
                px: 2,
                py: 1,
                bgcolor: chatBox.headerBg,
                color: chatBox.headerTextColor,
                gap: 0.5,
                minHeight: 40,
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{
                  letterSpacing: 0.02,
                  flex: 1,
                  minWidth: 0,
                  textAlign: panelHeaderStatus ? "left" : chatBox.headerAlign,
                  color: "inherit",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {chatBox.headerTitle}
              </Typography>
              {panelHeaderStatus ? (
                <EmbedChatHeaderStatusChip
                  appearance={appearance}
                  status={panelHeaderStatus}
                  onHeader
                />
              ) : null}
              <IconButton
                type="button"
                aria-label="Minimize widget"
                size="small"
                onClick={closeLauncher}
                sx={{ color: "inherit", flexShrink: 0 }}
              >
                <CloseRounded fontSize="small" />
              </IconButton>
            </Stack>

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                p: greetingAck ? 0 : appearance.densityTokens.panelPaddingPx / 8,
                bgcolor: chatBox.backgroundColor,
              }}
            >
              {!greetingAck ? (
                <Stack spacing={2} sx={{ pt: 0.5 }}>
                  <EmbedChatMediaBubbles appearance={appearance} />
                  <EmbedChatBubble appearance={appearance} role="greeting">
                    {greetingMessage}
                  </EmbedChatBubble>
                  <EmbedActionButton
                    type="button"
                    appearance={appearance}
                    fullWidth
                    onClick={acknowledgeGreeting}
                  >
                    Continue
                  </EmbedActionButton>
                </Stack>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    minHeight: 0,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      minHeight: 0,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <WidgetChatPanel
                      embedded
                      greetingAlreadyShown={needsPrechatGate}
                      widgetKey={widgetKey}
                      websiteId={websiteId}
                      parentPageUrl={parentPageUrl}
                      mode={mode}
                      sessionToken={sessionToken}
                      configRecord={configRecord}
                      appearance={appearance}
                      launcherOpenRef={launcherOpenRef}
                      sandboxMode={sandboxMode}
                      onIncomingWhileClosed={handleIncomingAlert}
                      onHeaderStatusChange={setPanelHeaderStatus}
                    />
                  </Box>
                  {textUsBelow ? (
                    <Box sx={{ px: 1.25, pb: 1.5 }}>
                      <Divider sx={{ my: 1.5 }} />
                      {textUsBelow}
                    </Box>
                  ) : null}
                </Box>
              )}
            </Box>
          </Paper>
        ) : null}

        {!launcherOpen && launcherPreview ? (
          <Paper
            elevation={0}
            onClick={openLauncher}
            sx={embedTeaserPreviewSx(appearance)}
          >
            <Typography variant="caption" sx={{ display: "block", fontWeight: 600, mb: 0.25 }}>
              New message
            </Typography>
            <Typography variant="body2" sx={{ fontSize: 13 }}>
              {launcherPreview}
            </Typography>
          </Paper>
        ) : !launcherOpen && launcher.proactiveTeaserActive ? (
          <WidgetProactiveTeaserBubble
            text={launcher.proactiveTeaser}
            avatarUrl={launcher.proactiveTeaserAvatarUrl}
            secondaryCta={launcher.proactiveSecondaryCta}
            onOpenChat={openLauncher}
            backgroundColor="#ffffff"
            textColor={appearance.bodyTextColor}
            motionEnabled={appearance.motionEnabled}
          />
        ) : null}

        <Badge
          overlap="circular"
          invisible={
            launcherOpen ||
            appearance.launcherBadgeMode === "none" ||
            (appearance.launcherBadgeMode === "count" && unreadCount <= 0) ||
            (appearance.launcherBadgeMode === "dot" && unreadCount <= 0)
          }
          badgeContent={
            appearance.launcherBadgeMode === "count" && unreadCount > 0
              ? unreadCount > 9
                ? "9+"
                : unreadCount
              : undefined
          }
          variant={appearance.launcherBadgeMode === "dot" ? "dot" : "standard"}
          sx={{
            "& .MuiBadge-badge": {
              bgcolor: launcher.buttonHoverColor,
              color: "#fff",
              fontWeight: 700,
            },
          }}
        >
          <IconButton
            type="button"
            disableRipple
            disableFocusRipple
            aria-label={
              launcherOpen
                ? "Close widget window"
                : unreadCount > 0
                  ? `Open chat, ${unreadCount} new message${unreadCount === 1 ? "" : "s"}`
                  : launcher.buttonLabel?.trim() || "Open chat widget"
            }
            onClick={toggleLauncher}
            sx={embedLauncherFabSx(appearance, launcher.shape, EMBED_LAUNCHER_SIZE_PX)}
          >
            {launcherOpen ? (
              <CloseRounded sx={{ fontSize: 28 }} />
            ) : launcher.iconUrl ? (
              <Box
                component="img"
                src={launcher.iconUrl}
                alt=""
                sx={{ width: 30, height: 30, objectFit: "contain", display: "block" }}
              />
            ) : launcher.iconPreset ? (
              <LauncherPresetIcon
                presetId={launcher.iconPreset}
                color={launcher.iconColor}
                fontSizePx={30}
              />
            ) : (
              <ChatRounded sx={{ fontSize: 30 }} />
            )}
          </IconButton>
        </Badge>
      </Box>
    </Box>
  );
}

/** Text-only widget uses the same launcher + welcome → form flow */
function FloatingTextUsEmbed({
  widgetKey,
  welcomeText,
  websiteId,
  parentPageUrl,
  sessionToken,
  textUsFormConfig,
}: {
  widgetKey: string;
  welcomeText: string;
  websiteId: string;
  parentPageUrl: string;
  sessionToken: string;
  textUsFormConfig: Record<string, unknown>;
}) {
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [welcomeAck, setWelcomeAck] = useState(false);

  useEffect(() => {
    setWelcomeAck(readWelcomeAcknowledged(`${widgetKey}:textUs`));
  }, [widgetKey]);

  const acknowledgeWelcome = () => {
    setWelcomeAck(true);
    writeWelcomeAcknowledged(`${widgetKey}:textUs`);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2147483000,
        fontFamily: (theme) => theme.typography.fontFamily,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          right: 16,
          bottom: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 1,
          pointerEvents: "auto",
          maxWidth: "calc(100vw - 32px)",
        }}
      >
        {launcherOpen ? (
          <Paper
            elevation={12}
            sx={{
              width: "min(392px, calc(100vw - 32px))",
              maxHeight: "min(520px, 85vh)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderRadius: 2,
              bgcolor: "background.paper",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 2, py: 1.25, borderBottom: 1, borderColor: "divider" }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                Text us
              </Typography>
              <IconButton
                type="button"
                aria-label="Minimize widget"
                size="small"
                onClick={() => setLauncherOpen(false)}
              >
                <CloseRounded fontSize="small" />
              </IconButton>
            </Stack>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: welcomeAck ? 1.25 : 2 }}>
              {!welcomeAck ? (
                <Stack spacing={2} sx={{ pt: 0.5 }}>
                  <Typography variant="body1" fontWeight={600}>
                    {welcomeText || "Drop us a message"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Continue to open the form and send us a note.
                  </Typography>
                  <MuiButton type="button" variant="contained" fullWidth onClick={acknowledgeWelcome}>
                    Continue
                  </MuiButton>
                </Stack>
              ) : (
                <WidgetTextUsPanel
                  embedded
                  websiteId={websiteId}
                  parentPageUrl={parentPageUrl}
                  sessionToken={sessionToken}
                  widgetKey={widgetKey}
                  textUsFormConfig={textUsFormConfig}
                />
              )}
            </Box>
          </Paper>
        ) : null}

        <IconButton
          type="button"
          aria-label={launcherOpen ? "Close widget window" : "Open Text us widget"}
          onClick={() => setLauncherOpen((o) => !o)}
          sx={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            bgcolor: "secondary.main",
            color: "secondary.contrastText",
            boxShadow: "none",
            overflow: "hidden",
            "&:hover": {
              bgcolor: "secondary.dark",
              color: "secondary.contrastText",
              boxShadow: "none",
            },
          }}
        >
          {launcherOpen ? (
            <CloseRounded sx={{ fontSize: 28 }} />
          ) : (
            <ChatRounded sx={{ fontSize: 30 }} />
          )}
        </IconButton>
      </Box>
    </Box>
  );
}

/** Text-us fields live under runtime `textUsFormConfig` or PATCH `config.form.fields`. */
function resolveTextUsFormBinding(
  cfg: Record<string, unknown>,
): Record<string, unknown> {
  const direct = cfg.textUsFormConfig;
  if (direct !== undefined && typeof direct === "object" && !Array.isArray(direct)) {
    return direct as Record<string, unknown>;
  }
  const form = cfg.form as Record<string, unknown> | undefined;
  if (form !== undefined && Array.isArray(form.fields)) {
    return { fields: form.fields };
  }
  return {};
}

function WidgetSurfaces({
  widgetKey,
  parentPageUrl,
  envelope,
  sessionToken,
  sandboxMode = false,
}: {
  widgetKey: string;
  parentPageUrl: string;
  envelope: WidgetConfigEnvelope;
  sessionToken: string;
  sandboxMode?: boolean;
}) {
  const chatOn =
    envelope.surfaces?.chatEnabled !== false &&
    envelope.featureFlags?.chat !== false;
  const textOn =
    envelope.surfaces?.textUsEnabled !== false &&
    envelope.featureFlags?.textUs !== false;

  const configRecord = resolveRuntimeConfigRecord(envelope);
  const appearance = extractRuntimeChatAppearance(configRecord);

  const mode = String(
    configRecord.mode ?? envelope.chatMode ?? "AGENT_ONLY",
  ).toUpperCase();

  const welcome = appearance.welcomeMessage;
  const websiteId = typeof envelope.websiteId === "string" ? envelope.websiteId : "";
  const textUsForm = resolveTextUsFormBinding(configRecord);

  if (chatOn) {
    return (
      <EmbedWidgetTheme appearance={appearance}>
        <FloatingChatEmbed
          widgetKey={widgetKey}
          welcomeText={welcome}
          websiteId={websiteId}
          parentPageUrl={parentPageUrl}
          mode={mode}
          sessionToken={sessionToken}
          configRecord={configRecord}
          appearance={appearance}
          sandboxMode={sandboxMode}
          textUsBelow={
            textOn ? (
              <WidgetTextUsPanel
                embedded
                widgetKey={widgetKey}
                websiteId={websiteId}
                parentPageUrl={parentPageUrl}
                sessionToken={sessionToken}
                textUsFormConfig={textUsForm}
                appearance={appearance}
              />
            ) : undefined
          }
        />
      </EmbedWidgetTheme>
    );
  }

  if (textOn) {
    return (
      <FloatingTextUsEmbed
        widgetKey={widgetKey}
        welcomeText={welcome || "How can we help?"}
        websiteId={websiteId}
        parentPageUrl={parentPageUrl}
        sessionToken={sessionToken}
        textUsFormConfig={textUsForm}
      />
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary">
        No surfaces enabled for this widget.
      </Typography>
    </Box>
  );
}

function WidgetChatPanel({
  embedded = false,
  greetingAlreadyShown = false,
  widgetKey,
  websiteId,
  parentPageUrl,
  mode,
  sessionToken,
  configRecord,
  appearance,
  launcherOpenRef,
  sandboxMode = false,
  onIncomingWhileClosed,
  onHeaderStatusChange,
}: {
  embedded?: boolean;
  /** Greeting bubble was shown in the launcher shell before this panel. */
  greetingAlreadyShown?: boolean;
  widgetKey: string;
  websiteId: string;
  parentPageUrl: string;
  mode: string;
  sessionToken: string;
  configRecord: Record<string, unknown>;
  appearance?: RuntimeChatAppearance;
  launcherOpenRef?: MutableRefObject<boolean>;
  sandboxMode?: boolean;
  onIncomingWhileClosed?: (preview: string) => void;
  onHeaderStatusChange?: (status: EmbedPanelHeaderStatus | null) => void;
}) {
  const sendPlaceholder =
    appearance?.chatBox.sendPlaceholder ?? "Write a message…";
  const panelBg = appearance?.chatBox.backgroundColor;
  const accentColor = appearance?.launcher.buttonColor;
  const siteKey = `${widgetKey}:${websiteId}`;
  const persistenceKey = sandboxMode ? `sandbox:${siteKey}` : siteKey;
  const fields = useMemo(
    () => extractPrechatFieldsFromWidgetConfig(configRecord),
    [configRecord],
  );
  const schema = useMemo(() => buildDynamicPrechatZod(fields), [fields]);

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultFormValues(fields) as FormValues,
  });

  const formEnabled = appearance?.formEnabled ?? true;
  const inquiryOptions: RuntimeInquiryOption[] = appearance?.inquiryOptions ?? [];
  const hasInquiryStep =
    mode !== "AI_ONLY" && inquiryOptions.length > 0;
  const inquiryRequired = appearance?.inquiryRequired ?? false;
  const inquiryFallback = appearance?.inquiryFallback ?? null;
  const inquirySkipLabel = appearance?.inquirySkipLabel ?? "General question";
  const needsPrechatGate = formEnabled || hasInquiryStep;
  const [prechatDone, setPrechatDone] = useState(!needsPrechatGate);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formValidationHint, setFormValidationHint] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<RuntimeInquiryOption | null>(
    null,
  );
  const [inquiryPickError, setInquiryPickError] = useState(false);

  useEffect(() => {
    setPrechatDone(!needsPrechatGate);
    setSelectedInquiry(null);
    setInquiryPickError(false);
    if (!appearance?.consentRequired) setConsentAccepted(true);
  }, [needsPrechatGate, hasInquiryStep, appearance?.consentRequired]);
  const [aiPending, setAiPending] = useState(false);
  const aiPendingSinceRef = useRef<number | null>(null);
  /** HYBRID only: set true when visitor taps Talk to agent — never from API shouldEscalate (that was forcing queue UI + repeated handoff replies). */
  const [escalated, setEscalated] = useState(false);
  const escalatedRef = useRef(false);
  const [talkToAgentStatus, setTalkToAgentStatus] = useState<string | null>(null);
  const [talkToAgentBusy, setTalkToAgentBusy] = useState(false);
  const [localAiMessages, setLocalAiMessages] = useState<ChatMessage[]>([]);
  const [prechatTranscriptBubble, setPrechatTranscriptBubble] = useState<string | null>(null);
  /** API `firstMessage` on create — hidden from transcript; not sent to AI as a user question. */
  const prechatApiFirstMessageRef = useRef<string | null>(null);
  /** AI/HYBRID: hide socket AI replies until the visitor sends a composer message. */
  const [awaitingFirstUserQuestion, setAwaitingFirstUserQuestion] = useState(false);
  const awaitingFirstUserQuestionRef = useRef(false);
  const startConversationRef = useRef<(() => Promise<void>) | null>(null);
  const [resumeChecked, setResumeChecked] = useState(false);

  const visitorSessionId = useMemo(() => {
    const existing = readVisitorSessionId(persistenceKey);
    if (existing) return existing;
    const created = generateClientSessionId();
    persistVisitorSessionId(persistenceKey, created);
    return created;
  }, [persistenceKey]);

  const pageUrlGetter = useCallback(() => parentPageUrl, [parentPageUrl]);

  useEffect(() => {
    escalatedRef.current = escalated;
  }, [escalated]);

  const refreshTranscriptRef = useRef<(() => Promise<void>) | null>(null);

  const chat = useVisitorChat({
    autoConnect: false,
    widgetSessionToken: sessionToken,
    websiteId,
    getCurrentPageUrl: pageUrlGetter,
    getSkipServerAiReply: () => escalatedRef.current,
    onSupervisorControl: () => {
      void refreshTranscriptRef.current?.();
    },
    onIncomingReply: (message) => {
      const role = (message.role || "").toLowerCase();
      if (role === "agent") {
        setAwaitingFirstUserQuestion(false);
      }
      if (!onIncomingWhileClosed) return;
      /** AI socket payloads normalize to `system`; agent stays `agent`. */
      if (role !== "agent" && role !== "system") return;
      const panelOpen = launcherOpenRef?.current === true;
      const tabHidden = typeof document !== "undefined" && document.hidden;
      if (panelOpen && !tabHidden) return;
      const text = message.content?.trim();
      if (text) onIncomingWhileClosed(text);
    },
    onChatAssigned: () => {
      setAwaitingFirstUserQuestion(false);
      if (mode === "HYBRID") {
        setEscalated(true);
        escalatedRef.current = true;
        setLocalAiMessages([]);
      }
      setTalkToAgentStatus("An agent has joined your chat.");
    },
    onChatQueued: () => {
      setTalkToAgentStatus(
        "You are in the queue. The next available teammate will join shortly.",
      );
    },
  });

  useEffect(() => {
    refreshTranscriptRef.current = chat.refreshTranscript;
  }, [chat.refreshTranscript]);

  useEffect(() => {
    const stored = readHybridEscalatedConversationId(persistenceKey);
    if (stored && chat.conversationId && stored === chat.conversationId) {
      setEscalated(true);
      escalatedRef.current = true;
      setLocalAiMessages([]);
    }
  }, [chat.conversationId, persistenceKey]);

  const { resumeConversation, loadTranscript } = chat;

  useEffect(() => {
    if (chat.conversationId) {
      setResumeChecked(true);
      return;
    }
    let cancelled = false;
    const storedConvId = readConversationId(persistenceKey);
    if (!storedConvId) {
      setResumeChecked(true);
      return;
    }
    void (async () => {
      const res = await loadTranscript(storedConvId);
      if (cancelled) return;
      if (!res.ok) {
        clearConversationId(persistenceKey);
        setResumeChecked(true);
        return;
      }
      const { data } = res;
      if (data.chatCompleted || !data.canSendMessages) {
        clearConversationId(persistenceKey);
        setResumeChecked(true);
        return;
      }
      resumeConversation({
        conversationId: storedConvId,
        visitorId: data.visitor?.id ?? null,
        status: data.status,
        messages: data.messages,
      });
      persistConversationId(persistenceKey, storedConvId);
      if (data.talkToAgentRequested || data.handoverRequested) {
        setEscalated(true);
        escalatedRef.current = true;
        setLocalAiMessages([]);
      }
      const hasVisitorTurn = data.messages.some(
        (m) => (m.senderType || "").toLowerCase() === "visitor",
      );
      if (hasVisitorTurn) {
        setAwaitingFirstUserQuestion(false);
      }
      const visitor = data.visitor;
      if (visitor?.name?.trim() || visitor?.email?.trim()) {
        setPrechatDone(true);
      } else if (!needsPrechatGate) {
        setPrechatDone(true);
      }
      if (data.queuedForAgent) {
        setTalkToAgentStatus(
          "You are in the queue. The next available teammate will join shortly.",
        );
      } else if (data.assignedAgentId) {
        setAwaitingFirstUserQuestion(false);
        if (data.talkToAgentRequested || data.handoverRequested || mode === "HYBRID") {
          setEscalated(true);
          escalatedRef.current = true;
        }
        setTalkToAgentStatus("An agent has joined your chat.");
      }
      setResumeChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    chat.conversationId,
    mode,
    needsPrechatGate,
    resumeConversation,
    loadTranscript,
    sessionToken,
    siteKey,
    websiteId,
  ]);

  useEffect(() => {
    if (!aiPending) return;
    const since = aiPendingSinceRef.current;
    if (!since) return;
    const gotAi = chat.messages.some((m) => {
      if (m.role !== "system") return false;
      if (!m.createdAt) return true;
      return new Date(m.createdAt).getTime() >= since - 800;
    });
    if (gotAi) {
      setAiPending(false);
      aiPendingSinceRef.current = null;
    }
  }, [aiPending, chat.messages]);

  const mergeDisplayMessages = useMemo(() => {
    const map = new Map<string, ChatMessage>();
    const add = (m: ChatMessage) => {
      const k = m.id ?? `${m.role}-${m.createdAt}-${m.content}`;
      map.set(k, m);
    };
    const localAiContents = new Set(
      localAiMessages.map((m) => m.content?.trim()).filter(Boolean),
    );
    const apiBootstrap = prechatApiFirstMessageRef.current;
    for (const m of chat.messages) {
      if (isHiddenFromVisitorWidget(m)) {
        continue;
      }
      if (
        m.role === "visitor" &&
        isPrechatBootstrapVisitorMessage(m.content, apiBootstrap)
      ) {
        continue;
      }
      /** Hide AI lines until the visitor sends a composer message; never hide human agents. */
      if (awaitingFirstUserQuestion && (m.role === "system" || m.role === "ai")) {
        continue;
      }
      if (escalated && (m.role === "system" || m.role === "ai") && !isVisitorPolicyNoticeMessage(m)) {
        continue;
      }
      if (
        (m.role === "system" || m.role === "ai" || m.role === "agent") &&
        m.content &&
        localAiContents.has(m.content.trim())
      ) {
        continue;
      }
      add(m);
    }
    localAiMessages.forEach(add);
    const hasVisitorTurn = [...map.values()].some((m) => m.role === "visitor");
    if (prechatTranscriptBubble?.trim() && !hasVisitorTurn) {
      add({
        id: "prechat-display",
        role: "visitor",
        content: prechatTranscriptBubble.trim(),
        createdAt: new Date().toISOString(),
        conversationId: chat.conversationId ?? "",
      });
    }
    return [...map.values()].sort((a, b) =>
      String(a.createdAt).localeCompare(String(b.createdAt)),
    );
  }, [awaitingFirstUserQuestion, chat.messages, chat.conversationId, escalated, localAiMessages, prechatTranscriptBubble]);

  const assistantHandlesChat =
    mode === "AI_ONLY" || (mode === "HYBRID" && !escalated);
  const needsAgentSocket =
    mode === "AGENT_ONLY" || (mode === "HYBRID" && escalated);
  const hasActiveConversation = Boolean(chat.conversationId);
  const showOfflineBanner =
    needsAgentSocket &&
    !chat.isConnected &&
    Boolean(appearance?.offlineMessage?.trim());
  const statusLabel = assistantHandlesChat && hasActiveConversation
    ? aiPending
      ? "Assistant"
      : "Live"
    : !chat.isConnected && appearance?.offlineMessage?.trim()
      ? "Offline"
      : chat.isConnected
        ? "Live"
        : hasActiveConversation
          ? "Live"
          : "Connecting…";

  const headerStatus = useMemo(() => {
    if (!appearance) return null;
    return resolveEmbedPanelHeaderStatus({
      showOfflineBanner,
      offlineMessage: appearance.offlineMessage,
      talkToAgentStatus,
      agentTypingSeen: chat.agentTypingSeen,
      aiPending,
      hybridEscalatedWaiting: mode === "HYBRID" && escalated && !talkToAgentStatus,
      statusLabel,
    });
  }, [
    aiPending,
    appearance,
    chat.agentTypingSeen,
    escalated,
    talkToAgentStatus,
    mode,
    showOfflineBanner,
    statusLabel,
  ]);

  useEffect(() => {
    onHeaderStatusChange?.(embedded ? headerStatus : null);
  }, [embedded, headerStatus, onHeaderStatusChange]);

  const appendAiAssistant = (
    conversationId: string,
    text: string | undefined,
    meta?: Record<string, unknown>,
  ) => {
    const content = typeof text === "string" ? text : "";
    setLocalAiMessages((prev) => [
      ...prev,
      {
        conversationId,
        role: "agent",
        content,
        createdAt: new Date().toISOString(),
        id: `ai-${Date.now()}`,
        ...(meta ? { metadata: meta } : {}),
      },
    ]);
  };

  const beginConversation = useCallback(
    async (values: Record<string, unknown>) => {
      if (chat.conversationId) {
        setPrechatDone(true);
        return;
      }
      if (!websiteId.trim()) {
        setSubmitError("This widget is not linked to a website yet.");
        return;
      }
      setSubmitError(null);
      setFormValidationHint(null);
      setSubmitBusy(true);
      try {
        const effectiveInquiry =
          selectedInquiry ?? (!inquiryRequired && inquiryFallback ? inquiryFallback : null);
        const { visitor, firstMessage } = buildVisitorPayloadParts(
          values,
          fields,
          visitorSessionId,
          effectiveInquiry?.label,
        );
        const routingTargets = effectiveInquiry
          ? resolveInquiryRoutingTargets(effectiveInquiry)
          : {
              departmentId: null,
              poolId: null,
              serviceChannel: "internal" as const,
            };
        const geo = await resolveClientGeoHints();
        const created = await chat.startConversation({
          websiteId,
          visitor,
          firstMessage,
          currentPageUrl: parentPageUrl,
          referrerUrl: typeof document !== "undefined" ? document.referrer : "",
          clientTimezone: geo.clientTimezone,
          clientLocale: geo.clientLocale,
          clientScreenResolution: geo.clientScreenResolution,
          clientLocationCity: geo.clientLocationCity,
          clientLocationCountry: geo.clientLocationCountry,
          clientLocationRegion: geo.clientLocationRegion,
          clientLocationZipcode: geo.clientLocationZipcode,
          routingKey: effectiveInquiry?.routingKey,
          serviceChannel:
            routingTargets.serviceChannel === "external" ? "External" : "Internal",
          inquiryDepartmentId: optionalUuid(routingTargets.departmentId),
          inquiryPoolId: optionalUuid(routingTargets.poolId),
          inquiryLabel: effectiveInquiry?.label,
          deferInitialAiReply: mode === "AI_ONLY" || mode === "HYBRID",
          ...(sandboxMode ? { sandbox: true } : {}),
        });
        persistConversationId(persistenceKey, created.conversationId);
        if (created.resumed) {
          if (created.talkToAgentRequested || created.handoverRequested) {
            setEscalated(true);
            escalatedRef.current = true;
            setLocalAiMessages([]);
          }
          const tr = await chat.loadTranscript(created.conversationId);
          if (tr.ok) {
            chat.resumeConversation({
              conversationId: created.conversationId,
              visitorId: tr.data.visitor?.id ?? created.visitorId,
              status: tr.data.status,
              messages: tr.data.messages,
            });
            if (
              tr.data.messages.some(
                (m) => (m.senderType || "").toLowerCase() === "visitor",
              )
            ) {
              setAwaitingFirstUserQuestion(false);
            }
          }
          setPrechatDone(true);
          return;
        }
        prechatApiFirstMessageRef.current = firstMessage;
        setPrechatTranscriptBubble(
          buildVisitorTranscriptDisplay(
            values as Record<string, unknown>,
            fields,
            effectiveInquiry?.label,
          ),
        );
        if (mode === "AI_ONLY" || mode === "HYBRID") {
          setAwaitingFirstUserQuestion(true);
          appendAiAssistant(
            created.conversationId,
            resolvePersonalizedAssistantWelcome(
              visitor.name ?? "there",
              appearance?.firstMessage,
            ),
            { kind: "assistantWelcome" },
          );
        }
        setPrechatDone(true);
      } catch (err) {
        setSubmitError(
          err instanceof Error
            ? err.message
            : "Could not start chat. Please try again.",
        );
      } finally {
        setSubmitBusy(false);
      }
    },
    [
      appearance?.firstMessage,
      chat,
      fields,
      mode,
      parentPageUrl,
      selectedInquiry,
      inquiryRequired,
      inquiryFallback,
      sessionToken,
      siteKey,
      visitorSessionId,
      websiteId,
    ],
  );

  startConversationRef.current = async () => {
    await beginConversation(buildDefaultFormValues(fields) as Record<string, unknown>);
  };

  useEffect(() => {
    if (
      !resumeChecked ||
      needsPrechatGate ||
      prechatDone ||
      chat.conversationId
    ) {
      return;
    }
    void startConversationRef.current?.();
  }, [resumeChecked, needsPrechatGate, prechatDone, chat.conversationId]);

  const onPrechatSubmit = form.handleSubmit(
    async (values) => {
      if (hasInquiryStep && inquiryRequired && !selectedInquiry) {
        setInquiryPickError(true);
        return;
      }
      setInquiryPickError(false);
      await beginConversation(values as Record<string, unknown>);
    },
    () => {
      setFormValidationHint("Please fill in all required fields.");
    },
  );

  const proceedWithInquirySkip = () => {
    if (!inquiryFallback) return;
    setSelectedInquiry(inquiryFallback);
    setInquiryPickError(false);
    if (!formEnabled) {
      void beginConversation(buildDefaultFormValues(fields) as Record<string, unknown>);
    }
  };

  const [draft, setDraft] = useState("");
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const visitorTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollTranscriptToBottom = useCallback((instant = true) => {
    const el = messageListRef.current;
    if (!el) return;
    if (instant) {
      el.scrollTop = el.scrollHeight;
      return;
    }
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  useLayoutEffect(() => {
    if (!prechatDone) return;
    scrollTranscriptToBottom(true);
  }, [
    mergeDisplayMessages,
    prechatDone,
    aiPending,
    chat.agentTypingSeen,
    talkToAgentStatus,
    scrollTranscriptToBottom,
  ]);

  /** Keep view pinned to latest while composing (focus/layout was jumping scroll up). */
  useLayoutEffect(() => {
    if (!prechatDone || !draft) return;
    scrollTranscriptToBottom(true);
  }, [draft, prechatDone, scrollTranscriptToBottom]);

  useEffect(() => {
    awaitingFirstUserQuestionRef.current = awaitingFirstUserQuestion;
  }, [awaitingFirstUserQuestion]);

  const onDraftChange = useCallback(
    (value: string) => {
      setDraft(value);
      if (!chat.conversationId) return;
      if (visitorTypingTimerRef.current) {
        clearTimeout(visitorTypingTimerRef.current);
      }
      visitorTypingTimerRef.current = setTimeout(() => {
        visitorTypingTimerRef.current = null;
        if (value.trim()) {
          chat.emitTyping(value);
        } else {
          chat.emitStopTyping();
        }
      }, 300);
    },
    [chat],
  );

  const sendDraft = async () => {
    const text = normalizeChatMessageText(draft);
    if (!text || !chat.conversationId) return;

    if (awaitingFirstUserQuestion) {
      awaitingFirstUserQuestionRef.current = false;
      setAwaitingFirstUserQuestion(false);
    }

    /** HYBRID: AI replies until the visitor taps Talk to agent; then only visitor→agent messages run until an agent joins. */
    const shouldUseAiBridge =
      mode === "AI_ONLY" || (mode === "HYBRID" && !escalated);

    chat.emitStopTyping();
    setDraft("");
    if (shouldUseAiBridge) {
      setAiPending(true);
      aiPendingSinceRef.current = Date.now();
    }
    await chat.sendMessage(text);
    scrollTranscriptToBottom(true);
    if (!shouldUseAiBridge) {
      setAiPending(false);
      aiPendingSinceRef.current = null;
    }
  };

  const runTalkToAgent = async () => {
    if (!chat.conversationId || talkToAgentBusy) return;
    setTalkToAgentBusy(true);
    setEscalated(true);
    escalatedRef.current = true;
    setLocalAiMessages([]);
    if (chat.conversationId) {
      persistHybridEscalated(siteKey, chat.conversationId);
    }
    setTalkToAgentStatus(null);
    const res = await chat.requestTalkToAgent();
    setTalkToAgentBusy(false);
    if (res.ok) {
      setTalkToAgentStatus(res.data.message);
      if (res.data.talkToAgentRequested || res.data.handoverRequested) {
        setEscalated(true);
        escalatedRef.current = true;
        if (chat.conversationId) {
          persistHybridEscalated(siteKey, chat.conversationId);
        }
      }
    } else {
      setEscalated(false);
      escalatedRef.current = false;
      setTalkToAgentStatus(res.message || "Could not reach a teammate right now.");
    }
  };

  const embedContainerSx: SxProps<Theme> = embedded
    ? {
        border: "none",
        borderRadius: 0,
        p: 0,
        bgcolor: "transparent",
        boxShadow: "none",
        flex: 1,
        minHeight: 0,
        overflowY: "auto" as const,
        overflowX: "hidden" as const,
        display: "flex",
        flexDirection: "column",
      }
    : {
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        bgcolor: "background.paper",
      };

  if (!prechatDone) {
    const panelWelcome = appearance
      ? resolveEmbedGreetingMessage(appearance).trim()
      : "";
    const chatWelcome = appearance?.firstMessage?.trim() ?? "";
    const showPrechatForm = formEnabled;

    return (
      <Box
        sx={[
          embedContainerSx,
          appearance ? { color: appearance.colors.bodyText } : {},
        ]}
      >
        <Stack spacing={1.25} sx={{ width: "100%", alignItems: "stretch" }}>
          {appearance ? <EmbedChatMediaBubbles appearance={appearance} /> : null}
          {appearance && panelWelcome ? (
            <EmbedChatBubble appearance={appearance} role="greeting">
              {panelWelcome}
            </EmbedChatBubble>
          ) : null}
          {appearance && chatWelcome && chatWelcome !== panelWelcome ? (
            <EmbedChatBubble appearance={appearance} role="assistant">
              {chatWelcome}
            </EmbedChatBubble>
          ) : null}

          <Box
            component={showPrechatForm ? "form" : "div"}
            onSubmit={showPrechatForm ? onPrechatSubmit : undefined}
            sx={appearance ? embedPrechatFormBubbleShellSx() : { width: "100%" }}
          >
            <Box sx={appearance ? embedPrechatFormBubbleInnerSx(appearance) : { width: "100%" }}>
            <Stack spacing={1 * (appearance?.densityTokens.stackGapMultiplier ?? 1)}>
              {appearance?.form.title?.trim() || !hasInquiryStep ? (
                <Box>
                  <Typography
                    variant="subtitle2"
                    component="p"
                    sx={{
                      m: 0,
                      mb: appearance?.form.subtitle ? 0.35 : 0,
                      fontWeight: 600,
                      color: "inherit",
                      fontFamily: appearance?.colors.fontFamily,
                      fontSize: appearance?.colors.bodyFontSizePx,
                    }}
                  >
                    {appearance?.form.title?.trim() || "Before we start"}
                  </Typography>
                  {appearance?.form.subtitle ? (
                    <Typography
                      variant="body2"
                      component="p"
                      sx={{
                        m: 0,
                        opacity: 0.88,
                        color: "inherit",
                        fontFamily: appearance?.colors.fontFamily,
                        fontSize: appearance?.colors.bodyFontSizePx,
                      }}
                    >
                      {appearance.form.subtitle}
                    </Typography>
                  ) : null}
                </Box>
              ) : null}

              {hasInquiryStep && appearance ? (
                <Box>
                  <Typography
                    variant="body2"
                    component="p"
                    sx={{ m: 0, mb: 0.75, color: "inherit", fontFamily: appearance.colors.fontFamily }}
                  >
                    {`What would you like help with?${inquiryRequired ? " (pick one)" : ""}`}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={appearance.densityTokens.stackGapMultiplier ?? 1}
                    flexWrap="wrap"
                    sx={{ mt: 0.75, mb: 0.25 }}
                  >
                    {inquiryOptions.map((opt) => (
                      <MuiButton
                        key={`${opt.routingKey}-${opt.label}`}
                        type="button"
                        variant="outlined"
                        onClick={() => {
                          setSelectedInquiry(opt);
                          setInquiryPickError(false);
                          if (!formEnabled) {
                            void beginConversation(
                              buildDefaultFormValues(fields) as Record<string, unknown>,
                            );
                          }
                        }}
                        sx={embedInquiryPillSx(
                          appearance,
                          selectedInquiry?.routingKey === opt.routingKey,
                        )}
                      >
                        {opt.label}
                      </MuiButton>
                    ))}
                  </Stack>
                  {!inquiryRequired && inquiryFallback ? (
                    <MuiButton
                      type="button"
                      variant="text"
                      size="small"
                      onClick={proceedWithInquirySkip}
                      sx={{ mt: 0.25, textTransform: "none", color: appearance.colors.mutedText }}
                    >
                      {inquirySkipLabel}
                    </MuiButton>
                  ) : null}
                  {inquiryPickError ? (
                    <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
                      Please choose a topic to continue.
                    </Typography>
                  ) : null}
                </Box>
              ) : null}

              {showPrechatForm
                ? fields.map((f) => (
                    <PrechatFieldRenderer
                      key={f.key}
                      field={f}
                      control={form.control}
                      appearance={appearance}
                    />
                  ))
                : null}
          {appearance?.consentRequired ? (
            <FormControlLabel
              sx={{ alignItems: "flex-start", m: 0 }}
              control={
                <Checkbox
                  size="small"
                  checked={consentAccepted}
                  onChange={(_, checked) => setConsentAccepted(checked)}
                  sx={{
                    pt: 0.25,
                    color: appearance.launcher.buttonColor,
                    "&.Mui-checked": { color: appearance.launcher.buttonColor },
                  }}
                />
              }
              label={
                <Typography variant="caption" sx={embedMutedTextSx(appearance)}>
                  {appearance.consentText}
                  {appearance.privacyPolicyUrl ? (
                    <>
                      {" "}
                      <Link
                        href={appearance.privacyPolicyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: appearance.launcher.buttonColor }}
                      >
                        Privacy policy
                      </Link>
                    </>
                  ) : null}
                </Typography>
              }
            />
          ) : null}
          {appearance?.privacyNotice?.trim() && !appearance.consentRequired ? (
            <Typography variant="caption" sx={embedMutedTextSx(appearance)}>
              {appearance.privacyNotice}
            </Typography>
          ) : null}
              {formValidationHint ? (
                <Typography variant="caption" color="error" sx={{ display: "block" }}>
                  {formValidationHint}
                </Typography>
              ) : null}
              {submitError ? (
                <Typography variant="caption" color="error" sx={{ display: "block" }}>
                  {submitError}
                </Typography>
              ) : null}
              {showPrechatForm && appearance ? (
                <EmbedActionButton
                  type="submit"
                  appearance={appearance}
                  fullWidth
                  disabled={
                    submitBusy ||
                    (appearance.consentRequired ? !consentAccepted : false)
                  }
                  sx={{ mt: 0.5 }}
                >
                  {submitBusy
                    ? "Starting…"
                    : appearance.form.submitLabel ?? "Start chat"}
                </EmbedActionButton>
              ) : null}
            </Stack>
            </Box>
          </Box>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={
        embedded && appearance
          ? embedEmbeddedChatPanelSx(appearance)
          : embedded
            ? {
                border: "none",
                borderRadius: 0,
                p: 1,
                bgcolor: "transparent",
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
                gap: 0.75,
              }
            : {
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 1.5,
                bgcolor: panelBg ?? "background.paper",
                display: "flex",
                flexDirection: "column",
                gap: 1,
                minHeight: 320,
              }
      }
    >
      {!embedded && appearance ? (
        <EmbedChatPanelHeaderRow
          appearance={appearance}
          title={appearance.chatBox.headerTitle || "Conversation"}
          status={headerStatus}
        />
      ) : null}

      <Stack
        ref={messageListRef}
        spacing={0.75 * (appearance?.densityTokens.stackGapMultiplier ?? 1)}
        sx={
          appearance
            ? (embedPanelMessageListSx(appearance) as object)
            : { flex: 1, minHeight: 0, overflowY: "auto" }
        }
      >
        {appearance ? (
          <EmbedChatMediaBubbles appearance={appearance} compact />
        ) : null}
        {!mergeDisplayMessages.length &&
        appearance?.chatBox.greetingMessage &&
        !greetingAlreadyShown ? (
          <EmbedChatBubble appearance={appearance} role="greeting">
            {appearance.chatBox.greetingMessage}
          </EmbedChatBubble>
        ) : null}
        {!mergeDisplayMessages.length && appearance?.firstMessage?.trim() ? (
          <EmbedChatBubble appearance={appearance} role="assistant">
            {appearance.firstMessage}
          </EmbedChatBubble>
        ) : null}
        {mergeDisplayMessages.map((m) => (
          <MessageBubble
            key={m.id ?? `${m.createdAt}-${m.content}-${m.role}`}
            message={m}
            appearance={appearance}
          />
        ))}
        {chat.agentTypingSeen && chat.agentTypingDraft && appearance ? (
          <EmbedChatBubble appearance={appearance} role="assistant">
            {chat.agentTypingDraft}
          </EmbedChatBubble>
        ) : null}
      </Stack>

      <Stack
        direction="row"
        sx={
          appearance
            ? ({
                ...(embedComposerRowSx(appearance) as Record<string, unknown>),
                ...(embedComposerFooterSx(appearance) as Record<string, unknown>),
              } as const)
            : { display: "flex", alignItems: "center", gap: 1, width: "100%" }
        }
      >
        <Box
          sx={{ flex: 1, minWidth: 0 }}
          onKeyDown={(ev) => {
            if (ev.key === "Enter" && !ev.shiftKey) {
              ev.preventDefault();
              void sendDraft();
            }
          }}
        >
          <TextField
            name="composer"
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder={sendPlaceholder}
            fullWidth
            variant="outlined"
            size="small"
            sx={
              appearance
                ? {
                    ...embedComposerInputSx(appearance),
                    "& .MuiFormHelperText-root": { display: "none" },
                  }
                : { "& .MuiFormHelperText-root": { display: "none" } }
            }
          />
        </Box>
        <IconButton
          onClick={() => void sendDraft()}
          aria-label="Send"
          size="small"
          sx={appearance ? embedSendButtonSx(appearance) : { color: accentColor ?? "primary.main" }}
        >
          <Send fontSize="small" />
        </IconButton>
      </Stack>

      {mode === "HYBRID" &&
      !escalated &&
      hasActiveConversation &&
      (appearance?.agentTalkToAgentEnabled ?? true) ? (
        <MuiButton
          type="button"
          variant="outlined"
          disabled={talkToAgentBusy}
          onClick={() => void runTalkToAgent()}
          sx={appearance ? embedTalkToAgentButtonSx(appearance) : undefined}
        >
          {talkToAgentBusy
            ? "Connecting…"
            : appearance?.talkToAgentTriggerText ?? "Talk to agent"}
        </MuiButton>
      ) : null}
    </Box>
  );
}

function PrechatFieldRenderer({
  field,
  control,
  appearance,
}: {
  field: PrechatFieldDto;
  control: Parameters<typeof Controller>[0]["control"];
  appearance?: RuntimeChatAppearance;
}) {
  const label = field.label ?? field.key;
  const low = String(field.type || field.fieldType || "text").toLowerCase();
  const labelSx = appearance ? embedLabelTextSx(appearance) : undefined;
  const inputStyle = appearance ? embedNativeInputStyle(appearance) : { width: "100%", borderRadius: 8, padding: 8 };

  return (
    <Controller
      name={field.key}
      control={control}
      render={({ field: f, fieldState }) => {
        if (!appearance) {
          return (
            <TextField
              label={label}
              name={field.key}
              fullWidth
              variant="outlined"
              value={(f.value as string) ?? ""}
              onChange={(e) => f.onChange(e.target.value)}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
            />
          );
        }
        if (low === "textarea") {
          return (
            <EmbedInputField
              label={label}
              name={field.key}
              appearance={appearance}
              multiline
              value={(f.value as string) ?? ""}
              onChange={f.onChange}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
            />
          );
        }
        if (low === "select") {
          return (
            <Box>
              <Typography variant="small" sx={{ mb: 0.5, ...labelSx }}>
                {label}
              </Typography>
              <select
                style={inputStyle}
                value={(f.value as string) ?? ""}
                onChange={(e) => f.onChange(e.target.value)}
              >
                <option value="">Select…</option>
                {(field.options ?? []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {fieldState.error ? (
                <Typography variant="caption" color="error">
                  {fieldState.error.message}
                </Typography>
              ) : null}
            </Box>
          );
        }
        if (low === "checkbox") {
          return (
            <label
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                color: appearance?.colors.labelText,
              }}
            >
              <input
                type="checkbox"
                checked={Boolean(f.value)}
                onChange={(e) => f.onChange(e.target.checked)}
              />
              <span>{label}</span>
              {fieldState.error ? (
                <Typography variant="caption" color="error" component="span">
                  {fieldState.error.message}
                </Typography>
              ) : null}
            </label>
          );
        }
        return (
          <EmbedInputField
            label={label}
            name={field.key}
            appearance={appearance}
            type={low === "email" ? "email" : "text"}
            inputMode={low === "phone" ? "tel" : undefined}
            value={(f.value as string) ?? ""}
            onChange={f.onChange}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message}
          />
        );
      }}
    />
  );
}

function WidgetTextUsPanel({
  embedded = false,
  websiteId,
  parentPageUrl,
  sessionToken,
  widgetKey,
  textUsFormConfig,
  appearance,
}: {
  embedded?: boolean;
  websiteId: string;
  parentPageUrl: string;
  sessionToken: string;
  widgetKey: string;
  textUsFormConfig: Record<string, unknown>;
  appearance?: RuntimeChatAppearance;
}) {
  const fields = extractPrechatFieldsFromWidgetConfig({
    ...textUsFormConfig,
    form:
      typeof textUsFormConfig.form === "object" && textUsFormConfig.form
        ? (textUsFormConfig.form as Record<string, unknown>)
        : { fields: textUsFormConfig.fields },
    settingsJson: textUsFormConfig.settingsJson as Record<string, unknown> | undefined,
  });
  const schema = buildDynamicPrechatZod(fields);
  type FormValues = z.infer<typeof schema>;
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultFormValues(fields) as FormValues,
  });

  const siteKey = `text:${widgetKey}:${websiteId}`;
  const visitorSessionId = useMemo(() => {
    const existing = readVisitorSessionId(siteKey);
    if (existing) return existing;
    const created = generateClientSessionId();
    persistVisitorSessionId(siteKey, created);
    return created;
  }, [siteKey]);

  const chat = useVisitorChat({
    autoConnect: false,
    widgetSessionToken: sessionToken,
    websiteId,
    getCurrentPageUrl: () => parentPageUrl,
  });

  const [done, setDone] = useState(false);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formValidationHint, setFormValidationHint] = useState<string | null>(null);

  const onSubmit = form.handleSubmit(
    async (values) => {
      setSubmitBusy(true);
      setSubmitError(null);
      setFormValidationHint(null);
      try {
        if (!websiteId.trim()) {
          setSubmitError("This widget is not linked to a website yet.");
          return;
        }
        const { visitor, firstMessage } = buildVisitorPayloadParts(
          values as Record<string, unknown>,
          fields,
          visitorSessionId,
          "Text Us inquiry",
        );
        const geo = await resolveClientGeoHints();
        await chat.startConversation({
          websiteId,
          visitor,
          firstMessage,
          currentPageUrl: parentPageUrl,
          referrerUrl: typeof document !== "undefined" ? document.referrer : "",
          clientTimezone: geo.clientTimezone,
          clientLocale: geo.clientLocale,
          clientScreenResolution: geo.clientScreenResolution,
          clientLocationCity: geo.clientLocationCity,
          clientLocationCountry: geo.clientLocationCountry,
          clientLocationRegion: geo.clientLocationRegion,
          clientLocationZipcode: geo.clientLocationZipcode,
        });
        setDone(true);
      } catch (err) {
        setSubmitError(
          err instanceof Error
            ? err.message
            : "Could not send your message. Please try again.",
        );
      } finally {
        setSubmitBusy(false);
      }
    },
    () => {
      setFormValidationHint("Please fill in all required fields.");
    },
  );

  if (done) {
    return (
      <Typography variant="body2" sx={{ color: "success.light" }}>
        Thanks — we received your message.
      </Typography>
    );
  }

  return (
    <Stack component="form" spacing={1} onSubmit={onSubmit}>
      {embedded ? (
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Send a message
        </Typography>
      ) : (
        <Typography variant="subtitle2">Text us</Typography>
      )}
      {fields.map((f) => (
        <PrechatFieldRenderer key={f.key} field={f} control={form.control} appearance={appearance} />
      ))}
      {formValidationHint ? (
        <Typography variant="caption" color="error">
          {formValidationHint}
        </Typography>
      ) : null}
      {submitError ? (
        <Typography variant="caption" color="error">
          {submitError}
        </Typography>
      ) : null}
      {appearance ? (
        <EmbedActionButton type="submit" appearance={appearance} disabled={submitBusy}>
          {submitBusy ? "Sending…" : "Send"}
        </EmbedActionButton>
      ) : (
        <MuiButton type="submit" variant="contained" disabled={submitBusy}>
          {submitBusy ? "Sending…" : "Send"}
        </MuiButton>
      )}
    </Stack>
  );
}

function MessageBubble({
  message,
  appearance,
}: {
  message: ChatMessage;
  appearance?: RuntimeChatAppearance;
}) {
  const bubbleRole = resolveEmbedMessageBubbleRole(message.role);
  const alignRight = bubbleRole === "visitor";

  return (
    <Box sx={appearance ? embedChatBubbleShellSx(alignRight ? "end" : "start") : {}}>
      <Box
        sx={
          appearance ? embedTranscriptBubbleInnerSx(appearance, bubbleRole) : {}
        }
      >
        <ChatFormattedMessage
          text={message.content}
          linkColor={appearance?.colors.primary ?? "#2563eb"}
        />
      </Box>
    </Box>
  );
}
