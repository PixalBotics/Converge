"use client";

import { useState, type ReactElement, cloneElement } from "react";
import ChatRounded from "@mui/icons-material/ChatRounded";
import Box from "@mui/material/Box";
import {
  aiTrainingTestChatFloatingDockSx,
  aiTrainingTestChatLauncherSx,
} from "./ai-training-test-chat.styles";

/** Floating test chat — bottom-right dock; does not inherit dashboard dark text. */
export function AiTrainingFloatingTestChat({
  children,
  siteHint,
  turnCount = 0,
  defaultOpen = false,
}: {
  children: ReactElement<{ onMinimize?: () => void; floating?: boolean }>;
  siteHint?: string;
  turnCount?: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (!open) {
    return (
      <Box sx={aiTrainingTestChatLauncherSx}>
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
            py: 0.9,
            border: "none",
            borderRadius: 999,
            cursor: "pointer",
            color: "#fff",
            background: "linear-gradient(135deg, #1e40af 0%, #2563eb 55%, #3b82f6 100%)",
            boxShadow: "0 12px 32px rgba(29,78,216,0.4)",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            fontFamily: '"Manrope", system-ui, sans-serif',
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 16px 36px rgba(29,78,216,0.48)",
            },
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ChatRounded sx={{ fontSize: 18, color: "#fff" }} />
          </Box>
          <Box sx={{ textAlign: "left", minWidth: 0 }}>
            <Box
              component="span"
              sx={{
                color: "#fff",
                fontSize: 13,
                fontWeight: 800,
                display: "block",
                lineHeight: 1.2,
              }}
            >
              Test chat
            </Box>
            <Box
              component="span"
              sx={{
                color: "rgba(255,255,255,0.88)",
                fontSize: 10,
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 200,
              }}
            >
              {siteHint || "Test environment"}
            </Box>
          </Box>
          {turnCount > 0 ? (
            <Box
              sx={{
                minWidth: 22,
                height: 22,
                px: 0.6,
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
    <Box sx={aiTrainingTestChatFloatingDockSx}>
      {cloneElement(children, {
        floating: true,
        onMinimize: () => setOpen(false),
      })}
    </Box>
  );
}
