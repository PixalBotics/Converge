"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import ChatRounded from "@mui/icons-material/ChatRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import Send from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";
import MuiButton from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Typography } from "@/components/common";
import { EmbedActionButton } from "@/components/embed/EmbedActionButton";
import { EmbedInputField } from "@/components/embed/EmbedInputField";
import { normalizeChatMessageText } from "@/lib/safe-markdown/text";
import { useVisitorChat } from "@/lib/hooks/chat/useVisitorChat";
import { LauncherPresetIcon } from "@/lib/chat-widget/launcherIcons";
import {
  resolveInquiryRoutingTargets,
  type RuntimeInquiryOption,
} from "@/lib/chat-widget/widget-inquiry.types";
import {
  buildDefaultFormValues,
  buildDynamicPrechatZod,
  buildVisitorPayloadParts,
  extractPrechatFieldsFromWidgetConfig,
  type PrechatFieldDto,
} from "@/lib/widget-runtime/prechat-form";
import {
  extractRuntimeChatAppearance,
  launcherBorderRadius,
  launcherEmbedRootSx,
  resolveRuntimeConfigRecord,
  type RuntimeChatAppearance,
} from "@/lib/widget-runtime/widget-runtime-appearance";
import {
  EMBED_LAUNCHER_SIZE_PX,
  postEmbedHostResize,
} from "@/lib/widget-runtime/embed-host-messaging";
import { useEmbedHostResize } from "@/lib/widget-runtime/use-embed-host-resize";
import {
  embedBodyTextSx,
  embedGreetingBubbleSx,
  embedHandoverButtonSx,
  embedIconButtonAccentSx,
  embedInputFieldSx,
  embedInquiryPillSx,
  embedLabelTextSx,
  embedMessageBubbleSx,
  embedMutedTextSx,
  embedNativeInputStyle,
  embedPanelPaperSx,
  embedPrimaryButtonSx,
  embedSendButtonSx,
  resolveEmbedMessageBubbleRole,
} from "@/lib/widget-runtime/embed-theme-sx";
import { EmbedWidgetBanner } from "@/components/embed/EmbedWidgetBanner";
import { EmbedWidgetTheme } from "@/components/embed/EmbedWidgetTheme";
import {
  getWidgetRuntimeConfig,
  postAiVisitorRespond,
  postWidgetSession,
} from "@/lib/widget-runtime/widget-public-fetch";
import type { WidgetConfigEnvelope } from "@/lib/widget-runtime/widget-types";
import {
  formatKnowledgeMatchCitation,
  resolveVisitorAiMessageContent,
} from "@/lib/widget-runtime/visitor-ai-display";
import { decodeJwtExpMs } from "@/lib/widget-runtime/jwt-expiry";
import {
  generateClientSessionId,
  persistConversationId,
  persistVisitorSessionId,
  readVisitorSessionId,
  saveWidgetJwt,
} from "@/lib/widget-runtime/browser-storage";
import type { ChatMessage } from "@/services/chat/chat.types";

type BootState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; config: WidgetConfigEnvelope; sessionToken: string };

export interface EmbedWidgetClientProps {
  widgetKey: string;
  parentHost: string;
  parentPageUrl: string;
}

