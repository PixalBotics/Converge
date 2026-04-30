"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import CloseRounded from "@mui/icons-material/CloseRounded";
import RemoveRounded from "@mui/icons-material/RemoveRounded";
import ChatRounded from "@mui/icons-material/ChatRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import SupportAgentOutlined from "@mui/icons-material/SupportAgentOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { useVisitorChat } from "@/lib/hooks";
import { defaultWidgetDraft, readWidgetDraft, type WidgetDraft } from "@/lib/chat-widget/widgetDraft";
import { publishAppToast } from "@/lib/notify";
import type { ChatMessage } from "@/services/chat/chat.types";

type Phase = "prechat" | "chat";

function mergeWidgetConfig(searchParams: URLSearchParams): WidgetDraft {
  const local = typeof window !== "undefined" ? readWidgetDraft() : defaultWidgetDraft;
  const widgetId = (searchParams.get("widgetId") || local.widgetId || "").trim();
  const title = searchParams.get("title")?.trim();
  const greeting = searchParams.get("greeting")?.trim();
  const accent = searchParams.get("accent")?.trim();
  return {
    ...local,
    widgetId: widgetId || local.widgetId,
    headerTitle: title || local.headerTitle,
    greetingMessage: greeting || local.greetingMessage,
    buttonColor: accent && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(accent) ? accent : local.buttonColor,
  };
}

function bubbleLabel(role: ChatMessage["role"]): { icon: ReactNode; label: string } {
  if (role === "visitor") return { icon: <PersonOutline sx={{ fontSize: 16 }} />, label: "You" };
  if (role === "system") return { icon: <SmartToyOutlined sx={{ fontSize: 16 }} />, label: "Assistant" };
  return { icon: <SupportAgentOutlined sx={{ fontSize: 16 }} />, label: "Support" };
}

function sortMessages(a: ChatMessage, b: ChatMessage): number {
  const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
  const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
  return ta - tb;
}

