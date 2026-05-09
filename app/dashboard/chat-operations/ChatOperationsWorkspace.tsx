"use client";

import { useCallback, useState } from "react";
import Attachment from "@mui/icons-material/Attachment";
import Send from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import type { SxProps, Theme } from "@mui/material/styles";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  InputField,
  Typography,
} from "@/components/common";
import { getAccessToken, postAgentAiSuggestion } from "@/api";
import type { AgentAiAction } from "@/api/ai/agent-suggest.api";
import { useAuth } from "@/lib/auth";
import { useAgentChat } from "@/lib/hooks/chat/useAgentChat";
import type { ConversationSummary } from "@/services/chat/chat.types";
import {
  chatOpsBubbleSx,
  chatOpsCenterColSx,
  chatOpsChatListSx,
  chatOpsComposerWrapSx,
  chatOpsGridSx,
  chatOpsLeftColSx,
  chatOpsMessagesSx,
  chatOpsPageWrapperSx,
  chatOpsRightBodySx,
  chatOpsRightColSx,
  chatOpsSectionHeaderSx,
  chatOpsShellSx,
  chatOpsListItemSx,
} from "./chat-operations.styles";

const CANNED_WEBSITE = [
  "Thanks for reaching out.",
  "I'll check that for you now.",
  "Can you share any order ID?",
];
const CANNED_PERSONAL = [
  "Sounds good!",
  "I'll be right back.",
  "Let me review the details.",
];

