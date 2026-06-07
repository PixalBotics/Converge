"use client";

import { useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import SendRounded from "@mui/icons-material/SendRounded";
import ScienceOutlined from "@mui/icons-material/ScienceOutlined";
import { ChatFormattedMessage } from "@/lib/safe-markdown/ChatFormattedMessage";

export type TestChatTurn = {
  id: string;
  role: "visitor" | "bot";
  text: string;
  /** Shown under bot replies — e.g. AI vs preset message. */
  replyHint?: string;
};

/** @deprecated Use TestChatTurn */
export type DummyChatTurn = TestChatTurn;

/** Lightweight test chat shell — real API replies, not the live embed widget. */
export function AiTrainingDummyChatWidget({
  turns,
  input,
  onInputChange,
  onSend,
  sending,
  botLabel = "Bot",
  siteHint,
  compact,
}: {
  turns: TestChatTurn[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  sending?: boolean;
  botLabel?: string;
  siteHint?: string;
  compact?: boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, sending]);

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)",
        border: "1px solid rgba(148,163,184,0.25)",
        bgcolor: "#ffffff",
        color: "#0f172a",
        display: "flex",
        flexDirection: "column",
        minHeight: compact ? 380 : 440,
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1.2,
          background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          AI
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box component="span" sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2, display: "block" }}>
            {botLabel}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.35, flexWrap: "wrap" }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.35,
                px: 0.65,
                py: 0.1,
                borderRadius: 999,
                bgcolor: "rgba(255,255,255,0.18)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.02,
              }}
            >
              <ScienceOutlined sx={{ fontSize: 11 }} />
              Test environment
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#4ade80" }} />
              <Box component="span" sx={{ color: "rgba(255,255,255,0.92)", fontSize: 11 }}>
                {siteHint || "Indexed training"}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        ref={listRef}
        sx={{
          flex: 1,
          overflow: "auto",
          p: 1.25,
          bgcolor: "#f8fafc",
          minHeight: 220,
          maxHeight: compact ? 280 : 320,
        }}
      >
        {turns.length === 0 ? (
          <Box
            sx={{
              color: "#64748b",
              textAlign: "center",
              mt: 3,
              px: 1.5,
              fontSize: 13,
              lineHeight: 1.55,
            }}
          >
            Same AI pipeline as your live widget — send a message to test replies from indexed training.
          </Box>
        ) : (
          turns.map((turn) => (
            <Box
              key={turn.id}
              sx={{
                mb: 1.1,
                display: "flex",
                flexDirection: "column",
                alignItems: turn.role === "visitor" ? "flex-end" : "flex-start",
              }}
            >
              <Box
                sx={{
                  maxWidth: "88%",
                  px: 1.15,
                  py: 0.75,
                  borderRadius: turn.role === "visitor" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  bgcolor: turn.role === "visitor" ? "#1e63d5" : "#fff",
                  color: turn.role === "visitor" ? "#fff" : "#0f172a",
                  border: turn.role === "bot" ? "1px solid #e2e8f0" : "none",
                  boxShadow: turn.role === "bot" ? "0 1px 2px rgba(15,23,42,0.04)" : "none",
                  fontSize: 13,
                }}
              >
                <ChatFormattedMessage text={turn.text} linkColor="#2563eb" />
              </Box>
              {turn.role === "bot" && turn.replyHint ? (
                <Box
                  component="span"
                  sx={{
                    mt: 0.35,
                    ml: 0.25,
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#64748b",
                    letterSpacing: 0.01,
                  }}
                >
                  {turn.replyHint}
                </Box>
              ) : null}
            </Box>
          ))
        )}
        {sending ? (
          <Box component="span" sx={{ color: "#64748b", fontSize: 12, pl: 0.5 }}>
            Bot is typing…
          </Box>
        ) : null}
      </Box>

      <Box
        sx={{
          p: 1,
          borderTop: "1px solid #e2e8f0",
          bgcolor: "#fff",
          display: "flex",
          alignItems: "flex-end",
          gap: 0.65,
        }}
      >
        <Box
          component="textarea"
          value={input}
          placeholder="Type a test message…"
          rows={1}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          sx={{
            flex: 1,
            resize: "none",
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            px: 1.1,
            py: 0.85,
            fontFamily: "inherit",
            fontSize: 13,
            lineHeight: 1.4,
            minHeight: 38,
            maxHeight: 88,
            outline: "none",
            color: "#0f172a",
            bgcolor: "#fff",
            "&::placeholder": { color: "#94a3b8", opacity: 1 },
            "&:focus": { borderColor: "#1e63d5" },
          }}
        />
        <IconButton
          type="button"
          aria-label="Send message"
          disabled={!input.trim() || sending}
          onClick={onSend}
          sx={{
            bgcolor: "#1e63d5",
            color: "#fff",
            width: 36,
            height: 36,
            "&:hover": { bgcolor: "#1854b8" },
            "&.Mui-disabled": { bgcolor: "#cbd5e1", color: "#fff" },
          }}
        >
          <SendRounded sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