export function EmbeddableChatWidget() {
  const theme = useTheme() as AppTheme;
  const searchParams = useSearchParams();
  const config = useMemo(() => mergeWidgetConfig(searchParams), [searchParams]);

  const [phase, setPhase] = useState<Phase>("prechat");
  const [minimized, setMinimized] = useState(true);
  const [preName, setPreName] = useState("");
  const [preEmail, setPreEmail] = useState("");
  const [prePhone, setPrePhone] = useState("");
  const [preMessage, setPreMessage] = useState("");
  const [input, setInput] = useState("");
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    conversationId,
    messages,
    isConnected,
    isTyping,
    assigned,
    startConversation,
    sendMessage,
    emitTyping,
    emitStopTyping,
  } = useVisitorChat();

  const accent = config.buttonColor;
  const textOnAccent = config.textColor || "#FFFFFF";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, phase, minimized, isTyping]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  const scheduleStopTyping = useCallback(() => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      emitStopTyping();
      typingTimerRef.current = null;
    }, 1200);
  }, [emitStopTyping]);

  const handlePrechatSubmit = async () => {
    if (!config.widgetId) {
      publishAppToast({ variant: "error", message: "Missing widget id in embed URL." });
      return;
    }
    const message = preMessage.trim();
    if (!message) {
      publishAppToast({ variant: "error", message: "Please enter a message to start." });
      return;
    }
    setStarting(true);
    try {
      await startConversation({
        name: preName.trim() || undefined,
        email: preEmail.trim() || undefined,
        phone: prePhone.trim() || undefined,
        message,
        websiteId: config.widgetId,
      });
      setPhase("chat");
      setInput("");
      publishAppToast({ variant: "success", message: "Chat started." });
    } catch {
      publishAppToast({ variant: "error", message: "Could not start chat. Please try again." });
    } finally {
      setStarting(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !conversationId) return;
    emitStopTyping();
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setSending(true);
    try {
      await sendMessage(text);
      setInput("");
    } catch {
      publishAppToast({ variant: "error", message: "Message could not be sent." });
    } finally {
      setSending(false);
    }
  };

  const onInputChange = (v: string) => {
    setInput(v);
    if (!conversationId) return;
    emitTyping();
    scheduleStopTyping();
  };

  const sortedMessages = useMemo(() => [...messages].sort(sortMessages), [messages]);

  const closePanel = () => setMinimized(true);
  const togglePanel = () => setMinimized((m) => !m);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        minHeight: 480,
        boxSizing: "border-box",
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        p: 1.5,
        bgcolor: "transparent",
      }}
    >
      {!minimized && (
        <Paper
          elevation={12}
          sx={{
            pointerEvents: "auto",
            width: "100%",
            maxWidth: Math.min(config.boxWidth, 400),
            maxHeight: "min(560px, calc(100vh - 120px))",
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
            border: `1px solid ${theme.palette.divider}`,
            mb: 1,
            bgcolor: theme.palette.mode === "dark" ? "rgba(15,23,42,0.96)" : "#FFFFFF",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              background: `linear-gradient(135deg, ${accent} 0%, ${config.buttonHoverColor || accent} 100%)`,
              color: textOnAccent,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="mediumLarge" fontWeight={700} sx={{ color: "inherit", lineHeight: 1.2 }}>
                {config.headerTitle}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: isConnected ? "#4ADE80" : "#FBBF24",
                    flexShrink: 0,
                  }}
                />
                <Typography variant="caption" sx={{ color: "inherit", opacity: 0.92 }}>
                  {isConnected ? "Connected" : "Connecting…"}
                  {assigned ? " · Agent online" : ""}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 0.25, flexShrink: 0 }}>
              <IconButton size="small" aria-label="Minimize chat" onClick={closePanel} sx={{ color: "inherit" }}>
                <RemoveRounded fontSize="small" />
              </IconButton>
              <IconButton size="small" aria-label="Close chat" onClick={closePanel} sx={{ color: "inherit" }}>
                <CloseRounded fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {config.bannerOn && (config.bannerTitle || config.bannerDescription) ? (
            <Box
              sx={{
                px: 2,
                py: 1,
                bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(30,99,213,0.08)",
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              {config.bannerTitle ? (
                <Typography variant="medium" fontWeight={600} sx={{ color: theme.app.text.primary }}>
                  {config.bannerTitle}
                </Typography>
              ) : null}
              {config.bannerDescription ? (
                <Typography variant="body2" sx={{ color: theme.app.text.secondary, mt: 0.25 }}>
                  {config.bannerDescription}
                </Typography>
              ) : null}
            </Box>
          ) : null}

          {phase === "prechat" ? (
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5, overflow: "auto" }}>
              <Typography variant="body2" sx={{ color: theme.app.text.secondary }}>
                {config.greetingMessage}
              </Typography>
              <TextField
                label="Name"
                value={preName}
                onChange={(e) => setPreName(e.target.value)}
                size="small"
                fullWidth
                autoComplete="name"
              />
              <TextField
                label="Email"
                type="email"
                value={preEmail}
                onChange={(e) => setPreEmail(e.target.value)}
                size="small"
                fullWidth
                autoComplete="email"
              />
              <TextField
                label="Phone"
                value={prePhone}
                onChange={(e) => setPrePhone(e.target.value)}
                size="small"
                fullWidth
                autoComplete="tel"
              />
              <TextField
                label="How can we help?"
                value={preMessage}
                onChange={(e) => setPreMessage(e.target.value)}
                required
                multiline
                minRows={3}
                fullWidth
                placeholder="Tell us briefly what you need…"
              />
              <Button
                type="button"
                variant="primary"
                fullWidth
                disabled={starting || !config.widgetId}
                onClick={() => void handlePrechatSubmit()}
              >
                {starting ? "Starting…" : "Start chat"}
              </Button>
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.25,
                  minHeight: 200,
                }}
              >
                {sortedMessages.length === 0 ? (
                  <Typography variant="body2" sx={{ color: theme.app.text.secondary }}>
                    Say hello — a teammate or assistant will reply here.
                  </Typography>
                ) : null}
                {sortedMessages.map((m) => {
                  const isVisitor = m.role === "visitor";
                  const { icon, label } = bubbleLabel(m.role);
                  return (
                    <Box
                      key={m.id ?? `${m.conversationId}-${m.createdAt}-${m.content.slice(0, 24)}`}
                      sx={{
                        display: "flex",
                        justifyContent: isVisitor ? "flex-end" : "flex-start",
                      }}
                    >
                      <Box sx={{ maxWidth: "88%" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mb: 0.35,
                            justifyContent: isVisitor ? "flex-end" : "flex-start",
                            color: theme.app.text.secondary,
                          }}
                        >
                          {isVisitor ? null : icon}
                          <Typography variant="caption" fontWeight={600}>
                            {label}
                          </Typography>
                          {isVisitor ? icon : null}
                        </Box>
                        <Box
                          sx={{
                            px: 1.25,
                            py: 1,
                            borderRadius: 2,
                            bgcolor: isVisitor ? accent : theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#EEF2F7",
                            color: isVisitor ? textOnAccent : theme.app.text.primary,
                            typography: "body2",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {m.content}
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
                {isTyping ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 0.5 }}>
                    <SmartToyOutlined sx={{ fontSize: 18, color: theme.app.text.secondary }} />
                    <Typography variant="body2" sx={{ color: theme.app.text.secondary, fontStyle: "italic" }}>
                      Typing…
                    </Typography>
                  </Box>
                ) : null}
                <div ref={messagesEndRef} />
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  pt: 0,
                  borderTop: `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.mode === "dark" ? "rgba(0,0,0,0.2)" : "rgba(248,250,252,0.95)",
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder={config.sendPlaceholder}
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  disabled={sending || !conversationId}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          aria-label="Send message"
                          onClick={() => void handleSend()}
                          disabled={sending || !input.trim() || !conversationId}
                          sx={{ color: accent }}
                        >
                          <SendRounded />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </>
          )}
        </Paper>
      )}

      <Box sx={{ pointerEvents: "auto", flexShrink: 0 }}>
        <IconButton
          aria-label={minimized ? "Open chat" : "Minimize chat"}
          onClick={togglePanel}
          sx={{
            width: 56,
            height: 56,
            bgcolor: accent,
            color: textOnAccent,
            boxShadow: theme.shadows[8],
            "&:hover": { bgcolor: config.buttonHoverColor || accent },
          }}
        >
          <ChatRounded />
        </IconButton>
      </Box>
    </Box>
  );
}
