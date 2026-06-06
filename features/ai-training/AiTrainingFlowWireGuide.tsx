"use client";

import CloseRounded from "@mui/icons-material/CloseRounded";
import LinkRounded from "@mui/icons-material/LinkRounded";
import TouchAppOutlined from "@mui/icons-material/TouchAppOutlined";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { alpha, useTheme } from "@mui/material/styles";
import { useState } from "react";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { studioColors } from "./ai-training-studio.tokens";

const STEPS = [
  { n: "1", text: "Click the block you want to connect from" },
  { n: "2", text: "Drag from its bottom dot ●" },
  { n: "3", text: "Release on the top dot ● of the next block" },
];

/** Dismissible wire-connect hint — collapsed by default (like How this works). */
export function AiTrainingFlowWireGuide() {
  const theme = useTheme() as AppTheme;
  const c = studioColors(theme);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Box
        component="button"
        type="button"
        onClick={() => setOpen(true)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          border: `1px solid ${c.border}`,
          borderRadius: 2,
          px: 1.25,
          py: 0.6,
          cursor: "pointer",
          bgcolor: c.surface,
          color: c.text,
          fontSize: 12,
          fontWeight: 600,
          boxShadow: `0 4px 14px rgba(15,23,42,${c.isLight ? 0.06 : 0.2})`,
        }}
      >
        <LinkRounded sx={{ fontSize: 16, color: c.accent }} />
        Wire help
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderRadius: 2,
        bgcolor: c.surface,
        border: `1px solid ${alpha(c.accent, 0.3)}`,
        boxShadow: `0 6px 20px rgba(15,23,42,${c.isLight ? 0.07 : 0.22})`,
        overflow: "hidden",
        maxWidth: 300,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 0.5,
          px: 1.25,
          py: 0.85,
          bgcolor: alpha(c.accent, 0.08),
          borderBottom: `1px solid ${alpha(c.border, 0.6)}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
          <LinkRounded sx={{ fontSize: 17, color: c.accent, flexShrink: 0 }} />
          <Typography variant="caption" fontWeight={700} sx={{ color: c.text }}>
            How to connect wires
          </Typography>
        </Box>
        <IconButton size="small" aria-label="Dismiss wire help" onClick={() => setOpen(false)} sx={{ color: c.textSecondary }}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ px: 1.25, py: 1, display: "grid", gap: 0.85 }}>
        {STEPS.map((step) => (
          <Box key={step.n} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                flexShrink: 0,
                bgcolor: alpha(c.accent, 0.15),
                color: c.accent,
                fontSize: 11,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {step.n}
            </Box>
            <Typography variant="caption" sx={{ color: c.textSecondary, lineHeight: 1.45, pt: 0.15 }}>
              {step.text}
            </Typography>
          </Box>
        ))}
        <Box
          sx={{
            mt: 0.25,
            pt: 0.85,
            borderTop: `1px dashed ${alpha(c.border, 0.7)}`,
            display: "flex",
            gap: 0.75,
            alignItems: "flex-start",
          }}
        >
          <TouchAppOutlined sx={{ fontSize: 15, color: c.textSecondary, mt: 0.1 }} />
          <Typography variant="caption" sx={{ color: c.textSecondary, lineHeight: 1.45, fontSize: 11 }}>
            <Box component="span" sx={{ color: c.text, fontWeight: 600 }}>
              Block details:
            </Box>{" "}
            preview icon on block (top-right) · click again to close
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: c.textSecondary, lineHeight: 1.45, fontSize: 11 }}>
          <Box component="span" sx={{ color: c.text, fontWeight: 600 }}>
            Delete wire:
          </Box>{" "}
          click the line → Remove wire (or Del key)
        </Typography>
      </Box>
    </Box>
  );
}
