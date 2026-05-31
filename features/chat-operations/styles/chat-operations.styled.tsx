"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import { alpha, styled } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { dashboardCardFill, dashboardSolidSurface } from "./chat-semantic";
function dash(theme: Theme) {
  return (theme as AppTheme).app.dashboard;
}

function live(theme: Theme) {
  return dash(theme).liveChat;
}

function text(theme: Theme) {
  return (theme as AppTheme).app.text;
}

export const PanelColumn = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  overflow: "hidden",
}));

/** @deprecated Use PanelColumn inside separate panel cards. */
export const PanelDividerColumn = styled(PanelColumn)({});

export const PanelHeader = styled(Box)(({ theme }) => {
  const d = dash(theme);
  return {
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${alpha(d.cardBorder, 0.28)}`,
    flexShrink: 0,
    background: alpha(d.headerBg, 0.5),
  };
});

export const ScrollRegion = styled(Box)({
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarWidth: "thin",
});

export const ProfileHeroCard = styled(Box)(({ theme }) => {
  const d = dash(theme);
  return {
    margin: theme.spacing(0, 1.5, 1.5),
    padding: theme.spacing(1.5),
    borderRadius: 10,
    border: `1px solid ${alpha(d.cardBorder, 0.32)}`,
    background: `linear-gradient(165deg, ${alpha(d.accentIndigo, 0.12)} 0%, ${alpha(d.overlayLight, 0.2)} 100%)`,
  };
});

export const QueueItemRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ theme, active }) => {
  const d = dash(theme);
  return {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    margin: 0,
    padding: theme.spacing(1.35, 2),
    paddingLeft: theme.spacing(2.25),
    borderRadius: 0,
    cursor: "pointer",
    borderBottom: `1px solid ${alpha(d.cardBorder, 0.12)}`,
    background: active ? d.navActiveBg : "transparent",
    transition: "background-color 0.12s ease, border-color 0.12s ease",
    "&::before": active
      ? {
          content: '""',
          position: "absolute",
          left: 0,
          top: "16%",
          bottom: "16%",
          width: 3,
          borderRadius: "0 3px 3px 0",
          background: `linear-gradient(180deg, ${d.accentBlue} 0%, ${d.accentIndigo} 100%)`,
        }
      : { display: "none" },
    "&:hover": {
      background: active ? d.navActiveBg : alpha(d.overlayLight, 0.55),
    },
  };
});

export const QueueAvatar = styled(Box)(({ theme }) => {
  const lc = live(theme);
  return {
    width: 44,
    height: 44,
    borderRadius: "50%",
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 600,
    color: text(theme).primary,
    backgroundColor: lc.avatarBg,
    border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
  };
});

export const MessageThread = styled(Box)({
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
  gap: 0,
  scrollbarWidth: "thin",
  background: "transparent",
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    borderRadius: 3,
    backgroundColor: "rgba(128, 128, 128, 0.28)",
  },
  "&::-webkit-scrollbar-button": {
    display: "none",
    width: 0,
    height: 0,
  },
  "&::-webkit-scrollbar-corner": { background: "transparent" },
});

export const DateDivider = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.25),
  margin: theme.spacing(0.25, 0, 0.75),
  "&::before, &::after": {
    content: '""',
    flex: 1,
    height: 1,
    background: alpha(dash(theme).cardBorder, 0.45),
  },
}));

export const DateDividerLabel = styled(Typography)(({ theme }) => ({
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: dash(theme).textMuted,
}));

export const MessageRowOuter = styled(Box, {
  shouldForwardProp: (prop) => prop !== "outgoing" && prop !== "system",
})<{ outgoing?: boolean; system?: boolean }>(({ outgoing, system }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-end",
  gap: 10,
  alignSelf: system ? "center" : outgoing ? "flex-end" : "flex-start",
  maxWidth: system ? "90%" : "min(560px, 88%)",
  width: outgoing || system ? "auto" : "100%",
}));

export const MessageRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== "outgoing" && prop !== "system",
})<{ outgoing?: boolean; system?: boolean }>(({ outgoing, system }) => ({
  display: "flex",
  flexDirection: "column",
  flex: system ? undefined : 1,
  minWidth: 0,
  alignItems: outgoing ? "flex-end" : "flex-start",
}));

export const MessageAvatar = styled(Box)(({ theme }) => {
  const lc = live(theme);
  return {
    width: 32,
    height: 32,
    borderRadius: "50%",
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 600,
    color: text(theme).primary,
    backgroundColor: lc.avatarBg,
    border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
    visibility: "visible",
  };
});

export const MessageAvatarSpacer = styled(Box)({
  width: 32,
  flexShrink: 0,
});

function bubbleRadius(
  outgoing: boolean,
  position: "single" | "first" | "middle" | "last",
): string {
  if (outgoing) {
    switch (position) {
      case "first":
        return "16px 16px 6px 16px";
      case "middle":
        return "16px 6px 6px 16px";
      case "last":
        return "6px 16px 6px 16px";
      default:
        return "16px 16px 6px 16px";
    }
  }
  switch (position) {
    case "first":
      return "16px 16px 16px 6px";
    case "middle":
      return "6px 16px 16px 6px";
    case "last":
      return "6px 16px 16px 16px";
    default:
      return "16px 16px 16px 6px";
  }
}

export const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== "outgoing" && prop !== "system" && prop !== "groupPosition",
})<{
  outgoing?: boolean;
  system?: boolean;
  groupPosition?: "single" | "first" | "middle" | "last";
}>(({ theme, outgoing, system, groupPosition = "single" }) => {
  const d = dash(theme);
  const lc = live(theme);
  if (system) {
    return {
      padding: theme.spacing(0.5, 1.25),
      borderRadius: 999,
      fontSize: 12,
      background: alpha(d.overlayLight, 0.35),
      border: `1px solid ${alpha(d.cardBorder, 0.45)}`,
      color: d.textMuted,
    };
  }
  const radius = bubbleRadius(Boolean(outgoing), groupPosition);
  const tightTop =
    groupPosition === "middle" || groupPosition === "last" ? theme.spacing(0.35) : 0;

  return {
    marginTop: tightTop,
    padding: theme.spacing(1.15, 1.45),
    borderRadius: radius,
    fontSize: 15,
    lineHeight: 1.55,
    background: outgoing
      ? `linear-gradient(135deg, ${d.accentBlue} 0%, ${d.accentIndigo} 100%)`
      : lc.messageBg,
    border: outgoing ? "none" : `1px solid ${alpha(d.cardBorder, 0.28)}`,
    color: outgoing ? text(theme).primary : lc.messageText,
    boxShadow: outgoing ? `0 4px 16px ${alpha(d.accentBlue, 0.35)}` : "none",
  };
});

export const MessageMeta = styled(Typography)(({ theme }) => ({
  display: "block",
  marginTop: theme.spacing(0.35),
  fontSize: 11,
  color: dash(theme).textMuted,
}));

export const ComposerWrap = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  borderTop: `1px solid ${alpha(dash(theme).cardBorder, 0.22)}`,
  background: alpha(dash(theme).headerBg, 0.85),
}));

export const ComposerFooterShell = styled(Box)({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
});

export const ComposerFooterInner = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.25, 2, 1.25),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
}));

/** In-flow tools panel — stays inside the thread column (no floating outside the shell). */
export const ComposerToolsPanel = styled(Box)(({ theme }) => {
  const d = dash(theme);
  const panelFill =
    dashboardCardFill(theme, theme.palette.mode === "light" ? 0.65 : 0.45) ??
    alpha(dashboardSolidSurface(theme), theme.palette.mode === "light" ? 0.65 : 0.45);
  return {
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    maxHeight: "min(52vh, 420px)",
    minHeight: 320,
    overflow: "hidden",
    borderRadius: 12,
    border: `1px solid ${alpha(d.cardBorder, 0.32)}`,
    background: panelFill,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
  };
});

export const ComposerToolsHeader = styled(Box)(({ theme }) => {
  const d = dash(theme);
  return {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(1.25, 1.75),
    flexShrink: 0,
    borderBottom: `1px solid ${alpha(d.cardBorder, 0.35)}`,
    background: alpha(d.overlayLight, 0.35),
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  };
});

export const ComposerToolsBody = styled(Box)({
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarWidth: "thin",
});

export const ComposerIdleBar = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  borderTop: `1px solid ${alpha(dash(theme).cardBorder, 0.28)}`,
  padding: theme.spacing(1.5, 2.5),
  textAlign: "center",
  background: alpha(dash(theme).overlayLight, 0.2),
}));

export const ComposerRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-end",
  gap: theme.spacing(1.25),
}));

export const ComposerInputShell = styled(Box)(({ theme }) => {
  const d = dash(theme);
  return {
    flex: 1,
    display: "flex",
    alignItems: "flex-end",
    gap: theme.spacing(0.25),
    borderRadius: 14,
    border: `1px solid ${alpha(d.cardBorder, 0.45)}`,
    background: alpha(live(theme).messageBg, theme.palette.mode === "light" ? 0.9 : 0.55),
    padding: theme.spacing(0.75, 1.25),
    "&:focus-within": {
      borderColor: alpha(d.accentBlue, 0.65),
      boxShadow: `0 0 0 3px ${alpha(d.accentBlue, 0.12)}`,
    },
  };
});

export const ComposerTextField = styled(TextField)(({ theme }) => ({
  flex: 1,
  "& .MuiOutlinedInput-root": {
    borderRadius: 0,
    background: "transparent",
    fontSize: 14,
    padding: 0,
    "& fieldset": {
      border: "none",
    },
    "&:hover fieldset": {
      border: "none",
    },
    "&.Mui-focused fieldset": {
      border: "none",
    },
  },
  "& .MuiInputBase-input": {
    color: text(theme).primary,
    lineHeight: 1.45,
  },
  "& .MuiInputBase-input::placeholder": {
    color: dash(theme).textMuted,
    opacity: 1,
  },
}));

export const DrawerTabBar = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.75),
  paddingTop: theme.spacing(0.25),
}));

export const DrawerTabButton = styled("button", {
  shouldForwardProp: (prop) => prop !== "active" && prop !== "variant",
})<{ active?: boolean; variant?: "canned" | "ai" }>(({ theme, active, variant }) => {
  const d = dash(theme);
  const accent = variant === "ai" ? d.accentPurple : d.accentBlue;
  return {
    position: "relative",
    flex: 1,
    border: `1px solid ${alpha(d.cardBorder, active ? 0.55 : 0.3)}`,
    borderRadius: 10,
    cursor: "pointer",
    padding: theme.spacing(0.75, 1.1),
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(0.6),
    color: active ? text(theme).primary : d.textMuted,
    background: active ? alpha(accent, 0.14) : alpha(d.overlayLight, 0.2),
    transition: "all 0.15s ease",
    "&::before": active
      ? {
          content: '""',
          position: "absolute",
          left: 0,
          top: "18%",
          bottom: "18%",
          width: 3,
          borderRadius: "0 3px 3px 0",
          background: accent,
        }
      : { display: "none" },
    "& svg": {
      color: active ? accent : d.textMuted,
    },
    "&:hover": {
      color: text(theme).primary,
      borderColor: alpha(accent, 0.45),
      background: active ? alpha(accent, 0.18) : alpha(d.overlayLight, 0.35),
      "& svg": { color: accent },
    },
  };
});

export const AiAssistantShell = styled(Box)(({ theme }) => {
  const d = dash(theme);
  return {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    height: "100%",
    overflow: "hidden",
    background: `linear-gradient(180deg, ${alpha(d.accentPurple, 0.08)} 0%, transparent 52%)`,
  };
});

export const AiAssistantHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1, 1.25),
  borderBottom: `1px solid ${alpha(dash(theme).cardBorder, 0.32)}`,
  flexShrink: 0,
}));

export const AiAssistantIcon = styled(Box)(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: 8,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  background: `linear-gradient(135deg, ${alpha(dash(theme).accentPurple, 0.55)} 0%, ${alpha(dash(theme).accentIndigo, 0.65)} 100%)`,
  border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
  color: text(theme).primary,
}));

export const AiOnlineDot = styled(Box)(({ theme }) => ({
  width: 7,
  height: 7,
  borderRadius: "50%",
  bgcolor: theme.palette.success.main,
  boxShadow: `0 0 0 3px ${alpha(theme.palette.success.main, 0.22)}`,
  flexShrink: 0,
}));

export const AiChatThread = styled(Box)(({ theme }) => ({
  flex: 1,
  minHeight: 200,
  overflowY: "auto",
  padding: theme.spacing(1.5, 1.75),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.25),
  scrollbarWidth: "thin",
}));

export const AiChatBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== "role",
})<{ role: "user" | "assistant" }>(({ theme, role }) => {
  const d = dash(theme);
  const isUser = role === "user";
  return {
    alignSelf: isUser ? "flex-end" : "flex-start",
    maxWidth: "88%",
    padding: theme.spacing(1.1, 1.35),
    borderRadius: isUser ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
    fontSize: 13,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    color: text(theme).primary,
    background: isUser ? alpha(d.accentBlue, 0.22) : alpha(d.overlayLight, 0.5),
    border: `1px solid ${alpha(d.cardBorder, isUser ? 0.35 : 0.5)}`,
  };
});

export const AiQuickChip = styled("button", {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ theme, active }) => {
  const d = dash(theme);
  return {
    flexShrink: 0,
    border: `1px solid ${alpha(d.cardBorder, active ? 0.55 : 0.35)}`,
    borderRadius: 999,
    padding: theme.spacing(0.45, 1.1),
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
    color: active ? text(theme).primary : d.textMuted,
    background: active ? d.navActiveBg : alpha(d.overlayLight, 0.3),
    transition: "all 0.15s ease",
    "&:hover:not(:disabled)": {
      color: text(theme).primary,
      borderColor: alpha(d.accentPurple, 0.45),
      background: alpha(d.accentPurple, 0.14),
    },
    "&:disabled": {
      opacity: 0.4,
      cursor: "not-allowed",
    },
  };
});

export const AiInputFooter = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  padding: theme.spacing(1.5, 1.75, 1.5),
  borderTop: `1px solid ${alpha(dash(theme).cardBorder, 0.35)}`,
  background: alpha(dash(theme).overlayLight, 0.12),
}));

export const AiInputRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-end",
  gap: theme.spacing(0.75),
}));

export const AiSendButton = styled(IconButton)(({ theme }) => ({
  width: 36,
  height: 36,
  flexShrink: 0,
  background: `linear-gradient(135deg, ${dash(theme).accentPurple} 0%, ${dash(theme).accentIndigo} 100%)`,
  color: text(theme).primary,
  "&:hover": {
    background: `linear-gradient(135deg, ${dash(theme).accentIndigo} 0%, ${dash(theme).accentBlue} 100%)`,
  },
  "&.Mui-disabled": {
    opacity: 0.35,
    background: alpha(dash(theme).overlayLight, 0.4),
  },
}));

export const CannedReplyGrid = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.75),
  padding: theme.spacing(1.25, 1.5, 1.5),
}));

export const CannedReplyCard = styled(Box)(({ theme }) => {
  const d = dash(theme);
  return {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1),
    width: "100%",
    border: `1px solid ${alpha(d.cardBorder, 0.38)}`,
    borderRadius: 10,
    padding: theme.spacing(1, 1.25),
    background: alpha(d.overlayLight, 0.28),
    transition: "background-color 0.15s ease, border-color 0.15s ease",
    "&:hover": {
      background: alpha(d.accentBlue, 0.08),
      borderColor: alpha(d.accentBlue, 0.35),
    },
  };
});

/** @deprecated Use CannedReplyCard — kept for any external imports */
export const CannedReplyRow = styled("button")(({ theme }) => {
  const d = dash(theme);
  return {
    width: "100%",
    textAlign: "left",
    border: `1px solid ${alpha(d.cardBorder, 0.38)}`,
    borderRadius: 10,
    padding: theme.spacing(1, 1.25),
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 13,
    lineHeight: 1.45,
    color: text(theme).primary,
    background: alpha(d.overlayLight, 0.28),
    transition: "transform 0.12s ease, background-color 0.15s ease, border-color 0.15s ease",
    "&:hover": {
      transform: "translateY(-1px)",
      background: alpha(d.accentBlue, 0.14),
      borderColor: alpha(d.accentBlue, 0.42),
    },
    "&:active": {
      transform: "translateY(0)",
    },
  };
});

export const AiActionRow = styled("button")(({ theme }) => ({
  width: "100%",
  textAlign: "left",
  border: `1px solid ${alpha(dash(theme).cardBorder, 0.45)}`,
  borderRadius: 8,
  padding: theme.spacing(0.85, 1.1),
  marginBottom: theme.spacing(0.75),
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 13,
  color: text(theme).primary,
  background: alpha(dash(theme).overlayLight, 0.25),
  transition: "background-color 0.15s ease",
  "&:hover:not(:disabled)": {
    background: alpha(dash(theme).accentBlue, 0.12),
  },
  "&:disabled": {
    opacity: 0.45,
    cursor: "not-allowed",
  },
}));

export const AiOutputBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(1.25),
  borderRadius: 8,
  minHeight: 72,
  maxHeight: 120,
  overflowY: "auto",
  fontSize: 13,
  lineHeight: 1.5,
  whiteSpace: "pre-wrap",
  color: text(theme).primary,
  background: alpha(dash(theme).overlayLight, 0.35),
  border: `1px solid ${alpha(dash(theme).cardBorder, 0.45)}`,
  scrollbarWidth: "thin",
}));

/** Flat field list — grid + gap only (no bordered card) for cross-browser consistency. */
export const VisitorInfoGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  rowGap: theme.spacing(1.75),
  columnGap: 0,
  width: "100%",
}));

export const VisitorInfoCell = styled(Box)({
  display: "block",
  minWidth: 0,
  padding: 0,
  margin: 0,
});

export const VisitorInfoLabel = styled(Typography)(({ theme }) => ({
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: dash(theme).textMuted,
  marginBottom: theme.spacing(0.5),
  display: "block",
  lineHeight: 1.3,
}));

export const VisitorInfoValue = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  fontWeight: 500,
  color: text(theme).primary,
  wordBreak: "break-word",
  overflowWrap: "anywhere",
  lineHeight: 1.45,
}));

export const EmptyState = styled(Box)(({ theme }) => {
  const d = dash(theme);
  return {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1.25),
    padding: theme.spacing(4, 3),
    textAlign: "center",
    color: d.textMuted,
  };
});

export const EmptyStateIconRing = styled(Box)(({ theme }) => {
  const d = dash(theme);
  return {
    width: 72,
    height: 72,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing(0.5),
    background: `radial-gradient(100% 100% at 50% 0%, ${alpha(d.accentIndigo, 0.35)} 0%, ${alpha(d.accentPurple, 0.12)} 100%)`,
    border: `1px solid ${alpha(d.cardBorder, 0.4)}`,
    boxShadow: `0 0 32px ${alpha(d.accentBlue, 0.15)}`,
    color: d.accentCyan,
  };
});

export const TypingIndicator = styled(Box)(({ theme }) => ({
  alignSelf: "flex-start",
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing(0.75),
  marginLeft: 42,
  padding: theme.spacing(0.75, 1.25),
  borderRadius: "16px 16px 16px 6px",
  fontSize: 12,
  color: live(theme).messageText,
  background: live(theme).messageBg,
  border: `1px solid ${alpha(dash(theme).cardBorder, 0.28)}`,
}));

export const TypingDots = styled(Box)(() => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  "& span": {
    width: 5,
    height: 5,
    borderRadius: "50%",
    backgroundColor: "currentColor",
    opacity: 0.45,
    animation: "chatOpsTypingBounce 1.2s ease-in-out infinite",
    "&:nth-of-type(2)": { animationDelay: "0.15s" },
    "&:nth-of-type(3)": { animationDelay: "0.3s" },
  },
  "@keyframes chatOpsTypingBounce": {
    "0%, 60%, 100%": { opacity: 0.35, transform: "translateY(0)" },
    "30%": { opacity: 1, transform: "translateY(-3px)" },
  },
}));

export const ProfileDetailRow = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: theme.spacing(1.75),
  padding: theme.spacing(0.5, 0),
}));

export const ProfileAccordion = styled(Box)({
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarWidth: "thin",
});

export const SubTabRow = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.5),
  marginBottom: theme.spacing(1.25),
}));

export const LocationMapFrame = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: 112,
  borderRadius: 10,
  overflow: "hidden",
  border: `1px solid ${alpha(dash(theme).cardBorder, 0.55)}`,
  background: alpha(dash(theme).overlayLight, 0.25),
  "& iframe": {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    border: 0,
  },
}));

export const VisitorSectionCard = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${alpha(dash(theme).cardBorder, 0.45)}`,
}));

