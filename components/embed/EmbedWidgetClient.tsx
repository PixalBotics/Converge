"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import ChatRounded from "@mui/icons-material/ChatRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import Send from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";
import {
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
import { WidgetClosedIncomingPreviewBubble } from "@/components/embed/WidgetClosedIncomingPreviewBubble";
import { WidgetProactiveTeaserBubble } from "@/components/embed/WidgetProactiveTeaserBubble";
import { EmbedChatBubble } from "@/components/embed/EmbedChatBubble";
import { EmbedTypingDots } from "@/components/embed/EmbedTypingDots";
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
import {
  peekClientGeoHints,
  resolveClientGeoHints,
} from "@/lib/widget-runtime/client-geo-hints";
import {
  markWidgetTrackSent,
  shouldSkipWidgetTrack,
} from "@/lib/widget-runtime/widget-track-dedupe";
import { ChatFormattedMessage } from "@/lib/safe-markdown/ChatFormattedMessage";
import { EmbedProductRichCard, isRichCardMessage, readMessageRichCard } from "@/components/embed/EmbedProductRichCard";
import { normalizeChatMessageText } from "@/lib/safe-markdown/text";
import { useVisitorChat } from "@/lib/hooks/chat/useVisitorChat";
import { isHiddenFromVisitorWidget } from "@/lib/hooks/chat/visitor-widget-messages";
import { LauncherPresetIcon } from "@/lib/chat-widget/launcherIcons";
import { TextUsLauncherChip } from "@/components/embed/TextUsLauncherChip";
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
  extractOfflineFormFieldsFromWidgetConfig,
  isPrechatBootstrapVisitorMessage,
  resolvePersonalizedAssistantWelcome,
  type PrechatFieldDto,
} from "@/lib/widget-runtime/prechat-form";
import {
  extractRuntimeChatAppearance,
  extractRuntimeTextUsAppearance,
  resolveEmbedGreetingMessage,
  launcherFrameChromeInsets,
  launcherInnerRootSx,
  resolveRuntimeConfigRecord,
  type RuntimeChatAppearance,
} from "@/lib/widget-runtime/widget-runtime-appearance";
import {
  computeEmbedOpenPanelMaxHeightPx,
  EMBED_LAUNCHER_SIZE_PX,
  postEmbedHostResize,
  type EmbedClosedChrome,
  type EmbedHostSurface,
} from "@/lib/widget-runtime/embed-host-messaging";
import {
  notifyWidgetIncoming,
  requestWidgetNotificationPermission,
  shouldPlayWidgetIncomingSound,
  truncateClosedMessagePreviewHalf,
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
  EMBED_CHAT_AVATAR_SIZE_PX,
  EMBED_HEADER_LOGO_HEIGHT_PX,
  EMBED_HEADER_LOGO_MAX_WIDTH_PX,
  embedChatAvatarSpacerSx,
  embedChatBubbleRowSx,
  embedChatBubbleShellSx,
  resolveEmbedChatAvatarDisplay,
  shouldMirrorEmbedChatAvatarColumn,
  embedTalkToAgentButtonSx,
  embedPrechatFormBubbleInnerSx,
  embedPrechatFormBubbleShellSx,
  embedInquiryPillSx,
  embedLauncherFabSx,
  embedLabelTextSx,
  embedMutedTextSx,
  embedNativeInputStyle,
  embedPanelBodyBackgroundSx,
  embedPanelPaperSx,
  embedPanelMessageListSx,
  embedEmbeddedChatPanelSx,
  embedComposerFooterStackSx,
  embedTranscriptBubbleInnerSx,
  embedSendButtonSx,
  resolveEmbedMessageBubbleRole,
} from "@/lib/widget-runtime/embed-theme-sx";
import { EmbedAgentAvatar } from "@/components/embed/EmbedAgentAvatar";
import { EmbedWidgetTheme } from "@/components/embed/EmbedWidgetTheme";
import { resolveWidgetPanelHeaderSurfaceSx } from "@/lib/chat-widget/launcher-style";
import {
  getWidgetRuntimeConfigForEmbed,
  postWidgetSession,
  postTextUsSubmit,
} from "@/lib/widget-runtime/widget-public-fetch";
import type { WidgetConfigEnvelope } from "@/lib/widget-runtime/widget-types";
import { decodeJwtExpMs } from "@/lib/widget-runtime/jwt-expiry";
import {
  clearConversationId,
  ensureVisitorSessionId,
  generateClientSessionId,
  persistConversationId,
  clearHybridEscalated,
  persistHybridEscalated,
  persistVisitorSessionId,
  readConversationId,
  readHybridEscalatedConversationId,
  readVisitorSessionId,
  saveWidgetJwt,
} from "@/lib/widget-runtime/browser-storage";
import type { ChatMessage } from "@/services/chat/chat.types";
import { fetchWidgetVisitorAvailability } from "@/services/chat/widget-visitor.api";
import {
  shouldSendSandboxConversationFlag,
  shouldSkipWidgetAnalytics,
  type WidgetEmbedEnv,
} from "@/lib/widget-runtime/widget-embed-env";

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
  /** `staging` counts all metrics; `dashboard_preview` skips analytics only. */
  embedEnv?: WidgetEmbedEnv;
  /** Signed token for public draft sandbox links (no dashboard login). */
  previewShareToken?: string;
  /** Parent page already sent `page_view` with this session — iframe should not duplicate. */
  parentVisitorSessionId?: string;
  /** When BOTH surfaces are enabled, host mounts separate iframes (`chat` | `textUs`). */
  embedSurface?: EmbedHostSurface;
}

