"use client";

import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";
import SkipNextOutlined from "@mui/icons-material/SkipNextOutlined";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { alpha, useTheme } from "@mui/material/styles";
import { useState } from "react";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { FlowExecutionStep } from "@/api/ai-training/ai-training.api";
import { studioColors } from "./ai-training-studio.tokens";

function statusIcon(status: FlowExecutionStep["status"], theme: AppTheme) {
  switch (status) {
    case "done":
      return <CheckCircleOutlineRounded sx={{ fontSize: 18, color: theme.palette.success.main }} />;
    case "warn":
      return <WarningAmberRounded sx={{ fontSize: 18, color: theme.palette.warning.main }} />;
    case "failed":
      return <ErrorOutlineRounded sx={{ fontSize: 18, color: theme.palette.error.main }} />;
    default:
      return <SkipNextOutlined sx={{ fontSize: 18, opacity: 0.5 }} />;
  }
}

function ExecutionBody({
  steps,
  errors,
  isRunning,
  fullPage,
}: {
  steps: FlowExecutionStep[];
  errors: string[];
  isRunning?: boolean;
  fullPage?: boolean;
}) {
  const theme = useTheme() as AppTheme;
  const c = studioColors(theme);
  const hasRun = steps.length > 0 || errors.length > 0;

  return (
    <Box
      sx={{
        overflow: "auto",
        px: 2,
        py: fullPage ? 2 : 1.25,
        flex: fullPage ? 1 : undefined,
        maxHeight: fullPage ? "none" : 220,
        minHeight: fullPage ? 0 : undefined,
      }}
    >
      {errors.length > 0 ? (
        <Box
          sx={{
            mb: 1.25,
            p: 1.25,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.error.main, 0.08),
            border: `1px solid ${alpha(theme.palette.error.main, 0.25)}`,
          }}
        >
          <Typography variant="caption" fontWeight={700} sx={{ color: theme.palette.error.main, display: "block", mb: 0.5 }}>
            Issues found
          </Typography>
          {errors.map((err) => (
            <Typography
              key={err}
              variant="caption"
              sx={{ color: theme.palette.error.dark, display: "block", lineHeight: 1.45 }}
            >
              {err}
            </Typography>
          ))}
        </Box>
      ) : null}

      {!hasRun && !isRunning ? (
        <Box sx={{ py: fullPage ? 4 : 0, textAlign: fullPage ? "center" : "left", maxWidth: fullPage ? 480 : "none", mx: fullPage ? "auto" : 0 }}>
          <Typography variant={fullPage ? "body2" : "caption"} sx={{ color: c.textSecondary, lineHeight: 1.55 }}>
            No test run yet. Open <strong>Test chat</strong> (bottom-right on Flow diagram tab), send a message like
            &quot;hi&quot; or &quot;What are your hours?&quot;, then return here to see each step.
          </Typography>
        </Box>
      ) : null}

      {steps.map((step, i) => (
        <Box
          key={`${step.nodeId}-${i}`}
          sx={{
            display: "flex",
            gap: 1.25,
            py: 0.85,
            borderBottom: i < steps.length - 1 ? `1px solid ${alpha(c.border, 0.6)}` : "none",
          }}
        >
          <Box sx={{ pt: 0.15, flexShrink: 0 }}>{statusIcon(step.status, theme)}</Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: c.text }}>
                {step.nodeLabel}
              </Typography>
              {step.edgeLabel ? (
                <Typography variant="caption" sx={{ color: c.accent, fontSize: 10, fontWeight: 600 }}>
                  via &quot;{step.edgeLabel}&quot; path
                </Typography>
              ) : null}
            </Box>
            <Typography variant="caption" sx={{ color: c.textSecondary, display: "block", lineHeight: 1.45, mt: 0.25 }}>
              {step.conditionResult ?? step.detail}
            </Typography>
            {step.output && step.nodeType === "bot_reply" ? (
              <Typography
                variant="caption"
                sx={{
                  color: c.text,
                  display: "block",
                  mt: 0.5,
                  p: 0.75,
                  borderRadius: 1,
                  bgcolor: c.surfaceMuted,
                  border: `1px solid ${alpha(c.border, 0.5)}`,
                  fontSize: 11,
                  lineHeight: 1.45,
                }}
              >
                Bot reply: {step.output.length > 200 ? `${step.output.slice(0, 200)}…` : step.output}
              </Typography>
            ) : null}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export function AiTrainingFlowExecutionPanel({
  steps,
  errors,
  isRunning,
  variant = "panel",
}: {
  steps: FlowExecutionStep[];
  errors: string[];
  isRunning?: boolean;
  variant?: "panel" | "page";
}) {
  const theme = useTheme() as AppTheme;
  const c = studioColors(theme);
  const [open, setOpen] = useState(true);
  const hasRun = steps.length > 0 || errors.length > 0;

  if (variant === "page") {
    return (
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          bgcolor: c.surface,
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${c.border}`, bgcolor: c.surfaceMuted, flexShrink: 0 }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: c.text }}>
            Execution log
          </Typography>
          <Typography variant="caption" sx={{ color: c.textSecondary }}>
            {isRunning
              ? "Running test…"
              : hasRun
                ? `${steps.length} step(s)${errors.length ? ` · ${errors.length} issue(s)` : ""}`
                : "Step-by-step trace from your last test message"}
          </Typography>
        </Box>
        <ExecutionBody steps={steps} errors={errors} isRunning={isRunning} fullPage />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexShrink: 0,
        borderTop: `1px solid ${c.border}`,
        bgcolor: c.surface,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1,
          cursor: "pointer",
          borderBottom: open ? `1px solid ${c.border}` : "none",
          bgcolor: c.surfaceMuted,
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <Box>
          <Typography variant="body2" fontWeight={700} sx={{ color: c.text }}>
            Execution log
          </Typography>
          <Typography variant="caption" sx={{ color: c.textSecondary }}>
            {isRunning
              ? "Running test…"
              : hasRun
                ? `${steps.length} step(s)${errors.length ? ` · ${errors.length} issue(s)` : ""}`
                : "Send a test message to see each step the bot took"}
          </Typography>
        </Box>
        <IconButton size="small" sx={{ color: c.textSecondary }} aria-label={open ? "Collapse" : "Expand"}>
          {open ? <ExpandMore /> : <ExpandLess />}
        </IconButton>
      </Box>

      <Collapse in={open}>
        <ExecutionBody steps={steps} errors={errors} isRunning={isRunning} />
      </Collapse>
    </Box>
  );
}
