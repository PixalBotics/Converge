"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import type { RuntimeChatAppearance } from "@/lib/widget-runtime/widget-runtime-appearance";
import type {
  EmbedPanelHeaderStatus,
  EmbedPanelHeaderStatusTone,
} from "@/lib/widget-runtime/embed-panel-header-status";

function toneStyles(
  appearance: RuntimeChatAppearance,
  tone: EmbedPanelHeaderStatusTone,
): { bg: string; color: string; dot: string } {
  const c = appearance.colors;
  const primary = c.primary;
  switch (tone) {
    case "agent":
      return {
        bg: `${primary}18`,
        color: primary,
        dot: "#22c55e",
      };
    case "queue":
      return {
        bg: `${c.mutedText}14`,
        color: c.mutedText,
        dot: "#f59e0b",
      };
    case "offline":
      return {
        bg: "#fef2f2",
        color: "#b91c1c",
        dot: "#ef4444",
      };
    case "typing":
    case "thinking":
      return {
        bg: `${primary}12`,
        color: primary,
        dot: primary,
      };
    case "assistant":
      return {
        bg: `${c.incomingBubbleBg}`,
        color: c.incomingBubbleText,
        dot: primary,
      };
    default:
      return {
        bg: `${primary}14`,
        color: primary,
        dot: "#22c55e",
      };
  }
}

/** Shorter copy on the colored panel bar so the title stays dominant. */
function headerBarStatusLabel(label: string): string {
  const short: Record<string, string> = {
    "Agent online": "Online",
    "In queue": "Queue",
    "Connecting agent": "Wait",
    "Thinking…": "…",
    "Typing…": "…",
  };
  return short[label] ?? (label.length > 14 ? `${label.slice(0, 13)}…` : label);
}

export function embedHeaderStatusChipSx(
  appearance: RuntimeChatAppearance,
  tone: EmbedPanelHeaderStatusTone,
  opts?: { onBar?: boolean },
): SxProps<Theme> {
  const t = toneStyles(appearance, tone);
  const onBar = opts?.onBar === true;
  const radius = onBar ? 6 : Math.max(12, appearance.borderRadiusPx + 4);
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: onBar ? 0.3 : 0.5,
    px: onBar ? 0.45 : 1,
    py: onBar ? 0.1 : 0.35,
    borderRadius: `${radius}px`,
    bgcolor: t.bg,
    color: t.color,
    fontFamily: appearance.colors.fontFamily,
    fontSize: onBar ? 9 : Math.max(11, appearance.colors.bodyFontSizePx - 2),
    fontWeight: onBar ? 500 : 600,
    lineHeight: 1,
    letterSpacing: onBar ? 0.01 : undefined,
    whiteSpace: "nowrap",
    flexShrink: 0,
    boxShadow: "none",
    maxHeight: onBar ? 16 : undefined,
  };
}

/** Compact status pill for panel header (live, agent joined, queue, etc.). */
export function EmbedChatHeaderStatusChip({
  appearance,
  status,
  onHeader,
}: {
  appearance: RuntimeChatAppearance;
  status: EmbedPanelHeaderStatus;
  /** Use light text when rendered on colored panel header bar. */
  onHeader?: boolean;
}) {
  const t = toneStyles(appearance, status.tone);
  const onBar = onHeader === true;

  const displayLabel = onBar ? headerBarStatusLabel(status.label) : status.label;

  return (
    <Box
      component="span"
      role="status"
      aria-label={status.label}
      title={status.label}
      sx={{
        ...embedHeaderStatusChipSx(appearance, status.tone, { onBar }),
        ...(onBar
          ? {
              bgcolor: "rgba(255,255,255,0.14)",
              color: appearance.chatBox.headerTextColor,
              border: "1px solid rgba(255,255,255,0.22)",
            }
          : {}),
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          width: onBar ? 4 : 6,
          height: onBar ? 4 : 6,
          borderRadius: "50%",
          bgcolor: onBar ? "#86efac" : t.dot,
          flexShrink: 0,
          ...(status.tone === "typing" || status.tone === "thinking"
            ? { animation: "embed-status-pulse 1.2s ease-in-out infinite" }
            : {}),
          "@keyframes embed-status-pulse": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.35 },
          },
        }}
      />
      <Typography
        component="span"
        variant="caption"
        sx={{
          color: "inherit",
          font: "inherit",
          lineHeight: 1,
          fontSize: "inherit",
        }}
      >
        {displayLabel}
      </Typography>
    </Box>
  );
}

/** In-panel header row (non-embedded preview only). */
export function EmbedChatPanelHeaderRow({
  appearance,
  title,
  status,
}: {
  appearance: RuntimeChatAppearance;
  title: string;
  status: EmbedPanelHeaderStatus | null;
}) {
  return (
    <Box
      sx={{
        flexShrink: 0,
        pb: 0.75,
        borderBottom: `1px solid ${appearance.colors.inputBorder}`,
        mb: 0.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          minHeight: 28,
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={600}
          sx={{
            color: appearance.colors.bodyText,
            fontFamily: appearance.colors.fontFamily,
            fontSize: appearance.colors.bodyFontSizePx,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </Typography>
        {status ? (
          <EmbedChatHeaderStatusChip appearance={appearance} status={status} />
        ) : null}
      </Box>
    </Box>
  );
}
