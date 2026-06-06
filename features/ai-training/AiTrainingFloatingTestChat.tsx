"use client";

import { useState, type ReactNode } from "react";
import ChatRounded from "@mui/icons-material/ChatRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { Typography } from "@/components/common";

/** Floating test chat — stays on the right; canvas controls live bottom-left. */
export function AiTrainingFloatingTestChat({
  children,
  siteHint,
  turnCount = 0,
  defaultOpen = false,
  anchor = "left",
}: {
  children: ReactNode;
  siteHint?: string;
  turnCount?: number;
  defaultOpen?: boolean;
  anchor?: "left" | "right";
}) {
  const [open, setOpen] = useState(defaultOpen);
  const side = anchor === "right" ? { right: 20, left: "auto" as const } : { left: 20, right: "auto" as const };

  if (!open) {
    return (
      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          ...side,
          zIndex: 18,
          maxWidth: "min(320px, calc(100% - 140px))",
        }}
      >
        <Box
          component="button"
          type="button"
          onClick={() => setOpen(true)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            pl: 1.1,
            pr: 1.5,
            py: 0.85,
            border: "none",
            borderRadius: 999,
            cursor: "pointer",
            color: "#fff",
            background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #3b82f6 100%)",
            boxShadow: "0 10px 28px rgba(29,78,216,0.38)",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0 14px 32px rgba(29,78,216,0.45)",
            },
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ChatRounded sx={{ fontSize: 18 }} />
          </Box>
          <Box sx={{ textAlign: "left", minWidth: 0 }}>
            <Typography variant="caption" fontWeight={800} sx={{ color: "inherit", display: "block", lineHeight: 1.2 }}>
              Test chat
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 10,
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 180,
              }}
            >
              {siteHint || "Live training"}
            </Typography>
          </Box>
          {turnCount > 0 ? (
            <Box
              sx={{
                minWidth: 20,
                height: 20,
                px: 0.5,
                borderRadius: 999,
                bgcolor: "#22c55e",
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {turnCount}
            </Box>
          ) : null}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 20,
        ...side,
        zIndex: 22,
        width: 320,
        maxWidth: "calc(100% - 32px)",
        maxHeight: "min(420px, calc(100% - 48px))",
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <IconButton
          size="small"
          aria-label="Minimize test chat"
          onClick={() => setOpen(false)}
          sx={{
            bgcolor: "rgba(15,23,42,0.75)",
            color: "#e2e8f0",
            backdropFilter: "blur(8px)",
            "&:hover": { bgcolor: "rgba(15,23,42,0.9)" },
          }}
        >
          <CloseRounded fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>{children}</Box>
    </Box>
  );
}
