"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Circle from "@mui/icons-material/Circle";
import Send from "@mui/icons-material/Send";
import AccessTime from "@mui/icons-material/AccessTime";
import RoomOutlined from "@mui/icons-material/RoomOutlined";
import LinkOutlined from "@mui/icons-material/LinkOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import SwapHorizRounded from "@mui/icons-material/SwapHorizRounded";
import HandshakeOutlined from "@mui/icons-material/HandshakeOutlined";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Tooltip from "@mui/material/Tooltip";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { getAccessToken } from "@/api";
import { Button, DashboardCard, InputField, Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { useAgentChat } from "@/lib/hooks";
import { publishAppToast } from "@/lib/notify";
import type { ChatMessage, ConversationSummary } from "@/services/chat/chat.types";
import { AgentAiAssistantPanel } from "./AgentAiAssistantPanel";
import {
  chatOpsBubbleSx,
  chatOpsCenterColSx,
  chatOpsChatListSx,
  chatOpsChipButtonSx,
  chatOpsChipRowSx,
  chatOpsComposerWrapSx,
  chatOpsGridSx,
  chatOpsInfoTileSx,
  chatOpsInfoTitleRowSx,
  chatOpsLeftColSx,
  chatOpsLinkLineSx,
  chatOpsListItemSx,
  chatOpsListMiniHeaderSx,
  chatOpsListStackSx,
  chatOpsMessagesSx,
  chatOpsPageWrapperSx,
  chatOpsRightBodySx,
  chatOpsRightColSx,
  chatOpsSectionHeaderSx,
  chatOpsShellSx,
  chatOpsToolbarRowSx,
} from "./chat-operations.styles";

function summaryPickString(c: ConversationSummary, keys: string[]): string | undefined {
  const o = c as Record<string, unknown>;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function conversationTitle(c: ConversationSummary): string {
  return (
    summaryPickString(c, ["visitorName", "name", "displayName", "title"]) ??
    `Visitor · ${c.id.slice(0, 8)}…`
  );
}

function conversationPreview(c: ConversationSummary): string {
  return (
    summaryPickString(c, ["lastMessagePreview", "preview", "snippet", "subject"]) ??
    (c.status ? `Status: ${c.status}` : "No preview")
  );
}

function formatWhen(iso?: string): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "short", timeStyle: "short" }).format(t);
}

function sortMessages(a: ChatMessage, b: ChatMessage): number {
  const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
  const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
  return ta - tb;
}

function visitorContextRows(c: ConversationSummary | null): { label: string; value: string }[] {
  if (!c) return [];
  const o = c as Record<string, unknown>;
  const rows: { label: string; value: string }[] = [];
  const push = (label: string, value: unknown) => {
    if (value === undefined || value === null || value === "") return;
    if (typeof value === "object") return;
    rows.push({ label, value: String(value) });
  };
  push("Visitor ID", o.visitorId ?? c.visitorId);
  push("Name", summaryPickString(c, ["visitorName", "name", "displayName"]));
  push("Email", summaryPickString(c, ["visitorEmail", "email"]));
  push("Phone", summaryPickString(c, ["visitorPhone", "phone"]));
  push("Website", summaryPickString(c, ["websiteUrl", "website", "pageUrl"]));
  push("Referrer", summaryPickString(c, ["referrer", "referer"]));
  push("Locale", summaryPickString(c, ["locale", "language"]));
  push("City", summaryPickString(c, ["city"]));
  push("Country", summaryPickString(c, ["country", "countryCode"]));
  push("User agent", summaryPickString(c, ["userAgent"]));
  push("Last activity", formatWhen(c.lastMessageAt));
  const meta = o.metadata ?? o.visitorMetadata;
  if (meta && typeof meta === "object") {
    try {
      rows.push({ label: "Metadata", value: JSON.stringify(meta, null, 2) });
    } catch {
      rows.push({ label: "Metadata", value: String(meta) });
    }
  }
  return rows;
}

type QueueRowProps = {
  chat: ConversationSummary;
  active: boolean;
  onSelect: () => void;
  theme: AppTheme;
};

