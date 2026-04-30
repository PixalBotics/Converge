"use client";

import { useCallback, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { publishAppToast } from "@/lib/notify";
import {
  parseKnowledgeHits,
  parseRewriteText,
  parseSuggestedReplies,
  parseSummaryText,
} from "@/lib/chat-ai/parseAiResponse";
import type { ChatMessage } from "@/services/chat/chat.types";
import type { AiChatMessageSnippet } from "@/services/chat/chatAi.types";
import {
  postAgentAiKnowledgeLookup,
  postAgentAiRewrite,
  postAgentAiSummarize,
  postAgentAiSuggestedReplies,
} from "@/services/chat/chatAiApi";

function toSnippets(messages: ChatMessage[], limit = 40): AiChatMessageSnippet[] {
  return messages
    .slice(-limit)
    .map((m) => ({
      role: m.role,
      content: m.content,
    }))
    .filter((m) => m.content.trim());
}

type Props = {
  conversationId: string | null;
  messages: ChatMessage[];
  token: string;
  onInsertComposer: (text: string) => void;
};

export function AgentAiAssistantPanel({ conversationId, messages, token, onInsertComposer }: Props) {
  const theme = useTheme() as AppTheme;
  const [tab, setTab] = useState(0);
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [rewriteIn, setRewriteIn] = useState("");
  const [rewriteTone, setRewriteTone] = useState<"professional" | "friendly" | "concise">("professional");
  const [rewriteOut, setRewriteOut] = useState("");
  const [knowledgeQuery, setKnowledgeQuery] = useState("");
  const [knowledgeHits, setKnowledgeHits] = useState<{ title: string; snippet: string; url?: string }[]>([]);

  const snippets = useMemo(() => toSnippets(messages), [messages]);

  const runAi = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      if (!conversationId) {
        publishAppToast({ variant: "error", message: "Select a conversation first." });
        return null;
      }
      setBusy(true);
      try {
        return await fn();
      } catch {
        publishAppToast({ variant: "error", message: "AI request failed. Check API and permissions." });
        return null;
      } finally {
        setBusy(false);
      }
    },
    [conversationId],
  );

  const handleSuggestions = async () => {
    const res = await runAi(() =>
      postAgentAiSuggestedReplies({ conversationId: conversationId!, messages: snippets }, token),
    );
    if (res == null) return;
    const list = parseSuggestedReplies(res);
    setSuggestions(list);
    if (!list.length) {
      publishAppToast({ variant: "info", message: "No suggestions returned." });
    }
  };

  const handleSummarize = async () => {
    const res = await runAi(() =>
      postAgentAiSummarize({ conversationId: conversationId!, messages: snippets }, token),
    );
    if (res == null) return;
    setSummary(parseSummaryText(res));
  };

  const handleRewrite = async () => {
    const text = rewriteIn.trim();
    if (!text) {
      publishAppToast({ variant: "error", message: "Enter text to rewrite." });
      return;
    }
    const res = await runAi(() =>
      postAgentAiRewrite({ conversationId: conversationId!, text, tone: rewriteTone }, token),
    );
    if (res == null) return;
    setRewriteOut(parseRewriteText(res));
  };

  const handleKnowledge = async () => {
    const q = knowledgeQuery.trim();
    if (!q) {
      publishAppToast({ variant: "error", message: "Enter a search query." });
      return;
    }
    const res = await runAi(() =>
      postAgentAiKnowledgeLookup({ conversationId: conversationId!, query: q }, token),
    );
    if (res == null) return;
    setKnowledgeHits(parseKnowledgeHits(res));
  };

  const tabSx = {
    color: alpha(theme.app.text.primary, 0.75),
    "&.Mui-selected": { color: theme.app.dashboard.accentYellow },
    minHeight: 40,
    py: 0.5,
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 40,
          borderBottom: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.8)}`,
          "& .MuiTabs-indicator": { bgcolor: theme.app.dashboard.accentYellow },
        }}
      >
        <Tab label="Suggestions" sx={tabSx} />
        <Tab label="Summarize" sx={tabSx} />
        <Tab label="Rewrite" sx={tabSx} />
        <Tab label="Knowledge" sx={tabSx} />
      </Tabs>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 1.5, display: "flex", flexDirection: "column", gap: 1.25 }}>
        {!conversationId ? (
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
            Open a chat to use AI tools.
          </Typography>
        ) : null}

        {tab === 0 && (
          <>
            <Button type="button" variant="secondary" disabled={busy || !conversationId} onClick={() => void handleSuggestions()}>
              Get suggested replies
            </Button>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {suggestions.map((s, i) => (
                <Button
                  key={`${i}-${s.slice(0, 24)}`}
                  type="button"
                  variant="secondary"
                  onClick={() => onInsertComposer(s)}
                  sx={{ textAlign: "left", justifyContent: "flex-start", whiteSpace: "normal", py: 1 }}
                >
                  {s}
                </Button>
              ))}
            </Box>
          </>
        )}

        {tab === 1 && (
          <>
            <Button type="button" variant="secondary" disabled={busy || !conversationId} onClick={() => void handleSummarize()}>
              Summarize conversation
            </Button>
            <TextField
              label="Summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              multiline
              minRows={6}
              fullWidth
              placeholder="Run summarize to populate…"
              InputProps={{ readOnly: false }}
              sx={{
                "& .MuiInputBase-input": { color: theme.app.text.primary },
                "& .MuiInputLabel-root": { color: theme.app.dashboard.textMuted },
              }}
            />
            <Button type="button" variant="secondary" disabled={!summary.trim()} onClick={() => onInsertComposer(summary)}>
              Insert into message
            </Button>
          </>
        )}

        {tab === 2 && (
          <>
            <TextField
              label="Text to rewrite"
              value={rewriteIn}
              onChange={(e) => setRewriteIn(e.target.value)}
              multiline
              minRows={3}
              fullWidth
              sx={{
                "& .MuiInputBase-input": { color: theme.app.text.primary },
                "& .MuiInputLabel-root": { color: theme.app.dashboard.textMuted },
              }}
            />
            <FormControl fullWidth size="small">
              <InputLabel id="tone-label" sx={{ color: theme.app.dashboard.textMuted }}>
                Tone
              </InputLabel>
              <Select
                labelId="tone-label"
                label="Tone"
                value={rewriteTone}
                onChange={(e) => setRewriteTone(e.target.value as typeof rewriteTone)}
                sx={{ color: theme.app.text.primary }}
              >
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="friendly">Friendly</MenuItem>
                <MenuItem value="concise">Concise</MenuItem>
              </Select>
            </FormControl>
            <Button type="button" variant="secondary" disabled={busy || !conversationId} onClick={() => void handleRewrite()}>
              Rewrite
            </Button>
            <TextField
              label="Result"
              value={rewriteOut}
              onChange={(e) => setRewriteOut(e.target.value)}
              multiline
              minRows={4}
              fullWidth
              sx={{
                "& .MuiInputBase-input": { color: theme.app.text.primary },
                "& .MuiInputLabel-root": { color: theme.app.dashboard.textMuted },
              }}
            />
            <Button type="button" variant="secondary" disabled={!rewriteOut.trim()} onClick={() => onInsertComposer(rewriteOut)}>
              Insert into message
            </Button>
          </>
        )}

        {tab === 3 && (
          <>
            <TextField
              label="Knowledge query"
              value={knowledgeQuery}
              onChange={(e) => setKnowledgeQuery(e.target.value)}
              fullWidth
              placeholder="Policy, product, FAQ…"
              sx={{
                "& .MuiInputBase-input": { color: theme.app.text.primary },
                "& .MuiInputLabel-root": { color: theme.app.dashboard.textMuted },
              }}
            />
            <Button type="button" variant="secondary" disabled={busy || !conversationId} onClick={() => void handleKnowledge()}>
              Lookup
            </Button>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {knowledgeHits.map((h, i) => (
                <Box
                  key={`${i}-${h.title}`}
                  sx={{
                    p: 1.25,
                    borderRadius: 1,
                    bgcolor: alpha(theme.app.dashboard.overlayLight, 0.35),
                    border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.5)}`,
                  }}
                >
                  <Typography variant="small" fontWeight={700} color="white">
                    {h.title}
                  </Typography>
                  <Typography variant="small" sx={{ color: alpha(theme.app.text.primary, 0.88), mt: 0.5, whiteSpace: "pre-wrap" }}>
                    {h.snippet}
                  </Typography>
                  {h.url ? (
                    <Typography variant="caption" sx={{ color: "#5AA7FF", mt: 0.5, display: "block" }}>
                      {h.url}
                    </Typography>
                  ) : null}
                  <Button type="button" variant="secondary" sx={{ mt: 0.75 }} onClick={() => onInsertComposer(`${h.title}: ${h.snippet}`)}>
                    Use snippet
                  </Button>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