export function EmbedWidgetClient({
  widgetKey,
  parentHost,
  parentPageUrl,
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
          width: EMBED_LAUNCHER_SIZE_PX,
          height: EMBED_LAUNCHER_SIZE_PX,
          bgcolor: loadingAppearance.launcher.buttonColor,
          color: loadingAppearance.launcher.iconColor,
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

/** Bottom-right launcher: icon only → panel with welcome → (chat) form → chat */
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
}) {
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [welcomeAck, setWelcomeAck] = useState(false);

  useEffect(() => {
    setWelcomeAck(readWelcomeAcknowledged(widgetKey));
  }, [widgetKey]);

  useEffect(() => {
    if (!appearance.autoOpenEnabled || appearance.autoOpenDelaySeconds <= 0) return;
    const id = window.setTimeout(() => {
      setLauncherOpen(true);
      postEmbedHostResize(true, appearance);
    }, appearance.autoOpenDelaySeconds * 1000);
    return () => window.clearTimeout(id);
  }, [appearance.autoOpenEnabled, appearance.autoOpenDelaySeconds, appearance]);

  const acknowledgeWelcome = () => {
    setWelcomeAck(true);
    writeWelcomeAcknowledged(widgetKey);
  };

  const { launcher, chatBox } = appearance;
  useEmbedHostResize(launcherOpen, appearance);

  const toggleLauncher = () => {
    const next = !launcherOpen;
    postEmbedHostResize(next, appearance);
    setLauncherOpen(next);
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
        {launcherOpen ? (
          <Paper
            elevation={12}
            sx={{
              width: chatBox.boxWidth,
              height: chatBox.boxHeight,
              maxWidth: `calc(100vw - ${sidePad}px)`,
              maxHeight: "min(85vh, calc(100vh - 96px))",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
              ...embedPanelPaperSx(appearance),
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                px: 2,
                py: 1.25,
                bgcolor: chatBox.headerBg,
                color: chatBox.headerTextColor,
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{
                  letterSpacing: 0.02,
                  flex: 1,
                  textAlign: chatBox.headerAlign,
                  color: "inherit",
                }}
              >
                {chatBox.headerTitle}
              </Typography>
              <IconButton
                type="button"
                aria-label="Minimize widget"
                size="small"
                onClick={() => setLauncherOpen(false)}
                sx={{ color: "inherit", ml: 1 }}
              >
                <CloseRounded fontSize="small" />
              </IconButton>
            </Stack>

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                p: welcomeAck ? 0 : appearance.densityTokens.panelPaddingPx / 8,
                bgcolor: chatBox.backgroundColor,
              }}
            >
              {!welcomeAck ? (
                <Stack spacing={2} sx={{ pt: 0.5 }}>
                  <EmbedWidgetBanner banner={appearance.banner} appearance={appearance} />
                  <Typography variant="body1" fontWeight={600} sx={embedBodyTextSx(appearance)}>
                    {appearance.form.title || welcomeText || "How can we help?"}
                  </Typography>
                  <Typography variant="body2" sx={embedMutedTextSx(appearance)}>
                    {appearance.form.subtitle ||
                      appearance.panelGreetingMessage ||
                      welcomeText}
                  </Typography>
                  <EmbedActionButton
                    type="button"
                    appearance={appearance}
                    fullWidth
                    onClick={acknowledgeWelcome}
                  >
                    Continue
                  </EmbedActionButton>
                </Stack>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  <Box sx={{ p: welcomeAck ? appearance.densityTokens.panelPaddingPx / 8 : 0 }}>
                    <WidgetChatPanel
                      embedded
                      widgetKey={widgetKey}
                      websiteId={websiteId}
                      parentPageUrl={parentPageUrl}
                      mode={mode}
                      sessionToken={sessionToken}
                      configRecord={configRecord}
                      appearance={appearance}
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

        <IconButton
          type="button"
          aria-label={
            launcherOpen
              ? "Close widget window"
              : launcher.buttonLabel?.trim() || "Open chat widget"
          }
          onClick={toggleLauncher}
          sx={{
            width: EMBED_LAUNCHER_SIZE_PX,
            height: EMBED_LAUNCHER_SIZE_PX,
            flexShrink: 0,
            borderRadius: launcherBorderRadius(launcher.shape),
            bgcolor: launcher.buttonColor,
            color: launcher.iconColor,
            boxShadow: "0 8px 28px rgba(0,0,0,0.28)",
            "&:hover": {
              bgcolor: launcher.buttonHoverColor,
              color: launcher.iconColor,
            },
          }}
        >
          {launcherOpen ? (
            <CloseRounded sx={{ fontSize: 28 }} />
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
            bgcolor: "secondary.main",
            color: "secondary.contrastText",
            boxShadow: "0 8px 28px rgba(0,0,0,0.28)",
            "&:hover": { bgcolor: "secondary.dark", color: "secondary.contrastText" },
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
}: {
  widgetKey: string;
  parentPageUrl: string;
  envelope: WidgetConfigEnvelope;
  sessionToken: string;
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
  widgetKey,
  websiteId,
  parentPageUrl,
  mode,
  sessionToken,
  configRecord,
  appearance,
}: {
  embedded?: boolean;
  widgetKey: string;
  websiteId: string;
  parentPageUrl: string;
  mode: string;
  sessionToken: string;
  configRecord: Record<string, unknown>;
  appearance?: RuntimeChatAppearance;
}) {
  const sendPlaceholder =
    appearance?.chatBox.sendPlaceholder ?? "Write a message…";
  const panelBg = appearance?.chatBox.backgroundColor;
  const accentColor = appearance?.launcher.buttonColor;
  const siteKey = `${widgetKey}:${websiteId}`;
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
  const hasInquiryStep = inquiryOptions.length > 0;
  const [prechatDone, setPrechatDone] = useState(!formEnabled);
  const [prechatStep, setPrechatStep] = useState<"inquiry" | "form">(
    hasInquiryStep ? "inquiry" : "form",
  );
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<RuntimeInquiryOption | null>(
    null,
  );

  useEffect(() => {
    setPrechatDone(!formEnabled);
    setPrechatStep(hasInquiryStep ? "inquiry" : "form");
    setSelectedInquiry(null);
    if (!appearance?.consentRequired) setConsentAccepted(true);
  }, [formEnabled, hasInquiryStep, appearance?.consentRequired]);
  const [aiPending, setAiPending] = useState(false);
  /** HYBRID only: set true when visitor taps "Talk to a human" — never from API shouldEscalate (that was forcing queue UI + repeated handoff replies). */
  const [escalated, setEscalated] = useState(false);
  const [localAiMessages, setLocalAiMessages] = useState<ChatMessage[]>([]);

  const visitorSessionId = useMemo(() => {
    const existing = readVisitorSessionId(siteKey);
    if (existing) return existing;
    const created = generateClientSessionId();
    persistVisitorSessionId(siteKey, created);
    return created;
  }, [siteKey]);

  const pageUrlGetter = useCallback(() => parentPageUrl, [parentPageUrl]);

  const chat = useVisitorChat({
    autoConnect: false,
    widgetSessionToken: sessionToken,
    getCurrentPageUrl: pageUrlGetter,
  });

  const mergeDisplayMessages = useMemo(() => {
    const map = new Map<string, ChatMessage>();
    const add = (m: ChatMessage) => {
      const k = m.id ?? `${m.role}-${m.createdAt}-${m.content}`;
      map.set(k, m);
    };
    chat.messages.forEach(add);
    localAiMessages.forEach(add);
    return [...map.values()].sort((a, b) =>
      String(a.createdAt).localeCompare(String(b.createdAt)),
    );
  }, [chat.messages, localAiMessages]);

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

  const onPrechatSubmit = form.handleSubmit(async (values) => {
    if (hasInquiryStep && !selectedInquiry) return;
    const { visitor, firstMessage } = buildVisitorPayloadParts(
      values as Record<string, unknown>,
      fields,
      visitorSessionId,
      selectedInquiry?.label,
    );
    const routingTargets = selectedInquiry
      ? resolveInquiryRoutingTargets(selectedInquiry)
      : { departmentId: null, poolId: null };
    const created = await chat.startConversation({
      websiteId,
      visitor,
      firstMessage,
      currentPageUrl: parentPageUrl,
      referrerUrl: typeof document !== "undefined" ? document.referrer : "",
      routingKey: selectedInquiry?.routingKey,
      serviceChannel:
        selectedInquiry?.serviceChannel === "external" ? "External" : "Internal",
      inquiryDepartmentId: routingTargets.departmentId ?? undefined,
      inquiryPoolId: routingTargets.poolId ?? undefined,
      inquiryLabel: selectedInquiry?.label,
    });
    persistConversationId(siteKey, created.conversationId);

    const originHostSafe = safeHostname(parentPageUrl);

    if (mode === "AI_ONLY" || mode === "HYBRID") {
      setAiPending(true);
      const aiRes = await postAiVisitorRespond(
        {
          message: firstMessage,
          websiteId: websiteId.trim() || undefined,
          conversationId: created.conversationId,
          widgetKey,
          originHost: originHostSafe,
          currentPageUrl: parentPageUrl.trim() || undefined,
        },
        sessionToken,
      );
      setAiPending(false);
      if (aiRes.ok) {
        appendAiAssistant(
          created.conversationId,
          resolveVisitorAiMessageContent(
            aiRes.data.response,
            aiRes.data.knowledgeMatches,
          ),
          {
            knowledgeMatches: aiRes.data.knowledgeMatches,
            intent: aiRes.data.intent,
          },
        );
      }
    }
    setPrechatDone(true);
  });

  const [draft, setDraft] = useState("");

  const sendDraft = async () => {
    const text = normalizeChatMessageText(draft);
    if (!text || !chat.conversationId) return;

    /** HYBRID: AI replies until the visitor taps "Talk to a human"; then only visitor→agent messages run until an agent joins. */
    const shouldUseAiBridge =
      mode === "AI_ONLY" || (mode === "HYBRID" && !escalated);

    if (!shouldUseAiBridge) {
      await chat.sendMessage(text);
      setDraft("");
      return;
    }

    await chat.sendMessage(text);
    setDraft("");
    setAiPending(true);
    const aiRes = await postAiVisitorRespond(
      {
        message: text,
        websiteId: websiteId.trim() || undefined,
        conversationId: chat.conversationId,
        widgetKey,
        originHost: safeHostname(parentPageUrl),
        currentPageUrl: parentPageUrl.trim() || undefined,
      },
      sessionToken,
    );
    setAiPending(false);
    if (aiRes.ok) {
      appendAiAssistant(
        chat.conversationId,
        resolveVisitorAiMessageContent(aiRes.data.response, aiRes.data.knowledgeMatches),
        {
          knowledgeMatches: aiRes.data.knowledgeMatches,
        },
      );
    }
  };

  const embedContainerSx = embedded
    ? { border: "none", borderRadius: 0, p: 1, bgcolor: "transparent", boxShadow: "none" }
    : {
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        bgcolor: "background.paper",
      };

  if (!prechatDone) {
    const welcomeLine =
      appearance?.welcomeMessage?.trim() ||
      appearance?.panelGreetingMessage?.trim() ||
      appearance?.firstMessage?.trim() ||
      "";

    if (prechatStep === "inquiry" && hasInquiryStep) {
      return (
        <Box sx={{ ...embedContainerSx, color: appearance?.colors.bodyText }}>
          {appearance ? (
            <EmbedWidgetBanner banner={appearance.banner} appearance={appearance} />
          ) : null}
          {welcomeLine ? (
            <Typography
              variant="body2"
              sx={{ mb: 1.5, ...(appearance ? embedGreetingBubbleSx(appearance) : {}) }}
            >
              {welcomeLine}
            </Typography>
          ) : null}
          <Typography
            variant="subtitle2"
            sx={{ mb: 0.5, ...(appearance ? embedBodyTextSx(appearance) : {}) }}
          >
            What would you like help with?
          </Typography>
          <Stack
            direction="row"
            spacing={appearance?.densityTokens.stackGapMultiplier ?? 1}
            flexWrap="wrap"
            sx={{ mb: 1 }}
          >
            {inquiryOptions.map((opt) => (
              <MuiButton
                key={`${opt.routingKey}-${opt.label}`}
                type="button"
                variant="outlined"
                onClick={() => {
                  setSelectedInquiry(opt);
                  setPrechatStep("form");
                }}
                sx={
                  appearance
                    ? embedInquiryPillSx(
                        appearance,
                        selectedInquiry?.routingKey === opt.routingKey,
                      )
                    : undefined
                }
              >
                {opt.label}
              </MuiButton>
            ))}
          </Stack>
        </Box>
      );
    }

    return (
      <Box sx={{ ...embedContainerSx, color: appearance?.colors.bodyText }}>
        {appearance ? (
          <EmbedWidgetBanner banner={appearance.banner} appearance={appearance} />
        ) : null}
        <Typography
          variant="subtitle2"
          sx={{ mb: 0.5, ...(appearance ? embedBodyTextSx(appearance) : {}) }}
        >
          {appearance?.form.title ?? "Before we start"}
        </Typography>
        {appearance?.form.subtitle ? (
          <Typography variant="body2" sx={{ mb: 1, ...embedMutedTextSx(appearance) }}>
            {appearance.form.subtitle}
          </Typography>
        ) : null}
        {selectedInquiry ? (
          <Typography variant="caption" sx={{ mb: 1, ...embedMutedTextSx(appearance) }}>
            Topic: {selectedInquiry.label}
            {hasInquiryStep ? (
              <>
                {" · "}
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  sx={{ color: appearance?.launcher.buttonColor, font: "inherit" }}
                  onClick={() => setPrechatStep("inquiry")}
                >
                  Change
                </Link>
              </>
            ) : null}
          </Typography>
        ) : null}

        <Stack
          component="form"
          spacing={1.25 * (appearance?.densityTokens.stackGapMultiplier ?? 1)}
          onSubmit={onPrechatSubmit}
        >
          {fields.map((f) => (
            <PrechatFieldRenderer
              key={f.key}
              field={f}
              control={form.control}
              appearance={appearance}
            />
          ))}
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
          {appearance ? (
            <EmbedActionButton
              type="submit"
              appearance={appearance}
              fullWidth
              disabled={appearance.consentRequired ? !consentAccepted : false}
            >
              {appearance.form.submitLabel ?? "Start chat"}
            </EmbedActionButton>
          ) : null}
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={
        embedded
          ? {
              border: "none",
              borderRadius: 0,
              p: 1,
              bgcolor: "transparent",
              display: "flex",
              flexDirection: "column",
              gap: 1,
              minHeight: 280,
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
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2" sx={appearance ? embedBodyTextSx(appearance) : undefined}>
          Conversation
        </Typography>
        <Typography variant="caption" sx={appearance ? embedMutedTextSx(appearance) : undefined}>
          {!chat.isConnected && appearance?.offlineMessage?.trim()
            ? "Offline"
            : chat.isConnected
              ? "Live"
              : "Connecting…"}
        </Typography>
      </Stack>

      {!chat.isConnected && appearance?.offlineMessage?.trim() ? (
        <Typography variant="caption" sx={appearance ? embedMutedTextSx(appearance) : undefined}>
          {appearance.offlineMessage}
        </Typography>
      ) : null}

      {mode === "HYBRID" && escalated ? (
        <Typography variant="caption" sx={appearance ? embedMutedTextSx(appearance) : undefined}>
          Waiting for an available teammate — you can keep typing here.
        </Typography>
      ) : null}

      {chat.agentTypingSeen ? (
        <Typography variant="caption" sx={appearance ? embedMutedTextSx(appearance) : undefined}>
          Someone is typing…
        </Typography>
      ) : null}

      {aiPending ? (
        <Typography variant="caption" sx={appearance ? embedMutedTextSx(appearance) : undefined}>
          Assistant is thinking…
        </Typography>
      ) : null}

      <Stack
        spacing={appearance?.densityTokens.stackGapMultiplier ?? 1}
        sx={{
          flex: 1,
          overflowY: "auto",
          minHeight: 160,
          maxHeight: 280,
          pr: 0.5,
        }}
      >
        {!mergeDisplayMessages.length && appearance?.chatBox.greetingMessage ? (
          <Box
            sx={{
              alignSelf: "flex-start",
              maxWidth: "88%",
              px: 1.25,
              py: 1,
              borderRadius: 2,
              ...embedGreetingBubbleSx(appearance),
            }}
          >
            <Typography variant="body2" sx={{ color: "inherit" }}>
              {appearance.chatBox.greetingMessage}
            </Typography>
          </Box>
        ) : null}
        {!mergeDisplayMessages.length && appearance?.firstMessage?.trim() ? (
          <Box
            sx={{
              alignSelf: "flex-start",
              maxWidth: "88%",
              px: 1.25,
              py: 1,
              borderRadius: 2,
              bgcolor: appearance.colors.incomingBubbleBg,
              color: appearance.colors.incomingBubbleText,
            }}
          >
            <Typography variant="body2" sx={{ color: "inherit" }}>
              {appearance.firstMessage}
            </Typography>
          </Box>
        ) : null}
        {mergeDisplayMessages.map((m) => (
          <MessageBubble
            key={m.id ?? `${m.createdAt}-${m.content}-${m.role}`}
            message={m}
            appearance={appearance}
          />
        ))}
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ flex: 1 }} onKeyDown={(ev) => {
          if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            void sendDraft();
          }
        }}>
          <TextField
            name="composer"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={sendPlaceholder}
            fullWidth
            variant="outlined"
            sx={
              appearance
                ? { ...embedInputFieldSx(appearance), "& .MuiFormHelperText-root": { display: "none" } }
                : { "& .MuiFormHelperText-root": { display: "none" } }
            }
          />
        </Box>
        <IconButton
          onClick={() => void sendDraft()}
          aria-label="Send"
          sx={appearance ? embedSendButtonSx(appearance) : { color: accentColor ?? "primary.main" }}
        >
          <Send />
        </IconButton>
      </Stack>

      {mode === "HYBRID" &&
      !escalated &&
      (appearance?.agentHandoverEnabled ?? true) ? (
        <MuiButton
          type="button"
          variant="outlined"
          onClick={() => {
            void (async () => {
              setEscalated(true);
              if (chat.conversationId) {
                await chat.sendMessage(
                  "[Escalation requested] Please connect me with a human specialist.",
                );
              }
            })();
          }}
          sx={appearance ? embedHandoverButtonSx(appearance) : undefined}
        >
          {appearance?.handoverTriggerText ?? "Talk to a human"}
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
    getCurrentPageUrl: () => parentPageUrl,
  });

  const [done, setDone] = useState(false);

  const onSubmit = form.handleSubmit(async (values) => {
    const { visitor, firstMessage } = buildVisitorPayloadParts(
      values as Record<string, unknown>,
      fields,
      visitorSessionId,
      "Text Us inquiry",
    );
    await chat.startConversation({
      websiteId,
      visitor,
      firstMessage,
      currentPageUrl: parentPageUrl,
      referrerUrl: typeof document !== "undefined" ? document.referrer : "",
    });
    setDone(true);
  });

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
      {appearance ? (
        <EmbedActionButton type="submit" appearance={appearance}>
          Send
        </EmbedActionButton>
      ) : (
        <MuiButton type="submit" variant="contained">
          Send
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

  const kmRaw = (
    message.metadata as { knowledgeMatches?: unknown[] } | undefined
  )?.knowledgeMatches;
  const citations = Array.isArray(kmRaw)
    ? kmRaw.map((c) => formatKnowledgeMatchCitation(c)).filter(Boolean)
    : [];

  return (
    <Box sx={{ alignSelf: alignRight ? "flex-end" : "flex-start", maxWidth: "92%" }}>
      <Box
        sx={{
          px: 1.25,
          py: 1,
          borderRadius: 2,
          ...(appearance ? embedMessageBubbleSx(appearance, bubbleRole) : {}),
        }}
      >
        <Typography
          variant="body2"
          component="div"
          sx={{ wordBreak: "break-word", whiteSpace: "pre-wrap", color: "inherit" }}
        >
          {normalizeChatMessageText(message.content)}
        </Typography>
      </Box>
      {citations.length ? (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.5,
            ...(appearance ? embedMutedTextSx(appearance) : {}),
          }}
        >
          Sources: {citations.join(", ")}
        </Typography>
      ) : null}
    </Box>
  );
}

function safeHostname(pageUrl: string): string {
  try {
    return new URL(pageUrl).hostname || "localhost";
  } catch {
    return typeof window !== "undefined" ? window.location.hostname : "localhost";
  }
}