function QueueRow({ chat, active, onSelect, theme }: QueueRowProps) {
  const unread = typeof chat.unreadCount === "number" && chat.unreadCount > 0 ? chat.unreadCount : 0;
  return (
    <Box sx={chatOpsListItemSx(active)} onClick={onSelect}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 0.5 }}>
        <Typography variant="medium" color="white" sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
          {conversationTitle(chat)}
          {chat.status === "active" ? (
            <Circle sx={{ fontSize: 10, ml: 0.5, color: alpha("#fff", 0.95) }} />
          ) : null}
        </Typography>
        {unread > 0 ? (
          <Typography variant="caption" sx={{ bgcolor: alpha(theme.app.dashboard.accentYellow, 0.95), color: "#0f172a", px: 0.6, borderRadius: 1, fontWeight: 700 }}>
            {unread > 99 ? "99+" : unread}
          </Typography>
        ) : null}
      </Box>
      <Typography variant="small" sx={{ color: alpha(theme.app.text.primary, 0.85), mt: 0.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {conversationPreview(chat)}
      </Typography>
      <Typography variant="small" sx={{ color: alpha(theme.app.text.primary, 0.6), mt: 0.2 }}>
        {formatWhen(chat.lastMessageAt)}
      </Typography>
    </Box>
  );
}