export function ChatOperationsWorkspace() {
  const theme = useTheme() as AppTheme;
  const { user } = useAuth();

  const accessToken = getAccessToken() ?? "";
  const agentChat = useAgentChat({
    token: accessToken,
    agentId: user?.id,
  });

  const [queueTab, setQueueTab] = useState<"active" | "waiting">("active");
  const [composer, setComposer] = useState("");
  const [cannedFilter, setCannedFilter] = useState("");
  const [fallbackWebsiteId, setFallbackWebsiteId] = useState("");
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(false);

  const list: ConversationSummary[] =
    queueTab === "active" ? agentChat.activeChats : agentChat.waitingChats;

  const selectedSummary = list.find((c) => c.id === agentChat.selectedConversationId);
  const websiteIdEffective =
    (typeof selectedSummary?.websiteId === "string" ? selectedSummary.websiteId : "").trim() ||
    fallbackWebsiteId.trim() ||
    "";

  const pushCannedToComposer = useCallback((line: string) => {
    setComposer((prev) => (prev ? `${prev} ${line}` : line));
  }, []);

  const runAiAssist = async (action: AgentAiAction) => {
    if (!accessToken || !agentChat.selectedConversationId || !websiteIdEffective.trim()) return;
    setAiBusy(true);
    try {
      const input =
        composer.trim().length > 0
          ? composer.trim()
          : "(use recent transcript context)";
      const data = await postAgentAiSuggestion({
        action,
        input,
        websiteId: websiteIdEffective.trim(),
        conversationId: agentChat.selectedConversationId,
        tone: "professional",
      });
      setAiOutput(typeof data === "string" ? data : JSON.stringify(data, null, 2));
    } catch {
      setAiOutput("Assist request failed.");
    } finally {
      setAiBusy(false);
    }
  };

  const sendNow = async () => {
    await agentChat.sendMessage(composer.trim());
    setComposer("");
  };

  return (
    <Box sx={chatOpsPageWrapperSx}>
      {!accessToken ? (
        <Typography color="error.main">Unable to resolve session token.</Typography>
      ) : (
        <Chip
          size="small"
          sx={{ mb: 1 }}
          label={`Socket ${agentChat.isConnected ? "connected" : "disconnected"} • queue refresh every 12s`}
        />
      )}

      <DashboardCard sx={chatOpsShellSx}>
        <Box
          sx={
            [
              chatOpsGridSx,
              {
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "250px minmax(0,1fr) 280px minmax(0,340px)",
                },
              },
            ] as SxProps<Theme>
          }
        >
          <Box sx={chatOpsLeftColSx}>
            <Box sx={chatOpsSectionHeaderSx}>
              <Typography variant="mediumLarge" color="white" fontWeight={600}>
                Chats
              </Typography>
              <StackRow gap={1}>
                <Button
                  type="button"
                  variant={queueTab === "active" ? "primary" : "secondary"}
                  sx={{ px: 1 }}
                  onClick={() => void setQueueTab("active")}
                >
                  Active
                </Button>
                <Button
                  type="button"
                  variant={queueTab === "waiting" ? "primary" : "secondary"}
                  sx={{ px: 1 }}
                  onClick={() => void setQueueTab("waiting")}
                >
                  Waiting
                </Button>
              </StackRow>
            </Box>
            <Box sx={chatOpsChatListSx}>
              {list.length === 0 ? (
                <Typography variant="medium" sx={{ p: 1.6, opacity: 0.85 }}>
                  No chats in this view.
                </Typography>
              ) : (
                list.map((c) => (
                  <Box
                    key={c.id}
                    sx={chatOpsListItemSx(c.id === agentChat.selectedConversationId)}
                    onClick={() => void agentChat.selectConversation(c.id)}
                  >
                    <Typography variant="medium" color="white">
                      {String(c.id).slice(0, 14)}…
                    </Typography>
                    <Typography
                      variant="small"
                      sx={{ color: alpha(theme.app.text.primary, 0.75), mt: 0.35 }}
                    >
                      {typeof c.status === "string" ? c.status : "—"}
                    </Typography>
                    {typeof c.websiteId === "string" ? (
                      <Typography variant="caption" sx={{ opacity: 0.65 }}>
                        Site: {c.websiteId.slice(0, 8)}…
                      </Typography>
                    ) : null}
                  </Box>
                ))
              )}
            </Box>
          </Box>

          <Box sx={chatOpsCenterColSx}>
            <Box sx={chatOpsSectionHeaderSx}>
              <Typography variant="mediumLarge" color="white" fontWeight={600}>
                Conversation
              </Typography>
              <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mt: 0.35 }}>
                {agentChat.selectedConversationId
                  ? `#${agentChat.selectedConversationId}`
                  : "Select a conversation"}
              </Typography>
            </Box>
            <Box sx={chatOpsMessagesSx}>
              {agentChat.visitorTypingSelected ? (
                <Typography variant="caption" sx={{ color: theme.palette.info.light, mb: 1 }}>
                  Visitor is typing…
                </Typography>
              ) : null}
              {agentChat.messages
                .slice()
                .sort((a, b) =>
                  String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? "")),
                )
                .map((m, idx) => (
                  <Box
                    key={m.id ?? `${idx}-${m.createdAt}-${m.content}`}
                    sx={chatOpsBubbleSx(m.role !== "visitor")}
                  >
                    <Typography variant="small" color="white">
                      {m.content}
                    </Typography>
                  </Box>
                ))}
            </Box>
            <Box sx={chatOpsComposerWrapSx}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <InputField
                    label=""
                    placeholder="Type message…"
                    value={composer}
                    onChange={(e) => {
                      setComposer(e.target.value);
                      agentChat.emitTyping();
                    }}
                    sx={{ "& .MuiFormHelperText-root": { display: "none" } }}
                    disabled={!agentChat.selectedConversationId}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" && !ev.shiftKey) {
                        ev.preventDefault();
                        void (async () => {
                          try {
                            await sendNow();
                            agentChat.emitStopTyping();
                          } catch {
                            /* errors handled via global patterns */
                          }
                        })();
                      }
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", pr: 0.4 }}>
                  <Attachment sx={{ fontSize: 16, color: theme.app.dashboard.textMuted, mr: 1 }} />
                  <IconButton
                    aria-label="Send message"
                    size="small"
                    disabled={
                      !composer.trim().length ||
                      Boolean(!agentChat.selectedConversationId || !accessToken)
                    }
                    onClick={() => void sendNow().then(() => agentChat.emitStopTyping())}
                  >
                    <Send sx={{ color: "primary.main" }} />
                  </IconButton>
                </Box>
              </Box>
              <QuickCannedPush
                setCannedFilter={setCannedFilter}
                cannedFilter={cannedFilter}
                pushCannedToComposer={pushCannedToComposer}
              />
              <StackRow gap={0.75} sx={{ flexWrap: "wrap" }}>
                {CANNED_WEBSITE.filter((c) =>
                  cannedFilter.trim()
                    ? c.toLowerCase().includes(cannedFilter.toLowerCase())
                    : true,
                ).map((c) => (
                  <Chip
                    key={c}
                    size="small"
                    label={c}
                    onClick={() => pushCannedToComposer(c)}
                  />
                ))}
              </StackRow>
              <Button
                type="button"
                variant="secondary"
                sx={{ mt: 1 }}
                disabled={!agentChat.selectedConversationId}
                onClick={() => void agentChat.closeSelectedConversation()}
              >
                Close chat
              </Button>
            </Box>
          </Box>

          <Box sx={chatOpsRightColSx}>
            <Box sx={chatOpsSectionHeaderSx}>
              <Typography variant="mediumLarge" color="white" fontWeight={600}>
                Visitor
              </Typography>
            </Box>
            <Box sx={chatOpsRightBodySx}>
              {agentChat.selectedConversationId &&
              typeof agentChat.visitorFromHistory === "object" ? (
                <Typography
                  variant="small"
                  component="pre"
                  sx={{
                    whiteSpace: "pre-wrap",
                    overflow: "auto",
                    fontFamily: "ui-monospace,Menlo,monospace",
                    fontSize: 12,
                  }}
                >
                  {JSON.stringify(agentChat.visitorFromHistory, null, 2)}
                </Typography>
              ) : (
                <Typography variant="small" sx={{ opacity: 0.75 }}>
                  Select a conversation to load visitor context from history.
                </Typography>
              )}
              {!selectedSummary?.websiteId ? (
                <Box sx={{ mt: 1.25 }}>
                  <InputField
                    label="Website UUID (AI assist)"
                    placeholder="Required when queue row omits websiteId"
                    value={fallbackWebsiteId}
                    onChange={(e) => setFallbackWebsiteId(e.target.value)}
                  />
                </Box>
              ) : null}
            </Box>
          </Box>

          <Box sx={chatOpsRightColSx}>
            <Box sx={chatOpsSectionHeaderSx}>
              <Typography variant="mediumLarge" color="white" fontWeight={600}>
                AI assist
              </Typography>
            </Box>
            <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
              <StackRow gap={0.75} sx={{ flexWrap: "wrap" }}>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!websiteIdEffective || aiBusy}
                  onClick={() => void runAiAssist("suggested_reply")}
                >
                  Suggest reply
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!websiteIdEffective || aiBusy}
                  onClick={() => void runAiAssist("summarize")}
                >
                  Summarize
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!websiteIdEffective || aiBusy}
                  onClick={() => void runAiAssist("rewrite_tone")}
                >
                  Rewrite
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!websiteIdEffective || aiBusy}
                  onClick={() => void runAiAssist("knowledge_lookup")}
                >
                  KB lookup
                </Button>
              </StackRow>
              {aiBusy ? (
                <CircularProgress size={22} />
              ) : (
                <Typography
                  variant="small"
                  component="pre"
                  sx={{
                    whiteSpace: "pre-wrap",
                    maxHeight: 220,
                    overflow: "auto",
                    fontSize: 12,
                  }}
                >
                  {aiOutput ?? "Run an action to see model output."}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
}

function QuickCannedPush({
  cannedFilter,
  setCannedFilter,
  pushCannedToComposer,
}: {
  cannedFilter: string;
  setCannedFilter: (v: string) => void;
  pushCannedToComposer: (v: string) => void;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      <StackRow gap={0.75}>
        {CANNED_PERSONAL.map((c) => (
          <Chip key={c} size="small" label={c} onClick={() => pushCannedToComposer(c)} />
        ))}
      </StackRow>
      <InputField
        label=""
        placeholder="Filter canned…"
        value={cannedFilter}
        onChange={(e) => setCannedFilter(e.target.value)}
        sx={{ "& .MuiFormHelperText-root": { display: "none" } }}
      />
    </Box>
  );
}

function StackRow({
  children,
  gap = 1,
  sx,
}: {
  children: React.ReactNode;
  gap?: number;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap, flexWrap: "wrap", ...sx }}>
      {children}
    </Box>
  );
}
