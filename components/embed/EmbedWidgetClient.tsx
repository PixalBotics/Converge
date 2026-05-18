"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import ChatRounded from "@mui/icons-material/ChatRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import Send from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
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
import { Button, InputField, Typography } from "@/components/common";
import { normalizeChatMessageText } from "@/lib/safe-markdown/text";
import { useVisitorChat } from "@/lib/hooks/chat/useVisitorChat";
import {
  buildDefaultFormValues,
  buildDynamicPrechatZod,
  buildVisitorPayloadParts,
  extractPrechatFieldsFromWidgetConfig,
  type PrechatFieldDto,
} from "@/lib/widget-runtime/prechat-form";
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
  deployKey: string;
  parentHost: string;
  parentPageUrl: string;
}

export function EmbedWidgetClient({
  widgetKey,
  deployKey,
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
        deployKey,
        originHost: originHost || "localhost",
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
  }, [widgetKey, deployKey, parentHost]);

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
          deployKey,
          originHost,
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
  }, [boot, deployKey, parentHost, widgetKey]);

  if (boot.phase === "loading") {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Loading widget…
        </Typography>
      </Box>
    );
  }

  if (boot.phase === "error") {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="error">
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
  textUsBelow,
}: {
  widgetKey: string;
  welcomeText: string;
  websiteId: string;
  parentPageUrl: string;
  mode: string;
  sessionToken: string;
  configRecord: Record<string, unknown>;
  textUsBelow?: ReactNode;
}) {
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [welcomeAck, setWelcomeAck] = useState(false);

  useEffect(() => {
    setWelcomeAck(readWelcomeAcknowledged(widgetKey));
  }, [widgetKey]);

  const acknowledgeWelcome = () => {
    setWelcomeAck(true);
    writeWelcomeAcknowledged(widgetKey);
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
              maxHeight: "min(580px, 85vh)",
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
              <Typography variant="subtitle2" fontWeight={700} sx={{ letterSpacing: 0.02 }}>
                Live chat
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

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                p: welcomeAck ? 0 : 2,
              }}
            >
              {!welcomeAck ? (
                <Stack spacing={2} sx={{ pt: 0.5 }}>
                  <Typography variant="body1" fontWeight={600}>
                    {welcomeText || "How can we help?"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Continue to reach our team—we’ll collect a few details before the conversation
                    starts.
                  </Typography>
                  <Button type="button" variant="primary" fullWidth onClick={acknowledgeWelcome}>
                    Continue
                  </Button>
                </Stack>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  <Box sx={{ p: welcomeAck ? 1.25 : 0 }}>
                    <WidgetChatPanel
                      embedded
                      widgetKey={widgetKey}
                      websiteId={websiteId}
                      parentPageUrl={parentPageUrl}
                      mode={mode}
                      sessionToken={sessionToken}
                      configRecord={configRecord}
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
          aria-label={launcherOpen ? "Close widget window" : "Open chat widget"}
          onClick={() => setLauncherOpen((o) => !o)}
          sx={{
            width: 58,
            height: 58,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            boxShadow: "0 8px 28px rgba(0,0,0,0.28)",
            "&:hover": { bgcolor: "primary.dark", color: "primary.contrastText" },
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
                  <Button type="button" variant="primary" fullWidth onClick={acknowledgeWelcome}>
                    Continue
                  </Button>
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

  const configRecord =
    envelope.config !== undefined && envelope.config !== null &&
    typeof envelope.config === "object"
      ? (envelope.config as Record<string, unknown>)
      : {};

  const mode = String(
    configRecord.mode ?? envelope.chatMode ?? "AGENT_ONLY",
  ).toUpperCase();

  const welcome =
    typeof configRecord.welcomeMessage === "string"
      ? configRecord.welcomeMessage.trim()
      : "";
  const websiteId = typeof envelope.websiteId === "string" ? envelope.websiteId : "";
  const textUsForm = resolveTextUsFormBinding(configRecord);

  if (chatOn) {
    return (
      <FloatingChatEmbed
        widgetKey={widgetKey}
        welcomeText={welcome || "How can we help?"}
        websiteId={websiteId}
        parentPageUrl={parentPageUrl}
        mode={mode}
        sessionToken={sessionToken}
        configRecord={configRecord}
        textUsBelow={
          textOn ? (
            <WidgetTextUsPanel
              embedded
              widgetKey={widgetKey}
              websiteId={websiteId}
              parentPageUrl={parentPageUrl}
              sessionToken={sessionToken}
              textUsFormConfig={textUsForm}
            />
          ) : undefined
        }
      />
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
}: {
  embedded?: boolean;
  widgetKey: string;
  websiteId: string;
  parentPageUrl: string;
  mode: string;
  sessionToken: string;
  configRecord: Record<string, unknown>;
}) {
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

  const [prechatDone, setPrechatDone] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const [aiPending, setAiPending] = useState(false);
  /** HYBRID only: set true when visitor taps "Talk to a human" — never from API shouldEscalate (that was forcing queue UI + repeated handoff replies). */
  const [escalated, setEscalated] = useState(false);
  const [localAiMessages, setLocalAiMessages] = useState<ChatMessage[]>([]);

  const inquiryOptions = useMemo(() => {
    const behavior = configRecord.behavior as
      | { inquiryOptions?: Array<{ label: string; value?: string }> }
      | undefined;
    return Array.isArray(behavior?.inquiryOptions)
      ? behavior!.inquiryOptions!
      : [];
  }, [configRecord]);

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
        role: "system",
        content,
        createdAt: new Date().toISOString(),
        id: `ai-${Date.now()}`,
        ...(meta ? { metadata: meta } : {}),
      },
    ]);
  };

  const onPrechatSubmit = form.handleSubmit(async (values) => {
    const { visitor, firstMessage } = buildVisitorPayloadParts(
      values as Record<string, unknown>,
      fields,
      visitorSessionId,
      selectedTopic,
    );
    const created = await chat.startConversation({
      websiteId,
      visitor,
      firstMessage,
      currentPageUrl: parentPageUrl,
      referrerUrl: typeof document !== "undefined" ? document.referrer : "",
      topic: selectedTopic,
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
    return (
      <Box sx={embedContainerSx}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary" }}>
          Tell us briefly how we can help
        </Typography>
        {inquiryOptions.length ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
            {inquiryOptions.map((opt) => (
              <Button
                key={opt.label}
                type="button"
                variant={selectedTopic === opt.label ? "primary" : "secondary"}
                onClick={() => setSelectedTopic(opt.label)}
              >
                {opt.label}
              </Button>
            ))}
          </Stack>
        ) : null}

        <Stack component="form" spacing={1.25} onSubmit={onPrechatSubmit}>
          {fields.map((f) => (
            <PrechatFieldRenderer key={f.key} field={f} control={form.control} />
          ))}
          <Button type="submit" variant="primary">
            Start chat
          </Button>
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
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              gap: 1,
              minHeight: 320,
            }
      }
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2">Conversation</Typography>
        <Typography variant="caption" color="text.secondary">
          {chat.isConnected ? "Live" : "Connecting…"}
        </Typography>
      </Stack>

      {mode === "HYBRID" && escalated ? (
        <Typography variant="caption" color="warning.main">
          Waiting for an available teammate — you can keep typing here.
        </Typography>
      ) : null}

      {chat.agentTypingSeen ? (
        <Typography variant="caption" color="text.secondary">
          Someone is typing…
        </Typography>
      ) : null}

      {aiPending ? (
        <Typography variant="caption" color="text.secondary">
          Assistant is thinking…
        </Typography>
      ) : null}

      <Stack
        spacing={1}
        sx={{
          flex: 1,
          overflowY: "auto",
          minHeight: 160,
          maxHeight: 280,
          pr: 0.5,
        }}
      >
        {mergeDisplayMessages.map((m) => (
          <MessageBubble key={m.id ?? `${m.createdAt}-${m.content}-${m.role}`} message={m} />
        ))}
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ flex: 1 }} onKeyDown={(ev) => {
          if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            void sendDraft();
          }
        }}>
          <InputField
            label=""
            name="composer"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a message…"
            sx={{ "& .MuiFormHelperText-root": { display: "none" } }}
          />
        </Box>
        <IconButton color="primary" onClick={() => void sendDraft()} aria-label="Send">
          <Send />
        </IconButton>
      </Stack>

      {mode === "HYBRID" && !escalated ? (
        <Button
          type="button"
          variant="secondary"
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
        >
          Talk to a human
        </Button>
      ) : null}
    </Box>
  );
}