export function AgentChatConsole() {
  const theme = useTheme() as AppTheme;
  const { user, isAuthenticated } = useAuth();
  const token = getAccessToken()?.trim() ?? "";

  const {
    activeChats,
    waitingChats,
    selectedConversationId,
    messages,
    isConnected,
    typingByConversation,
    refreshQueues,
    selectConversation,
    sendMessage,
    closeSelectedConversation,
    emitTyping,
    emitStopTyping,
  } = useAgentChat({ token, agentId: user?.id });

  const [composer, setComposer] = useState("");
  const [sending, setSending] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [rightTab, setRightTab] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedSummary = useMemo(() => {
    if (!selectedConversationId) return null;
    return (
      activeChats.find((c) => c.id === selectedConversationId) ??
      waitingChats.find((c) => c.id === selectedConversationId) ??
      null
    );
  }, [activeChats, waitingChats, selectedConversationId]);

  const sortedMessages = useMemo(() => [...messages].sort(sortMessages), [messages]);

  const visitorTyping = Boolean(
    selectedConversationId && typingByConversation[selectedConversationId],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [sortedMessages, visitorTyping, selectedConversationId]);

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

  const handleSend = async () => {
    const text = composer.trim();
    if (!text || !selectedConversationId) return;
    emitStopTyping();
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setSending(true);
    try {
      await sendMessage(text);
      setComposer("");
    } catch {
      publishAppToast({ variant: "error", message: "Message could not be sent." });
    } finally {
      setSending(false);
    }
  };

  const handleConfirmClose = async () => {
    setClosing(true);
    try {
      await closeSelectedConversation();
      publishAppToast({ variant: "success", message: "Chat closed." });
      setCloseDialogOpen(false);
    } catch {
      publishAppToast({ variant: "error", message: "Could not close this chat." });
    } finally {
      setClosing(false);
    }
  };

  const contextRows = useMemo(() => visitorContextRows(selectedSummary), [selectedSummary]);

  if (!isAuthenticated || !token) {
    return (
      <Box sx={chatOpsPageWrapperSx}>
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="mediumLarge" color="white">
            Sign in to open the chat console.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={chatOpsPageWrapperSx}>
      <DashboardCard sx={chatOpsShellSx}>
        <Box sx={chatOpsGridSx}>
          <Box sx={chatOpsLeftColSx}>
            <Box sx={chatOpsSectionHeaderSx}>
              <Typography variant="mediumLarge" color="white" fontWeight={600}>
                Queues
              </Typography>
              <Box sx={chatOpsToolbarRowSx}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: isConnected ? theme.app.dashboard.accentGreen : theme.app.dashboard.accentRedLight,
                    }}
                  />
                  <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
                    {isConnected ? "Live" : "Offline"}
                  </Typography>
                </Box>
                <Tooltip title="Refresh lists">
                  <span>
                    <IconButton size="small" onClick={() => void refreshQueues()} sx={{ color: "white" }}>
                      <RefreshRounded fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <Box sx={{ ...chatOpsListStackSx, flex: 1, minHeight: 0 }}>
                <Box sx={chatOpsListMiniHeaderSx}>
                  <Typography variant="small" fontWeight={700} color="white">
                    Active ({activeChats.length})
                  </Typography>
                </Box>
                <Box sx={chatOpsChatListSx}>
                  {activeChats.length === 0 ? (
                    <Box sx={{ p: 1.5 }}>
                      <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
                        No active chats.
                      </Typography>
                    </Box>
                  ) : (
                    activeChats.map((chat) => (
                      <QueueRow
                        key={`active-${chat.id}`}
                        chat={chat}
                        active={chat.id === selectedConversationId}
                        theme={theme}
                        onSelect={() => void selectConversation(chat.id)}
                      />
                    ))
                  )}
                </Box>
              </Box>

              <Box sx={{ ...chatOpsListStackSx, flex: 1, minHeight: 0 }}>
                <Box sx={chatOpsListMiniHeaderSx}>
                  <Typography variant="small" fontWeight={700} color="white">
                    Waiting ({waitingChats.length})
                  </Typography>
                </Box>
                <Box sx={chatOpsChatListSx}>
                  {waitingChats.length === 0 ? (
                    <Box sx={{ p: 1.5 }}>
                      <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
                        No visitors waiting.
                      </Typography>
                    </Box>
                  ) : (
                    waitingChats.map((chat) => (
                      <QueueRow
                        key={`wait-${chat.id}`}
                        chat={chat}
                        active={chat.id === selectedConversationId}
                        theme={theme}
                        onSelect={() => void selectConversation(chat.id)}
                      />
                    ))
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={chatOpsCenterColSx}>
            <Box sx={chatOpsSectionHeaderSx}>
              <Typography variant="mediumLarge" color="white" fontWeight={600}>
                {selectedSummary ? conversationTitle(selectedSummary) : "Select a chat"}
              </Typography>
              {selectedSummary ? (
                <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mt: 0.35 }}>
                  {summaryPickString(selectedSummary, ["visitorEmail", "email"]) ?? "—"}
                  {summaryPickString(selectedSummary, ["websiteUrl", "website"]) ? (
                    <> · {summaryPickString(selectedSummary, ["websiteUrl", "website"])}</>
                  ) : null}
                </Typography>
              ) : (
                <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mt: 0.35 }}>
                  Choose a conversation from Active or Waiting.
                </Typography>
              )}
              <Box sx={{ ...chatOpsToolbarRowSx, mt: 1 }}>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!selectedConversationId}
                  onClick={() => setCloseDialogOpen(true)}
                  sx={{ py: 0.4, px: 1.25 }}
                >
                  Close chat
                </Button>
                <Tooltip title="Transfer to another queue or agent (coming soon)">
                  <span>
                    <Button type="button" variant="secondary" disabled startIcon={<SwapHorizRounded sx={{ fontSize: 18 }} />} sx={{ py: 0.4, px: 1.25 }}>
                      Transfer
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip title="AI / bot handover workflow (coming soon)">
                  <span>
                    <Button type="button" variant="secondary" disabled startIcon={<HandshakeOutlined sx={{ fontSize: 18 }} />} sx={{ py: 0.4, px: 1.25 }}>
                      Handover
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </Box>

            <Box sx={chatOpsMessagesSx}>
              {!selectedConversationId ? (
                <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
                  No conversation selected.
                </Typography>
              ) : sortedMessages.length === 0 ? (
                <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
                  No messages yet. Say hello when the visitor writes.
                </Typography>
              ) : (
                sortedMessages.map((msg) => {
                  const outgoing = msg.role === "agent";
                  return (
                    <Box key={msg.id ?? `${msg.createdAt}-${msg.content.slice(0, 24)}`} sx={chatOpsBubbleSx(outgoing)}>
                      <Typography variant="small" color="white" sx={{ opacity: 0.92 }}>
                        {msg.role === "system" ? "[System] " : ""}
                        {msg.content}
                      </Typography>
                      <Typography variant="small" sx={{ color: alpha(theme.app.text.primary, 0.65), mt: 0.3 }}>
                        {formatWhen(msg.createdAt)}
                      </Typography>
                    </Box>
                  );
                })
              )}
              {visitorTyping ? (
                <Box sx={{ alignSelf: "flex-start", px: 1.2, py: 0.8, borderRadius: 2, bgcolor: alpha(theme.app.dashboard.overlayLight, 0.5) }}>
                  <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, fontStyle: "italic" }}>
                    Visitor is typing…
                  </Typography>
                </Box>
              ) : null}
              <div ref={messagesEndRef} />
            </Box>

            <Box sx={chatOpsComposerWrapSx}>
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <InputField
                    label=""
                    placeholder="Type message here…"
                    value={composer}
                    onChange={(e) => {
                      setComposer(e.target.value);
                      if (selectedConversationId) {
                        emitTyping();
                        scheduleStopTyping();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                    disabled={!selectedConversationId || sending}
                    inputProps={{ maxLength: 8000, "aria-label": "Chat message" }}
                    sx={{ "& .MuiFormHelperText-root": { display: "none" } }}
                  />
                </Box>
                <IconButton
                  aria-label="Send message"
                  onClick={() => void handleSend()}
                  disabled={!selectedConversationId || sending || !composer.trim()}
                  sx={{ color: theme.app.dashboard.accentYellow, mb: 0.25 }}
                >
                  <Send sx={{ fontSize: 22 }} />
                </IconButton>
              </Box>
              <Box sx={chatOpsChipRowSx}>
                <Button type="button" variant="secondary" sx={chatOpsChipButtonSx(false)} disabled>
                  Website canned
                </Button>
                <Button type="button" variant="secondary" sx={chatOpsChipButtonSx(false)} disabled>
                  Personal canned
                </Button>
                <Button type="button" variant="secondary" sx={chatOpsChipButtonSx(false)} disabled>
                  Push canned
                </Button>
              </Box>
              <InputField
                label=""
                placeholder="Search canned messages…"
                value=""
                onChange={() => {}}
                disabled
                sx={{ "& .MuiFormHelperText-root": { display: "none" } }}
              />
            </Box>
          </Box>

          <Box sx={chatOpsRightColSx}>
            <Box
              sx={[
                chatOpsSectionHeaderSx,
                {
                  py: 1,
                  minHeight: "auto",
                  "& .MuiTabs-root": { minHeight: 40 },
                  "& .MuiTab-root": {
                    color: alpha(theme.app.text.primary, 0.75),
                    minHeight: 40,
                    py: 0.5,
                    "&.Mui-selected": { color: theme.app.dashboard.accentYellow },
                  },
                  "& .MuiTabs-indicator": { bgcolor: theme.app.dashboard.accentYellow },
                },
              ]}
            >
              <Tabs value={rightTab} onChange={(_, v) => setRightTab(v)} variant="fullWidth">
                <Tab label="Visitor" />
                <Tab label="AI assistant" />
              </Tabs>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mt: 0.75, display: "block" }}>
                {rightTab === 0
                  ? "Visitor fields when the API includes them on the conversation."
                  : "Suggested replies, summarize, rewrite, and knowledge lookup."}
              </Typography>
            </Box>
            <Box sx={[chatOpsRightBodySx, { display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }]}>
              {rightTab === 1 ? (
                <AgentAiAssistantPanel
                  conversationId={selectedConversationId}
                  messages={sortedMessages}
                  token={token}
                  onInsertComposer={(text) => {
                    setComposer((prev) => {
                      const t = text.trim();
                      if (!t) return prev;
                      const p = prev.trim();
                      return p ? `${p}\n${t}` : t;
                    });
                  }}
                />
              ) : !selectedSummary ? (
                <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
                  Select a chat to view visitor details.
                </Typography>
              ) : (
                <>
                  <Box sx={chatOpsInfoTileSx("default")}>
                    <Box sx={chatOpsInfoTitleRowSx}>
                      <ChatBubbleOutlineOutlined sx={{ fontSize: 18, width: 18, height: 18, color: theme.app.dashboard.textMuted }} />
                      <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, fontSize: "0.95rem", lineHeight: 1.2 }}>
                        Conversation
                      </Typography>
                    </Box>
                    <Typography variant="small" color="white" sx={{ mt: 0.35, fontSize: "1.02rem", lineHeight: 1.35, wordBreak: "break-all" }}>
                      {selectedSummary.id}
                    </Typography>
                    <Typography variant="small" sx={{ color: alpha(theme.app.text.primary, 0.75), mt: 0.5 }}>
                      Status: {selectedSummary.status ?? "—"}
                    </Typography>
                  </Box>

                  {contextRows.map((row) => (
                    <Box key={row.label} sx={{ px: 0.25 }}>
                      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontWeight: 600 }}>
                        {row.label}
                      </Typography>
                      <Typography
                        variant="small"
                        sx={{
                          color: row.label === "Website" || row.label === "Referrer" ? "#5AA7FF" : theme.app.text.primary,
                          display: "block",
                          mt: 0.15,
                          whiteSpace: row.label === "Metadata" ? "pre-wrap" : "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        {row.value}
                      </Typography>
                    </Box>
                  ))}

                  {summaryPickString(selectedSummary, ["websiteUrl", "website"]) ? (
                    <Box sx={chatOpsInfoTileSx("mint")}>
                      <Box sx={chatOpsInfoTitleRowSx}>
                        <LinkOutlined sx={{ fontSize: 18, color: theme.app.text.primary }} />
                        <Typography variant="small" sx={{ color: theme.app.text.primary }}>
                          Page
                        </Typography>
                      </Box>
                      <Typography variant="small" sx={chatOpsLinkLineSx}>
                        <LinkOutlined sx={{ fontSize: 15, width: 15, height: 15 }} />
                        {summaryPickString(selectedSummary, ["websiteUrl", "website"])}
                      </Typography>
                    </Box>
                  ) : null}

                  <Box sx={chatOpsInfoTileSx("cream")}>
                    <Box sx={chatOpsInfoTitleRowSx}>
                      <AccessTime sx={{ fontSize: 18, width: 18, height: 18, color: theme.app.text.primary }} />
                      <Typography variant="small" sx={{ color: theme.app.text.primary }}>
                        Last message
                      </Typography>
                    </Box>
                    <Typography variant="small" sx={{ color: alpha(theme.app.text.primary, 0.88), mt: 0.35 }}>
                      {formatWhen(selectedSummary.lastMessageAt)}
                    </Typography>
                  </Box>

                  <Box sx={chatOpsInfoTileSx("rose")}>
                    <Box sx={chatOpsInfoTitleRowSx}>
                      <RoomOutlined sx={{ fontSize: 18, width: 18, height: 18, color: theme.app.text.primary }} />
                      <Typography variant="small" sx={{ color: theme.app.text.primary }}>
                        Location hints
                      </Typography>
                    </Box>
                    <Typography variant="small" sx={{ color: alpha(theme.app.text.primary, 0.88), mt: 0.35 }}>
                      {[summaryPickString(selectedSummary, ["city"]), summaryPickString(selectedSummary, ["country", "countryCode"])]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </DashboardCard>

      <Dialog open={closeDialogOpen} onClose={() => !closing && setCloseDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Close this chat?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: theme.app.text.secondary }}>
            The visitor will be disconnected from this session. You can refresh queues afterward.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button type="button" variant="secondary" disabled={closing} onClick={() => setCloseDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="primary" disabled={closing} onClick={() => void handleConfirmClose()}>
            {closing ? "Closing…" : "Close chat"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