export function EmbedWidgetClient({
  widgetKey,
  parentHost,
  parentPageUrl,
  sandboxMode = false,
  embedEnv: embedEnvProp,
  previewShareToken,
  parentVisitorSessionId,
  embedSurface,
}: EmbedWidgetClientProps) {
  const [boot, setBoot] = useState<BootState>({ phase: "loading" });
  const embedEnv: WidgetEmbedEnv =
    embedEnvProp ??
    (sandboxMode ? "dashboard_preview" : "production");

  useEffect(() => {
    void resolveClientGeoHints();
  }, []);

  useEffect(() => {
    const sid = parentVisitorSessionId?.trim();
    if (!sid) return;
    persistVisitorSessionId(widgetKey, sid);
  }, [parentVisitorSessionId, widgetKey]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const shareToken = previewShareToken?.trim();
      const cfgRes = await getWidgetRuntimeConfigForEmbed(widgetKey, embedEnv, {
        previewShareToken: shareToken,
      });
      if (cancelled) return;
      if (!cfgRes.ok) {
        setBoot({
          phase: "error",
          message:
            cfgRes.status === 403
              ? shareToken
                ? "This preview link is invalid or expired. Generate a new link from the dashboard."
                : "This widget is not allowed on this domain."
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
        ...(shareToken ? { previewShareToken: shareToken } : {}),
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
  }, [widgetKey, parentHost, embedEnv, previewShareToken]);

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

    const shareToken = previewShareToken?.trim();

    const id = window.setTimeout(() => {
      void (async () => {
        const sess = await postWidgetSession({
          widgetKey,
          ...(originHost ? { originHost } : {}),
          ...(shareToken ? { previewShareToken: shareToken } : {}),
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
  }, [boot, parentHost, previewShareToken, widgetKey]);

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
      embedEnv={embedEnv}
      parentPageViewAlreadyTracked={Boolean(parentVisitorSessionId?.trim())}
      embedSurface={embedSurface}
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
  embedEnv = "production",
  skipParentPageView = false,
  stackedLauncherCount = 1,
  suppressHostResize = false,
  hostSurface,
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
  embedEnv?: WidgetEmbedEnv;
  /** Parent `widget.js` already sent page_view for this session. */
  skipParentPageView?: boolean;
  /** BOTH widgets: closed iframe height for stacked Text Us + chat launchers. */
  stackedLauncherCount?: number;
  suppressHostResize?: boolean;
  hostSurface?: EmbedHostSurface;
}) {
  const skipAnalytics = shouldSkipWidgetAnalytics(embedEnv);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [panelHeaderStatus, setPanelHeaderStatus] =
    useState<EmbedPanelHeaderStatus | null>(null);
  const launcherOpenRef = useRef(false);
  const sessionTokenRef = useRef(sessionToken);
  sessionTokenRef.current = sessionToken;
  const [unreadCount, setUnreadCount] = useState(0);
  const [launcherPreview, setLauncherPreview] = useState("");
  const sandboxPreviewAlerts = embedEnv === "dashboard_preview";
  const siteKey = `${widgetKey}:${websiteId}`;
  const formEnabledForGate = appearance.formEnabled ?? true;
  const inquiryAllowedForMode =
    mode !== "AI_ONLY" &&
    (appearance.inquiryEnabled ?? (appearance.inquiryOptions?.length ?? 0) > 0) &&
    (appearance.inquiryOptions?.length ?? 0) > 0;
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
      if (skipAnalytics) return;
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
  }, [launcherOpen, websiteId, siteKey, parentPageUrl, sessionToken, skipAnalytics, widgetKey]);

  useEffect(() => {
    if (!greetingAck) {
      setPanelHeaderStatus(null);
    }
  }, [greetingAck]);

  useEffect(() => {
    requestWidgetNotificationPermission();
  }, []);

  useEffect(() => {
    if (!sandboxPreviewAlerts) return;
    if (appearance.launcherBadgeMode === "none") return;
    if (
      appearance.launcher.proactiveTeaserActive ||
      appearance.firstMessage.trim()
    ) {
      setUnreadCount((c) => (c > 0 ? c : 1));
    }
  }, [
    sandboxPreviewAlerts,
    appearance.launcherBadgeMode,
    appearance.firstMessage,
    appearance.launcher.proactiveTeaserActive,
  ]);

  useEffect(() => {
    if (!sandboxPreviewAlerts) return;
    if (appearance.closedMessagePreviewEnabled === false) return;
    if (appearance.launcher.proactiveTeaserActive) return;
    const sample =
      appearance.firstMessage.trim() ||
      appearance.fallbackNotificationText.trim();
    if (!sample) return;
    setLauncherPreview(truncateClosedMessagePreviewHalf(sample));
  }, [
    sandboxPreviewAlerts,
    appearance.closedMessagePreviewEnabled,
    appearance.launcher.proactiveTeaserActive,
    appearance.firstMessage,
    appearance.fallbackNotificationText,
  ]);

  useEffect(() => {
    if (!websiteId || skipAnalytics || skipParentPageView) return;
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
  }, [websiteId, siteKey, parentPageUrl, skipAnalytics, skipParentPageView, widgetKey]);

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
      postEmbedHostResize(true, appearance, undefined, hostSurface);
      markWidgetReturnVisit(widgetKey);
    }, appearance.autoOpenDelaySeconds * 1000);
    return () => window.clearTimeout(id);
  }, [
    appearance,
    siteKey,
    widgetKey,
  ]);

  const storeClosedMessagePreview = useCallback(
    (preview: string) => {
      const text = truncateNotificationPreview(preview);
      if (!text) return;
      if (appearance.closedMessagePreviewEnabled !== false) {
        setLauncherPreview(truncateClosedMessagePreviewHalf(text));
      }
    },
    [appearance.closedMessagePreviewEnabled],
  );

  const handleIncomingAlert = useCallback(
    (preview: string) => {
      storeClosedMessagePreview(preview);

      const panelOpen = launcherOpenRef.current;
      const tabHidden = typeof document !== "undefined" && document.hidden;
      const text = truncateNotificationPreview(preview);
      if (!text) return;

      if (!panelOpen && appearance.launcherBadgeMode !== "none") {
        setUnreadCount((c) => Math.min(99, c + 1));
      }

      if (panelOpen && !tabHidden) return;

      notifyWidgetIncoming(appearance, text, {
        launcherOpen: panelOpen,
        playSound: shouldPlayWidgetIncomingSound({ panelOpen, tabHidden }),
      });
    },
    [appearance, storeClosedMessagePreview],
  );

  const acknowledgeGreeting = () => {
    setGreetingAck(true);
    writeWelcomeAcknowledged(widgetKey);
  };

  const { launcher, chatBox } = appearance;

  const showClosedMessagePreview =
    appearance.closedMessagePreviewEnabled !== false &&
    Boolean(launcherPreview.trim());
  const showClosedInvitationBubble =
    !launcherOpen &&
    (showClosedMessagePreview || launcher.proactiveTeaserActive);

  const showLauncherBadge =
    !launcherOpen &&
    appearance.launcherBadgeMode !== "none" &&
    (sandboxPreviewAlerts || unreadCount > 0);

  const closedChrome = useMemo<EmbedClosedChrome>(
    () => ({
      hasInvitationBubble: showClosedInvitationBubble,
      hasLauncherBadge: showLauncherBadge,
      stackedLauncherCount,
    }),
    [showClosedInvitationBubble, showLauncherBadge, stackedLauncherCount],
  );

  const closeLauncher = () => {
    setLauncherOpen(false);
    if (!suppressHostResize) {
      postEmbedHostResize(false, appearance, {
        hasInvitationBubble:
          showClosedMessagePreview || launcher.proactiveTeaserActive,
        hasLauncherBadge: showLauncherBadge,
        stackedLauncherCount,
      }, hostSurface);
    }
    setGreetingAck(!hasGreetingStep || readWelcomeAcknowledged(widgetKey));
    markWidgetReturnVisit(widgetKey);
  };

  useEmbedHostResize(launcherOpen, appearance, closedChrome, suppressHostResize, hostSurface);

  const openLauncher = () => {
    unlockWidgetAudio();
    setLauncherOpen(true);
    if (!suppressHostResize) {
      postEmbedHostResize(true, appearance, undefined, hostSurface);
    }
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
        ...launcherInnerRootSx(launcher, { hasBadge: showLauncherBadge }),
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
            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 0.5,
                px: 2,
                py: 1,
                color: chatBox.headerTextColor,
                minHeight: 44,
                ...resolveWidgetPanelHeaderSurfaceSx({
                  style: appearance.panelSurfaceStyle,
                  headerBg: chatBox.headerBg,
                  buttonHoverColor: launcher.buttonHoverColor,
                }),
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                sx={{
                  ...(chatBox.headerAlign === "center"
                    ? {
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        maxWidth: "calc(100% - 88px)",
                        justifyContent: "center",
                        pointerEvents: "none",
                      }
                    : {
                        flex: 1,
                        minWidth: 0,
                        justifyContent: "flex-start",
                        mr: "auto",
                      }),
                }}
              >
                {chatBox.headerLogoUrl ? (
                  <Box
                    component="img"
                    src={chatBox.headerLogoUrl}
                    alt=""
                    sx={{
                      height: EMBED_HEADER_LOGO_HEIGHT_PX,
                      width: "auto",
                      maxWidth: EMBED_HEADER_LOGO_MAX_WIDTH_PX,
                      objectFit: "contain",
                      flexShrink: 0,
                      pointerEvents: "auto",
                    }}
                  />
                ) : null}
                {chatBox.headerTitle.trim() ? (
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    sx={{
                      letterSpacing: 0.02,
                      flex:
                        chatBox.headerAlign === "left" && chatBox.headerLogoUrl
                          ? 1
                          : undefined,
                      minWidth: 0,
                      textAlign: chatBox.headerAlign,
                      color: "inherit",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {chatBox.headerTitle.trim()}
                  </Typography>
                ) : null}
              </Stack>
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
            </Box>

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                p: greetingAck ? 0 : appearance.densityTokens.panelPaddingPx / 8,
                ...embedPanelBodyBackgroundSx(appearance),
              }}
            >
              {!greetingAck ? (
                <Stack spacing={2} sx={{ pt: 0.5, px: 1.5 }}>
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
                      greetingAlreadyShown={
                        needsPrechatGate || (hasGreetingStep && greetingAck)
                      }
                      widgetKey={widgetKey}
                      websiteId={websiteId}
                      parentPageUrl={parentPageUrl}
                      mode={mode}
                      sessionToken={sessionToken}
                      configRecord={configRecord}
                      appearance={appearance}
                      embedEnv={embedEnv}
                      onIncomingWhileClosed={handleIncomingAlert}
                      onSyncClosedMessagePreview={storeClosedMessagePreview}
                      onHeaderStatusChange={setPanelHeaderStatus}
                    />
                  </Box>
                  {textUsBelow ? (
                    <Box
                      sx={{
                        px: `${Math.max(10, appearance.densityTokens.panelPaddingPx * 0.65)}px`,
                        pb: 1.5,
                        pt: 0.5,
                        borderTop: `1px solid ${appearance.colors.inputBorder}`,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ ...embedLabelTextSx(appearance), mb: 1 }}
                      >
                        {extractRuntimeTextUsAppearance(configRecord).chatBox.headerTitle ||
                          "Text us"}
                      </Typography>
                      {textUsBelow}
                    </Box>
                  ) : null}
                </Box>
              )}
            </Box>
          </Paper>
        ) : null}

        {!launcherOpen && showClosedMessagePreview ? (
          <WidgetClosedIncomingPreviewBubble
            preview={launcherPreview}
            appearance={appearance}
            onOpenChat={openLauncher}
          />
        ) : !launcherOpen && launcher.proactiveTeaserActive ? (
          <WidgetProactiveTeaserBubble
            text={launcher.proactiveTeaser}
            avatarUrl={launcher.proactiveTeaserAvatarUrl}
            secondaryCta={launcher.proactiveSecondaryCta}
            onOpenChat={openLauncher}
            backgroundColor={appearance.colors.incomingBubbleBg}
            textColor={appearance.colors.incomingBubbleText}
            motionEnabled={appearance.motionEnabled}
          />
        ) : null}

        <Badge
          overlap={launcher.buttonLabel?.trim() ? "rectangular" : "circular"}
          invisible={
            launcherOpen ||
            appearance.launcherBadgeMode === "none" ||
            (!sandboxPreviewAlerts &&
              appearance.launcherBadgeMode === "count" &&
              unreadCount <= 0) ||
            (!sandboxPreviewAlerts &&
              appearance.launcherBadgeMode === "dot" &&
              unreadCount <= 0)
          }
          badgeContent={
            appearance.launcherBadgeMode === "count" &&
            (unreadCount > 0 || sandboxPreviewAlerts)
              ? (unreadCount > 0 ? unreadCount : 1) > 9
                ? "9+"
                : unreadCount > 0
                  ? unreadCount
                  : 1
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
          <TextUsLauncherChip
            size="embed"
            open={launcherOpen}
            buttonColor={launcher.buttonColor}
            buttonHoverColor={launcher.buttonHoverColor}
            iconColor={launcher.iconColor}
            iconPreset={launcher.iconPreset}
            iconDataUrl={launcher.iconUrl}
            iconEnabled={launcher.iconEnabled !== false}
            launcherStyle={launcher.style}
            buttonLabel={launcher.buttonLabel}
            buttonShape={
              launcher.shape === "square" || launcher.shape === "rounded"
                ? launcher.shape
                : "circle"
            }
            ariaLabelPrefix="chat"
            onClick={toggleLauncher}
          />
        </Badge>
      </Box>
    </Box>
  );
}

