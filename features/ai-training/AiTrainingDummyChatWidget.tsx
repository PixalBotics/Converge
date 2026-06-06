"use client";

import { useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import SendRounded from "@mui/icons-material/SendRounded";
import { Typography } from "@/components/common";

export type DummyChatTurn = {
  id: string;
  role: "visitor" | "bot";
  text: string;
};

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
  turns: DummyChatTurn[];
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
        bgcolor: "rgba(255,255,255,0.98)",
        display: "flex",
        flexDirection: "column",
        minHeight: compact ? 380 : 440,
        backdropFilter: "blur(12px)",
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
          <Typography variant="body2" fontWeight={700} sx={{ color: "inherit", lineHeight: 1.2 }}>
            {botLabel}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#4ade80" }} />
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.9)", fontSize: 11 }}>
              {siteHint || "sandbox"}
            </Typography>
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
          <Typography variant="body2" sx={{ color: "#64748b", textAlign: "center", mt: 3, px: 1.5, fontSize: 13 }}>
            Send a message — the bot replies using your indexed training data.
          </Typography>
        ) : (
          turns.map((turn) => (
            <Box
              key={turn.id}
              sx={{
                mb: 1,
                display: "flex",
                justifyContent: turn.role === "visitor" ? "flex-end" : "flex-start",
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
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.45, fontSize: 13 }}>
                  {turn.text}
                </Typography>
              </Box>
            </Box>
          ))
        )}
        {sending ? (
          <Typography variant="caption" sx={{ color: "#64748b", pl: 0.5 }}>
            Bot is typing…
          </Typography>
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
          placeholder="Test message…"
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
