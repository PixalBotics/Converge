"use client";

import { useRef, useEffect } from "react";
import CloseRounded from "@mui/icons-material/CloseRounded";
import ScienceOutlined from "@mui/icons-material/ScienceOutlined";
import SendRounded from "@mui/icons-material/SendRounded";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { ChatFormattedMessage } from "@/lib/safe-markdown/ChatFormattedMessage";
import {
  aiTrainingTestChatHeaderSx,
  aiTrainingTestChatInputRowSx,
  aiTrainingTestChatMessagesSx,
  aiTrainingTestChatRootSx,
} from "./ai-training-test-chat.styles";

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
  floating = false,
  onMinimize,
}: {
  turns: TestChatTurn[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  sending?: boolean;
  botLabel?: string;
  siteHint?: string;
  floating?: boolean;
  onMinimize?: () => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, sending]);

  return (
    <Box sx={aiTrainingTestChatRootSx({ floating })}>
      <Box sx={aiTrainingTestChatHeaderSx}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          AI
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box
            component="span"
            sx={{
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.25,
              display: "block",
              color: "#fff",
            }}
          >
            {botLabel}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              mt: 0.35,
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.35,
                px: 0.65,
                py: 0.15,
                borderRadius: 999,
                bgcolor: "rgba(255,255,255,0.2)",
                fontSize: 10,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              <ScienceOutlined sx={{ fontSize: 11, color: "#fff" }} />
              Test environment
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "#4ade80",
                  flexShrink: 0,
                }}
              />
              <Box
                component="span"
                sx={{ color: "rgba(255,255,255,0.92)", fontSize: 11, lineHeight: 1.2 }}
              >
                {siteHint || "Indexed training"}
              </Box>
            </Box>
          </Box>
        </Box>
        {onMinimize ? (
          <IconButton
            size="small"
            aria-label="Minimize test chat"
            onClick={onMinimize}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.12)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
            }}
          >
            <CloseRounded sx={{ fontSize: 18 }} />
          </IconButton>
        ) : null}
      </Box>

      <Box ref={listRef} sx={aiTrainingTestChatMessagesSx}>
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
            Same AI pipeline as your live widget — multi-turn chat and indexed training. Ask
            follow-up questions to test context.
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
                  borderRadius:
                    turn.role === "visitor" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  bgcolor: turn.role === "visitor" ? "#1e63d5" : "#ffffff",
                  color: turn.role === "visitor" ? "#ffffff" : "#0f172a",
                  border: turn.role === "bot" ? "1px solid #e2e8f0" : "none",
                  boxShadow:
                    turn.role === "bot" ? "0 1px 3px rgba(15,23,42,0.06)" : "none",
                  fontSize: 13,
                }}
              >
                <ChatFormattedMessage
                  text={turn.text}
                  linkColor={turn.role === "visitor" ? "#bfdbfe" : "#2563eb"}
                />
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

      <Box sx={aiTrainingTestChatInputRowSx}>
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
            minHeight: 40,
            maxHeight: 96,
            outline: "none",
            color: "#0f172a",
            bgcolor: "#ffffff",
            "&::placeholder": { color: "#94a3b8", opacity: 1 },
            "&:focus": { borderColor: "#1e63d5", boxShadow: "0 0 0 2px rgba(30,99,213,0.15)" },
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
            width: 40,
            height: 40,
            flexShrink: 0,
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