/** Text-only widget — same launcher + themed panel shell as chat */
function FloatingTextUsEmbed({
  widgetKey,
  websiteId,
  parentPageUrl,
  sessionToken,
  textUsFormConfig,
  configRecord,
  suppressHostResize = false,
  hostSurface = "textUs",
}: {
  widgetKey: string;
  websiteId: string;
  parentPageUrl: string;
  sessionToken: string;
  textUsFormConfig: Record<string, unknown>;
  configRecord: Record<string, unknown>;
  suppressHostResize?: boolean;
  hostSurface?: EmbedHostSurface;
}) {
  const appearance = useMemo(
    () => extractRuntimeTextUsAppearance(configRecord),
    [configRecord],
  );
  const { launcher, chatBox } = appearance;
  const greetingMessage = resolveEmbedGreetingMessage(
    appearance,
    appearance.panelGreetingMessage,
  );
  const hasGreetingStep = greetingMessage.length > 0;

  const [launcherOpen, setLauncherOpen] = useState(false);
  const [greetingAck, setGreetingAck] = useState(
    () => !hasGreetingStep || readWelcomeAcknowledged(`${widgetKey}:textUs`),
  );

  useEffect(() => {
    setGreetingAck(
      !hasGreetingStep || readWelcomeAcknowledged(`${widgetKey}:textUs`),
    );
  }, [widgetKey, hasGreetingStep]);

  const acknowledgeGreeting = () => {
    setGreetingAck(true);
    writeWelcomeAcknowledged(`${widgetKey}:textUs`);
  };

  const panelAlign =
    launcher.position === "left"
      ? "flex-start"
      : launcher.position === "center"
        ? "center"
        : "flex-end";
  const sidePad = launcher.insetSidePx * 2;
  const verticalAnchor = launcher.verticalAnchor === "top" ? "top" : "bottom";
  const chromeInsets = useMemo(
    () => launcherFrameChromeInsets(launcher),
    [launcher],
  );
  const panelMaxHeightPx = useMemo(
    () => computeEmbedOpenPanelMaxHeightPx(appearance, hostSurface),
    [appearance, hostSurface],
  );

  const closeLauncher = () => {
    setLauncherOpen(false);
    if (!suppressHostResize) {
      postEmbedHostResize(false, appearance, undefined, hostSurface);
    }
    setGreetingAck(
      !hasGreetingStep || readWelcomeAcknowledged(`${widgetKey}:textUs`),
    );
  };

  const openLauncher = () => {
    unlockWidgetAudio();
    setLauncherOpen(true);
    if (!suppressHostResize) {
      postEmbedHostResize(true, appearance, undefined, hostSurface);
    }
  };

  const toggleLauncher = () => {
    if (launcherOpen) closeLauncher();
    else openLauncher();
  };

  useEmbedHostResize(launcherOpen, appearance, undefined, suppressHostResize, hostSurface);

  return (
    <EmbedWidgetTheme appearance={appearance}>
      <Box
        sx={{
          position: "fixed",
          ...(launcherOpen
            ? {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                transform: "none",
                boxSizing: "border-box",
                padding: `${chromeInsets.top}px ${chromeInsets.right}px ${chromeInsets.bottom}px ${chromeInsets.left}px`,
              }
            : launcherInnerRootSx(launcher)),
          zIndex: 2147483000,
          display: "flex",
          flexDirection: "column",
          alignItems: panelAlign,
          justifyContent:
            launcherOpen && verticalAnchor === "bottom" ? "flex-end" : "flex-start",
          gap: 1,
          width: launcherOpen ? "100%" : "max-content",
          maxWidth: launcherOpen ? "100%" : `calc(100vw - ${sidePad}px)`,
          height: launcherOpen ? "100%" : undefined,
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
            flexDirection:
              !launcherOpen && verticalAnchor === "bottom" ? "column-reverse" : "column",
            alignItems: panelAlign,
            justifyContent:
              launcherOpen && verticalAnchor === "bottom" ? "flex-end" : "flex-start",
            gap: 1,
            pointerEvents: "auto",
            width: launcherOpen ? "100%" : "max-content",
            maxWidth: launcherOpen ? "100%" : `calc(100vw - ${sidePad}px)`,
            height: launcherOpen ? "100%" : undefined,
            minHeight: 0,
          }}
        >
          {launcherOpen || greetingAck ? (
            <Paper
              elevation={0}
              sx={{
                transition: appearance.motionEnabled
                  ? "opacity 0.22s ease, transform 0.22s ease"
                  : undefined,
                width: chatBox.boxWidth,
                maxWidth: "100%",
                height: launcherOpen ? panelMaxHeightPx : "auto",
                minHeight: 280,
                maxHeight: launcherOpen ? "100%" : panelMaxHeightPx,
                display: launcherOpen ? "flex" : "none",
                flexDirection: "column",
                flexShrink: 0,
                overflow: "hidden",
                ...embedPanelPaperSx(appearance),
              }}
              aria-hidden={!launcherOpen}
            >
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 0.5,
                  px: 2,
                  py: 1,
                  color: chatBox.headerTextColor,
                  minHeight: 44,
                  ...resolveWidgetPanelHeaderSurfaceSx({
                    style: appearance.panelSurfaceStyle,
                    headerBg: chatBox.headerBg,
                    buttonHoverColor: launcher.buttonHoverColor,
                  }),
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.75}
                  sx={{ flex: 1, minWidth: 0, justifyContent: "flex-start", mr: "auto" }}
                >
                  {chatBox.headerLogoUrl ? (
                    <Box
                      component="img"
                      src={chatBox.headerLogoUrl}
                      alt=""
                      sx={{
                        height: EMBED_HEADER_LOGO_HEIGHT_PX,
                        width: "auto",
                        maxWidth: EMBED_HEADER_LOGO_MAX_WIDTH_PX,
                        objectFit: "contain",
                        flexShrink: 0,
                      }}
                    />
                  ) : null}
                  {chatBox.headerTitle.trim() ? (
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      sx={{
                        letterSpacing: 0.02,
                        minWidth: 0,
                        color: "inherit",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {chatBox.headerTitle.trim()}
                    </Typography>
                  ) : null}
                </Stack>
                <IconButton
                  type="button"
                  aria-label="Minimize widget"
                  size="small"
                  onClick={closeLauncher}
                  sx={{ color: "inherit", flexShrink: 0 }}
                >
                  <CloseRounded fontSize="small" />
                </IconButton>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  p: greetingAck ? 0 : appearance.densityTokens.panelPaddingPx / 8,
                  ...embedPanelBodyBackgroundSx(appearance),
                }}
              >
                {!greetingAck ? (
                  <Stack spacing={2} sx={{ pt: 0.5, px: 1.5 }}>
                    <EmbedChatBubble appearance={appearance} role="greeting">
                      {greetingMessage}
                    </EmbedChatBubble>
                    <Typography variant="body2" sx={embedMutedTextSx(appearance)}>
                      Continue to open the form and send us a message.
                    </Typography>
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
                      flex: 1,
                      minHeight: 0,
                      overflowY: "auto",
                      px: `${Math.max(10, appearance.densityTokens.panelPaddingPx * 0.65)}px`,
                      py: 1.25,
                      ...embedPanelBodyBackgroundSx(appearance),
                    }}
                  >
                    {appearance.welcomeMessage.trim() ? (
                      <Box sx={{ mb: 1.25 }}>
                        <EmbedChatBubble appearance={appearance} role="greeting">
                          {appearance.welcomeMessage.trim()}
                        </EmbedChatBubble>
                      </Box>
                    ) : null}
                    <WidgetTextUsPanel
                      embedded
                      websiteId={websiteId}
                      parentPageUrl={parentPageUrl}
                      sessionToken={sessionToken}
                      widgetKey={widgetKey}
                      textUsFormConfig={textUsFormConfig}
                      appearance={appearance}
                    />
                  </Box>
                )}
              </Box>
            </Paper>
          ) : null}

          {!launcherOpen ? (
            <TextUsLauncherChip
              size="embed"
              open={launcherOpen}
              buttonColor={launcher.buttonColor}
              buttonHoverColor={launcher.buttonHoverColor}
              iconColor={launcher.iconColor}
              iconPreset={launcher.iconPreset}
              iconEnabled={launcher.iconEnabled !== false}
              launcherStyle={launcher.style}
              buttonLabel={launcher.buttonLabel}
              onClick={toggleLauncher}
            />
          ) : null}
        </Box>
      </Box>
    </EmbedWidgetTheme>
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
  embedEnv = "production",
  parentPageViewAlreadyTracked = false,
  embedSurface,
}: {
  widgetKey: string;
  parentPageUrl: string;
  envelope: WidgetConfigEnvelope;
  sessionToken: string;
  embedEnv?: WidgetEmbedEnv;
  parentPageViewAlreadyTracked?: boolean;
  embedSurface?: EmbedHostSurface;
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

  if (embedSurface === "chat") {
    if (!chatOn) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Chat is not enabled for this widget.
          </Typography>
        </Box>
      );
    }
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
          embedEnv={embedEnv}
          skipParentPageView={parentPageViewAlreadyTracked}
          hostSurface="chat"
        />
      </EmbedWidgetTheme>
    );
  }

  if (embedSurface === "textUs") {
    if (!textOn) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Text Us is not enabled for this widget.
          </Typography>
        </Box>
      );
    }
    return (
      <FloatingTextUsEmbed
        widgetKey={widgetKey}
        websiteId={websiteId}
        parentPageUrl={parentPageUrl}
        sessionToken={sessionToken}
        textUsFormConfig={textUsForm}
        configRecord={configRecord}
        hostSurface="textUs"
      />
    );
  }

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
          embedEnv={embedEnv}
          skipParentPageView={parentPageViewAlreadyTracked}
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
        websiteId={websiteId}
        parentPageUrl={parentPageUrl}
        sessionToken={sessionToken}
        textUsFormConfig={textUsForm}
        configRecord={configRecord}
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
  embedEnv = "production",
  onIncomingWhileClosed,
  onSyncClosedMessagePreview,
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
  embedEnv?: WidgetEmbedEnv;
  onIncomingWhileClosed?: (preview: string) => void;
  /** Hydrate closed FAB preview from transcript without notification side-effects. */
  onSyncClosedMessagePreview?: (preview: string) => void;
  onHeaderStatusChange?: (status: EmbedPanelHeaderStatus | null) => void;
}) {
  const sendPlaceholder =
    appearance?.chatBox.sendPlaceholder ?? "Write a message…";
  const panelBg = appearance?.chatBox.backgroundColor;
  const accentColor = appearance?.launcher.buttonColor;
  const siteKey = `${widgetKey}:${websiteId}`;
  const persistenceKey =
    embedEnv === "dashboard_preview" ? `sandbox:${siteKey}` : siteKey;
  const fields = useMemo(
    () => extractPrechatFieldsFromWidgetConfig(configRecord),
    [configRecord],
  );
  const offlineFields = useMemo(
    () => extractOfflineFormFieldsFromWidgetConfig(configRecord),
    [configRecord],
  );
  const schema = useMemo(() => buildDynamicPrechatZod(fields), [fields]);
  const offlineSchema = useMemo(
    () => buildDynamicPrechatZod(offlineFields),
    [offlineFields],
  );

  type FormValues = z.infer<typeof schema>;
  type OfflineFormValues = z.infer<typeof offlineSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultFormValues(fields) as FormValues,
  });
  const offlineFormHook = useForm<OfflineFormValues>({
    resolver: zodResolver(offlineSchema),
    defaultValues: buildDefaultFormValues(offlineFields) as OfflineFormValues,
  });

  const [visitorAvailability, setVisitorAvailability] = useState<Awaited<
    ReturnType<typeof fetchWidgetVisitorAvailability>
  > | null>(null);
  const [availabilityChecked, setAvailabilityChecked] = useState(
    mode !== "AGENT_ONLY",
  );
  const [offlineFormSubmitted, setOfflineFormSubmitted] = useState(false);

  useEffect(() => {
    if (mode !== "AGENT_ONLY" || !websiteId.trim() || !widgetKey.trim()) {
      setAvailabilityChecked(true);
      return;
    }
    let cancelled = false;
    void fetchWidgetVisitorAvailability(websiteId.trim(), widgetKey.trim()).then(
      (res) => {
        if (cancelled) return;
        setVisitorAvailability(res);
        setAvailabilityChecked(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [mode, websiteId, widgetKey]);

  const offlineCaptureActive =
    mode === "AGENT_ONLY" &&
    availabilityChecked &&
    visitorAvailability?.shouldShowOfflineForm === true &&
    appearance?.offlineFormEnabled !== false &&
    !offlineFormSubmitted;

  const offlineMessageOnly =
    mode === "AGENT_ONLY" &&
    availabilityChecked &&
    visitorAvailability?.shouldShowOfflineForm === true &&
    appearance?.offlineFormEnabled === false;

  const formEnabled = appearance?.formEnabled ?? true;
  const inquiryOptions: RuntimeInquiryOption[] = appearance?.inquiryOptions ?? [];
  const inquiryEnabled = appearance?.inquiryEnabled ?? inquiryOptions.length > 0;
  const hasInquiryStep =
    mode !== "AI_ONLY" && inquiryEnabled && inquiryOptions.length > 0;
  const inquiryRequired = appearance?.inquiryRequired ?? false;
  const inquiryFallback = appearance?.inquiryFallback ?? null;
  const inquirySkipLabel = appearance?.inquirySkipLabel ?? "General question";
  const needsPrechatGate =
    formEnabled || hasInquiryStep || Boolean(appearance?.consentRequired);
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
      if (role === "system") {
        if (chat.assigned || escalatedRef.current) return;
      } else if (role !== "agent") {
        return;
      }
      const text = message.content?.trim();
      if (text) onIncomingWhileClosed(text);
    },
    onChatAssigned: () => {
      setAwaitingFirstUserQuestion(false);
      if (mode === "HYBRID") {
        setEscalated(true);
        escalatedRef.current = true;
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
    persistenceKey,
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
    if (chat.botStreamingText.trim()) {
      setAiPending(false);
      aiPendingSinceRef.current = null;
      return;
    }
    const gotAi = chat.messages.some((m) => {
      if (m.role !== "system") return false;
      if (!m.createdAt) return true;
      return new Date(m.createdAt).getTime() >= since - 800;
    });
    if (gotAi) {
      setAiPending(false);
      aiPendingSinceRef.current = null;
    }
  }, [aiPending, chat.botStreamingText, chat.messages]);

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
  }, [awaitingFirstUserQuestion, chat.messages, chat.conversationId, localAiMessages, prechatTranscriptBubble]);

  useEffect(() => {
    if (!onSyncClosedMessagePreview) return;
    const agentRoles = new Set(["agent", "system", "ai"]);
    const lastAgent = [...mergeDisplayMessages]
      .reverse()
      .find(
        (m) =>
          agentRoles.has((m.role || "").toLowerCase()) &&
          Boolean(m.content?.trim()),
      );
    if (lastAgent?.content?.trim()) {
      onSyncClosedMessagePreview(lastAgent.content);
    }
  }, [mergeDisplayMessages, onSyncClosedMessagePreview]);

  const assistantHandlesChat =
    mode === "AI_ONLY" || (mode === "HYBRID" && !escalated);
  const needsAgentSocket =
    mode === "AGENT_ONLY" || (mode === "HYBRID" && escalated);
  const hasActiveConversation = Boolean(chat.conversationId);

  /** Avoid flashing "Offline" on brief socket reconnects — only after sustained disconnect. */
  const SOCKET_OFFLINE_UI_DELAY_MS = 4500;
  const [socketUiLive, setSocketUiLive] = useState(chat.isConnected);
  useEffect(() => {
    if (chat.isConnected) {
      setSocketUiLive(true);
      return;
    }
    const id = window.setTimeout(() => setSocketUiLive(false), SOCKET_OFFLINE_UI_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [chat.isConnected]);

  const showOfflineBanner =
    needsAgentSocket &&
    !socketUiLive &&
    Boolean(appearance?.offlineMessage?.trim());
  const statusLabel = (() => {
    if (assistantHandlesChat) {
      if (!hasActiveConversation) {
        return chat.isConnected ? "Live" : "Connecting…";
      }
      return aiPending ? "Assistant" : "Live";
    }
    if (needsAgentSocket && !socketUiLive && appearance?.offlineMessage?.trim()) {
      return "Offline";
    }
    if (!socketUiLive) {
      return hasActiveConversation ? "Connecting…" : "Connecting…";
    }
    return "Live";
  })();

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

  const consentBlocksStart =
    Boolean(appearance?.consentRequired) && !consentAccepted;

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
      if (consentBlocksStart) {
        setFormValidationHint("Please accept the terms to continue.");
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
        void resolveClientGeoHints();
        const geo = peekClientGeoHints();
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
          ...(shouldSendSandboxConversationFlag(embedEnv) ? { sandbox: true } : {}),
        });
        persistConversationId(persistenceKey, created.conversationId);
        if (created.resumed) {
          if (created.talkToAgentRequested || created.handoverRequested) {
            setEscalated(true);
            escalatedRef.current = true;
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
      embedEnv,
      fields,
      mode,
      parentPageUrl,
      persistenceKey,
      selectedInquiry,
      inquiryRequired,
      inquiryFallback,
      visitorSessionId,
      websiteId,
      consentBlocksStart,
    ],
  );

  startConversationRef.current = async () => {
    await beginConversation(buildDefaultFormValues(fields) as Record<string, unknown>);
  };

  useEffect(() => {
    if (!resumeChecked || needsPrechatGate || chat.conversationId) {
      return;
    }
    void startConversationRef.current?.();
  }, [resumeChecked, needsPrechatGate, chat.conversationId]);

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
    if (consentBlocksStart) {
      setFormValidationHint("Please accept the terms to continue.");
      return;
    }
    setSelectedInquiry(inquiryFallback);
    setInquiryPickError(false);
    if (!formEnabled) {
      void beginConversation(buildDefaultFormValues(fields) as Record<string, unknown>);
    }
  };

  const submitOfflineForm = useCallback(
    async (values: Record<string, unknown>) => {
      if (!websiteId.trim()) {
        setSubmitError("This widget is not linked to a website yet.");
        return;
      }
      setSubmitBusy(true);
      setSubmitError(null);
      setFormValidationHint(null);
      try {
        const { visitor, firstMessage } = buildVisitorPayloadParts(
          values,
          offlineFields,
          visitorSessionId,
          "Offline inquiry",
        );
        void resolveClientGeoHints();
        const geo = peekClientGeoHints();
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
          deferInitialAiReply: true,
          ...(shouldSendSandboxConversationFlag(embedEnv) ? { sandbox: true } : {}),
        });
        persistConversationId(persistenceKey, created.conversationId);
        setOfflineFormSubmitted(true);
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
    [
      chat,
      embedEnv,
      offlineFields,
      parentPageUrl,
      persistenceKey,
      visitorSessionId,
      websiteId,
    ],
  );

  const onOfflineFormSubmit = offlineFormHook.handleSubmit(
    async (values) => {
      await submitOfflineForm(values as Record<string, unknown>);
    },
    () => {
      setFormValidationHint("Please fill in all required fields.");
    },
  );

  const [draft, setDraft] = useState("");
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const visitorTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraft("");
    if (visitorTypingTimerRef.current) {
      clearTimeout(visitorTypingTimerRef.current);
      visitorTypingTimerRef.current = null;
    }
    if (chat.conversationId) {
      chat.emitStopTyping();
    }
  }, [chat.conversationId]);

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

  const composerDisabled = submitBusy || !chat.conversationId;

  const sendDraft = async () => {
    const text = normalizeChatMessageText(draft);
    if (!text || composerDisabled) return;

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
    try {
      await chat.sendMessage(text);
      setSubmitError(null);
      scrollTranscriptToBottom(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not send your message. Please try again.",
      );
      setAiPending(false);
      aiPendingSinceRef.current = null;
    } finally {
      if (!shouldUseAiBridge) {
        setAiPending(false);
        aiPendingSinceRef.current = null;
      }
    }
  };

  const runTalkToAgent = async () => {
    if (!chat.conversationId || talkToAgentBusy) return;
    setTalkToAgentBusy(true);
    setEscalated(true);
    escalatedRef.current = true;
    if (chat.conversationId) {
      persistHybridEscalated(persistenceKey, chat.conversationId);
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
          persistHybridEscalated(persistenceKey, chat.conversationId);
        }
      }
    } else {
      setEscalated(false);
      escalatedRef.current = false;
      clearHybridEscalated(persistenceKey);
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

  if (mode === "AGENT_ONLY" && !availabilityChecked) {
    return (
      <Box sx={embedContainerSx}>
        <Typography variant="body2" sx={{ opacity: 0.75, p: embedded ? 1.5 : 2 }}>
          Checking availability…
        </Typography>
      </Box>
    );
  }

  if (offlineFormSubmitted) {
    return (
      <Box
        sx={[
          embedContainerSx,
          appearance ? { color: appearance.colors.bodyText } : {},
        ]}
      >
        <Stack spacing={1.25} sx={{ px: embedded ? 1.5 : 0, py: embedded ? 0.75 : 0 }}>
          <Typography variant="body2" sx={{ color: "success.main" }}>
            Thanks — we received your message. We will get back to you soon.
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (offlineMessageOnly && appearance) {
    return (
      <Box sx={[embedContainerSx, { color: appearance.colors.bodyText }]}>
        <Stack spacing={1.25} sx={{ px: embedded ? 1.5 : 0, py: embedded ? 0.75 : 0 }}>
          <EmbedChatBubble appearance={appearance} role="greeting">
            {appearance.offlineMessage?.trim() || "We are currently offline."}
          </EmbedChatBubble>
        </Stack>
      </Box>
    );
  }

  if (offlineCaptureActive && appearance) {
    const offlineTitle = appearance.offlineForm.title?.trim() || "Leave us a message";
    const offlineSubtitle = appearance.offlineForm.subtitle?.trim() ?? "";
    const offlineSubmitLabel =
      appearance.offlineForm.submitLabel?.trim() || "Send message";

    return (
      <Box sx={[embedContainerSx, { color: appearance.colors.bodyText }]}>
        <Stack
          spacing={1.25}
          sx={{
            width: "100%",
            alignItems: "stretch",
            px: embedded ? 1.5 : 0,
            py: embedded ? 0.75 : 0,
          }}
        >
          {appearance.offlineMessage?.trim() ? (
            <EmbedChatBubble appearance={appearance} role="greeting">
              {appearance.offlineMessage}
            </EmbedChatBubble>
          ) : null}
          <Box
            component="form"
            onSubmit={onOfflineFormSubmit}
            sx={embedPrechatFormBubbleShellSx()}
          >
            <Box sx={embedPrechatFormBubbleInnerSx(appearance)}>
              <Stack spacing={1 * (appearance.densityTokens.stackGapMultiplier ?? 1)}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    component="p"
                    sx={{
                      m: 0,
                      mb: offlineSubtitle ? 0.35 : 0,
                      fontWeight: 600,
                      color: "inherit",
                      fontFamily: appearance.colors.fontFamily,
                    }}
                  >
                    {offlineTitle}
                  </Typography>
                  {offlineSubtitle ? (
                    <Typography variant="body2" component="p" sx={{ m: 0, opacity: 0.88 }}>
                      {offlineSubtitle}
                    </Typography>
                  ) : null}
                </Box>
                {offlineFields.map((f) => (
                  <PrechatFieldRenderer
                    key={`offline-${f.key}`}
                    field={f}
                    control={offlineFormHook.control}
                    appearance={appearance}
                  />
                ))}
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
                <EmbedActionButton
                  type="submit"
                  appearance={appearance}
                  fullWidth
                  disabled={submitBusy}
                  sx={{ mt: 0.5 }}
                >
                  {submitBusy ? "Sending…" : offlineSubmitLabel}
                </EmbedActionButton>
              </Stack>
            </Box>
          </Box>
        </Stack>
      </Box>
    );
  }

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
        <Stack
          spacing={1.25}
          sx={{
            width: "100%",
            alignItems: "stretch",
            px: embedded ? 1.5 : 0,
            py: embedded ? 0.75 : 0,
          }}
        >
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
                            if (consentBlocksStart) {
                              setFormValidationHint("Please accept the terms to continue.");
                              return;
                            }
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
                  disabled={submitBusy || consentBlocksStart}
                  sx={{ mt: 0.5 }}
                >
                  {submitBusy
                    ? "Starting…"
                    : appearance.form.submitLabel ?? "Start chat"}
                </EmbedActionButton>
              ) : null}
              {!showPrechatForm &&
              !hasInquiryStep &&
              appearance?.consentRequired ? (
                <EmbedActionButton
                  type="button"
                  appearance={appearance}
                  fullWidth
                  disabled={submitBusy || consentBlocksStart}
                  sx={{ mt: 0.5 }}
                  onClick={() =>
                    void beginConversation(
                      buildDefaultFormValues(fields) as Record<string, unknown>,
                    )
                  }
                >
                  {submitBusy ? "Starting…" : "Start chat"}
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
      {!embedded && appearance?.chatBox.headerTitle.trim() ? (
        <EmbedChatPanelHeaderRow
          appearance={appearance}
          title={appearance.chatBox.headerTitle.trim()}
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
        {!mergeDisplayMessages.length &&
        appearance?.firstMessage?.trim() &&
        !greetingAlreadyShown ? (
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
        {assistantHandlesChat &&
        !escalated &&
        (chat.botReplying || chat.botStreamingText.trim()) &&
        appearance ? (
          <EmbedChatBubble appearance={appearance} role="assistant">
            {chat.botStreamingText.trim() || "…"}
          </EmbedChatBubble>
        ) : null}
        {chat.agentTypingSeen && appearance ? (
          <EmbedChatBubble appearance={appearance} role="assistant">
            <EmbedTypingDots color={appearance.colors.incomingBubbleText} />
          </EmbedChatBubble>
        ) : null}
      </Stack>

      <Box
        sx={
          appearance
            ? embedComposerFooterStackSx(appearance)
            : { flexShrink: 0, width: "100%", mt: "auto" }
        }
      >
        {submitBusy && !chat.conversationId ? (
          <Typography
            variant="caption"
            sx={
              appearance
                ? { ...embedMutedTextSx(appearance), display: "block", mb: 0.5 }
                : { display: "block", mb: 0.5, opacity: 0.75 }
            }
          >
            Starting chat…
          </Typography>
        ) : null}
        {submitError ? (
          <Typography variant="caption" color="error" sx={{ display: "block", mb: 0.5 }}>
            {submitError}
          </Typography>
        ) : null}
        <Stack
          direction="row"
          sx={
            appearance
              ? (embedComposerRowSx(appearance) as object)
              : { display: "flex", alignItems: "flex-end", gap: 1, width: "100%" }
          }
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              placeholder={sendPlaceholder}
              fullWidth
              multiline
              minRows={1}
              maxRows={4}
              variant="outlined"
              size="small"
              disabled={composerDisabled}
              autoComplete="off"
              onKeyDown={(ev) => {
                if (ev.key === "Enter" && !ev.shiftKey) {
                  ev.preventDefault();
                  void sendDraft();
                }
              }}
              inputProps={{
                autoComplete: "off",
                "aria-label": "Message",
                "data-1p-ignore": "true",
                "data-lpignore": "true",
              }}
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
            disabled={composerDisabled || !normalizeChatMessageText(draft)}
            sx={
              appearance
                ? embedSendButtonSx(appearance)
                : { color: accentColor ?? "primary.main" }
            }
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
            fullWidth
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
  const placeholder = field.placeholder?.trim() || undefined;
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
              placeholder={placeholder}
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
              placeholder={placeholder}
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
            placeholder={placeholder}
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
        let originHost: string | undefined;
        try {
          originHost = parentPageUrl?.trim()
            ? new URL(parentPageUrl).host
            : undefined;
        } catch {
          originHost = undefined;
        }
        const result = await postTextUsSubmit({
          widgetKey,
          websiteId: websiteId.trim(),
          fieldValues: values as Record<string, unknown>,
          originHost,
        });
        if (!result.ok) {
          setSubmitError(result.message || "Could not send your message.");
          return;
        }
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
    if (!appearance) {
      return (
        <Typography variant="body2" color="text.secondary">
          Thanks — we received your message.
        </Typography>
      );
    }
    return (
      <Stack spacing={1.25}>
        <EmbedChatBubble appearance={appearance} role="greeting">
          Thanks — we received your message.
        </EmbedChatBubble>
        <Typography variant="body2" sx={appearance ? embedMutedTextSx(appearance) : undefined}>
          We will get back to you shortly.
        </Typography>
      </Stack>
    );
  }

  const fieldSpacing = appearance
    ? Math.max(0.75, appearance.densityTokens.stackGapMultiplier)
    : 1;

  return (
    <Stack component="form" spacing={fieldSpacing} onSubmit={onSubmit}>
      {!embedded && appearance?.form.title?.trim() ? (
        <Typography variant="subtitle2" sx={embedLabelTextSx(appearance)}>
          {appearance.form.title}
        </Typography>
      ) : null}
      {!embedded && appearance?.form.subtitle?.trim() ? (
        <Typography variant="body2" sx={embedMutedTextSx(appearance)}>
          {appearance.form.subtitle}
        </Typography>
      ) : null}
      {fields.map((f) => (
        <PrechatFieldRenderer key={f.key} field={f} control={form.control} appearance={appearance} />
      ))}
      {formValidationHint ? (
        <Typography variant="caption" sx={{ color: appearance?.colors.primary ?? "error.main" }}>
          {formValidationHint}
        </Typography>
      ) : null}
      {submitError ? (
        <Typography variant="caption" sx={{ color: appearance?.colors.primary ?? "error.main" }}>
          {submitError}
        </Typography>
      ) : null}
      {appearance ? (
        <EmbedActionButton type="submit" appearance={appearance} fullWidth disabled={submitBusy}>
          {submitBusy ? "Sending…" : appearance.form.submitLabel || "Send"}
        </EmbedActionButton>
      ) : (
        <MuiButton type="submit" variant="contained" fullWidth disabled={submitBusy}>
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
  const richCard = readMessageRichCard(message.metadata);
  const showRichCard = isRichCardMessage(message.metadata) && richCard;
  const showAvatar =
    Boolean(appearance) &&
    (!alignRight
      ? appearance!.avatars.agent.enabled
      : appearance!.avatars.visitor.enabled);

  const bubbleInner = (
    <Box
      sx={
        appearance ? embedTranscriptBubbleInnerSx(appearance, bubbleRole) : {}
      }
    >
      {showRichCard ? (
        <EmbedProductRichCard
          card={richCard}
          text={message.content}
          appearance={appearance}
        />
      ) : (
        <ChatFormattedMessage
          text={message.content}
          linkColor={appearance?.colors.primary ?? "#2563eb"}
        />
      )}
    </Box>
  );

  if (!appearance) {
    return <Box>{bubbleInner}</Box>;
  }

  const rowAlign = alignRight ? "end" : "start";
  const avatarVariant = alignRight ? "visitor" : "agent";
  const avatarDisplay = resolveEmbedChatAvatarDisplay(appearance, avatarVariant);
  const mirrorAvatarColumn = shouldMirrorEmbedChatAvatarColumn(
    appearance,
    rowAlign,
    showAvatar,
  );

  if (showAvatar || mirrorAvatarColumn) {
    const avatarNode = showAvatar ? (
      <EmbedAgentAvatar
        avatarUrl={avatarDisplay.url}
        preset={avatarDisplay.preset}
        accentColor={appearance.launcher.buttonColor}
        size={EMBED_CHAT_AVATAR_SIZE_PX}
        variant={avatarVariant}
        sx={{ flexShrink: 0 }}
      />
    ) : (
      <Box sx={embedChatAvatarSpacerSx()} aria-hidden />
    );
    const bubbleNode = (
      <Box sx={{ ...embedChatBubbleShellSx(rowAlign), mb: 0 }}>{bubbleInner}</Box>
    );

    return (
      <Box sx={embedChatBubbleRowSx(rowAlign)}>
        {alignRight ? (
          <>
            {bubbleNode}
            {avatarNode}
          </>
        ) : (
          <>
            {avatarNode}
            {bubbleNode}
          </>
        )}
      </Box>
    );
  }

  return (
    <Box sx={embedChatBubbleShellSx(alignRight ? "end" : "start")}>
      {bubbleInner}
    </Box>
  );
}