function PrechatFieldRenderer({
  field,
  control,
}: {
  field: PrechatFieldDto;
  control: Parameters<typeof Controller>[0]["control"];
}) {
  const label = field.label ?? field.key;
  const low = String(field.type || "text").toLowerCase();

  return (
    <Controller
      name={field.key}
      control={control}
      render={({ field: f, fieldState }) => {
        if (low === "textarea") {
          return (
            <Box>
              <Typography variant="small" sx={{ mb: 0.5 }}>
                {label}
              </Typography>
              <textarea
                {...f}
                value={(f.value as string) ?? ""}
                rows={3}
                style={{ width: "100%", borderRadius: 8, padding: 8 }}
              />
              {fieldState.error ? (
                <Typography variant="caption" color="error">
                  {fieldState.error.message}
                </Typography>
              ) : null}
            </Box>
          );
        }
        if (low === "select") {
          return (
            <Box>
              <Typography variant="small" sx={{ mb: 0.5 }}>
                {label}
              </Typography>
              <select
                style={{ width: "100%", padding: 10, borderRadius: 8 }}
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
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
          <InputField
            label={label}
            type={low === "email" ? "email" : "text"}
            name={field.key}
            value={(f.value as string) ?? ""}
            onChange={(e) => f.onChange(e.target.value)}
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
}: {
  embedded?: boolean;
  websiteId: string;
  parentPageUrl: string;
  sessionToken: string;
  widgetKey: string;
  textUsFormConfig: Record<string, unknown>;
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
        <PrechatFieldRenderer key={f.key} field={f} control={form.control} />
      ))}
      <Button type="submit" variant="secondary">
        Send
      </Button>
    </Stack>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const alignRight = message.role === "visitor";
  const bubbleBg =
    message.role === "system"
      ? "rgba(15,118,110,0.12)"
      : alignRight
        ? "primary.main"
        : "grey.200";
  const fg = alignRight ? "primary.contrastText" : "text.primary";

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
          bgcolor: bubbleBg,
          color: fg,
        }}
      >
        <Typography
          variant="body2"
          component="div"
          sx={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
        >
          {normalizeChatMessageText(message.content)}
        </Typography>
      </Box>
      {citations.length ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
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