export const VisitorSectionTitle = styled(Typography)(({ theme }) => ({
  display: "block",
  marginBottom: theme.spacing(1.25),
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  fontSize: 11,
  color: dash(theme).textMuted,
}));

export const JourneyTimeline = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: 0,
  paddingLeft: theme.spacing(1.25),
  borderLeft: `2px solid ${alpha(dash(theme).accentPurple, 0.35)}`,
}));

export const JourneyStep = styled(Box)(({ theme }) => ({
  position: "relative",
  paddingBottom: theme.spacing(1.5),
  paddingLeft: theme.spacing(1.5),
  "&::before": {
    content: '""',
    position: "absolute",
    left: -7,
    top: 4,
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: dash(theme).accentPurple,
    boxShadow: `0 0 0 3px ${alpha(dash(theme).accentPurple, 0.2)}`,
  },
  "&:last-of-type": {
    paddingBottom: 0,
  },
}));

export const CloseChatPanel = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  padding: theme.spacing(1.75),
  borderRadius: 10,
  border: `1px solid ${alpha(theme.palette.error.main, 0.22)}`,
  background: `linear-gradient(165deg, ${alpha(theme.palette.error.main, 0.08)} 0%, ${alpha(dash(theme).overlayLight, 0.2)} 100%)`,
}));

export const ChatHeaderMetaChip = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  flexDirection: "column",
  gap: 2,
  padding: theme.spacing(0.65, 1.15),
  borderRadius: "10px",
  minWidth: 84,
  border: `1px solid ${alpha(dash(theme).cardBorder, 0.45)}`,
  background: alpha(dash(theme).overlayLight, 0.35),
}));

export const SubTabButton = styled("button", {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ theme, active }) => ({
  border: `1px solid ${alpha(dash(theme).cardBorder, active ? 0.55 : 0.35)}`,
  borderRadius: 999,
  padding: theme.spacing(0.35, 1),
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 11,
  fontWeight: 600,
  color: active ? text(theme).primary : dash(theme).textMuted,
  background: active ? dash(theme).navActiveBg : "transparent",
  transition: "all 0.15s ease",
  "&:hover": {
    color: text(theme).primary,
    background: alpha(dash(theme).overlayLight, 0.35),
  },
}));
