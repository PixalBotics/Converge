import type { CSSProperties } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ChatParticipantRole } from "@/services/chat/chat.types";
import {
  resolveBubbleSurfaceSx,
  resolveLauncherFabSurfaceSx,
  resolveWidgetPanelSurfaceSx,
} from "@/lib/chat-widget/launcher-style";
import {
  normalizeAgentAvatarPreset,
  normalizeVisitorAvatarPreset,
} from "@/lib/chat-widget/chat-avatar-presets";
import type { RuntimeChatAppearance } from "./widget-runtime-appearance";

export const EMBED_CHAT_AVATAR_SIZE_PX = 32;
export const EMBED_CHAT_AVATAR_GAP_PX = 8;
export const EMBED_CHAT_AVATAR_COLUMN_PX =
  EMBED_CHAT_AVATAR_SIZE_PX + EMBED_CHAT_AVATAR_GAP_PX;

export function embedChatBubbleMaxWidth(): string {
  return `calc(100% - ${EMBED_CHAT_AVATAR_COLUMN_PX}px)`;
}

/** Keep left/right transcript gutters even when only the agent avatar is enabled. */
export function shouldMirrorEmbedChatAvatarColumn(
  appearance: RuntimeChatAppearance,
  align: "start" | "end",
  showAvatar: boolean,
): boolean {
  if (showAvatar) return false;
  if (align === "end") {
    return appearance.avatars.agent.enabled && !appearance.avatars.visitor.enabled;
  }
  return appearance.avatars.visitor.enabled && !appearance.avatars.agent.enabled;
}

export function resolveEmbedChatAvatarDisplay(
  appearance: RuntimeChatAppearance,
  variant: "agent" | "visitor",
): { url: string; preset: string } {
  const config =
    variant === "visitor" ? appearance.avatars.visitor : appearance.avatars.agent;
  const url =
    config.url.trim() ||
    (variant === "agent" ? appearance.launcher.proactiveTeaserAvatarUrl.trim() : "") ||
    "";
  const preset =
    variant === "visitor"
      ? normalizeVisitorAvatarPreset(config.preset)
      : normalizeAgentAvatarPreset(config.preset);
  return { url, preset };
}

/**
 * Published `chat.colors` only defines incoming/outgoing bubbles.
 * Visitor = incoming; agent, AI, and legacy system assistant lines = outgoing tokens.
 */
export function resolveEmbedMessageBubbleRole(
  role: ChatParticipantRole,
): "visitor" | "assistant" {
  if (role === "visitor") return "visitor";
  return "assistant";
}

/** Floating launcher FAB — style presets (solid, gradient, glass, glow). */
export function embedLauncherFabSx(
  appearance: RuntimeChatAppearance,
  shape: string,
  sizePx: number,
): SxProps<Theme> {
  const surface = resolveLauncherFabSurfaceSx({
    style: appearance.launcher.style,
    buttonColor: appearance.launcher.buttonColor,
    buttonHoverColor: appearance.launcher.buttonHoverColor,
    iconColor: appearance.launcher.iconColor,
    shape,
    sizePx,
  });
  return surface;
}

/** Single scroll region for chat transcript (avoids nested scrollbars). */
export function embedPanelMessageListSx(
  appearance: RuntimeChatAppearance,
): SxProps<Theme> {
  const c = appearance.colors;
  const padX = Math.max(10, appearance.densityTokens.panelPaddingPx * 0.65);
  return {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    overflowX: "hidden",
    px: `${padX}px`,
    pt: 0.5,
    pb: 1,
    scrollbarWidth: "thin",
    scrollbarColor: `${c.mutedText}40 transparent`,
    "&::-webkit-scrollbar": { width: 6 },
    "&::-webkit-scrollbar-track": { background: "transparent" },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: `${c.mutedText}33`,
      borderRadius: 3,
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: `${c.mutedText}55`,
    },
    /** Windows/Electron: hide up/down arrow buttons on partial webkit styling. */
    "&::-webkit-scrollbar-button": {
      display: "none",
      width: 0,
      height: 0,
    },
    "&::-webkit-scrollbar-corner": { background: "transparent" },
  };
}

/** Embedded chat panel shell — one column, transcript scrolls inside. */
export function embedEmbeddedChatPanelSx(
  appearance: RuntimeChatAppearance,
): SxProps<Theme> {
  const padY = appearance.densityTokens.panelPaddingPx / 8;
  return {
    border: "none",
    borderRadius: 0,
    px: 0,
    py: padY,
    bgcolor: "transparent",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    gap: 0.75,
    boxShadow: "none",
  };
}

export function embedComposerFooterSx(
  appearance: RuntimeChatAppearance,
): SxProps<Theme> {
  const c = appearance.colors;
  return {
    flexShrink: 0,
    pt: 1,
    mt: 0.25,
    borderTop: `1px solid ${c.inputBorder}`,
  };
}

/** Sticky composer + optional Talk to agent — stays visible inside fixed panel height. */
export function embedComposerFooterStackSx(
  appearance: RuntimeChatAppearance,
): SxProps<Theme> {
  const c = appearance.colors;
  const padX = Math.max(10, appearance.densityTokens.panelPaddingPx * 0.65);
  return {
    flexShrink: 0,
    width: "100%",
    mt: "auto",
    pt: 1,
    px: `${padX}px`,
    pb: 0.5,
    borderTop: `1px solid ${c.inputBorder}`,
    display: "flex",
    flexDirection: "column",
    gap: 0.75,
  };
}

export function embedTeaserPreviewSx(
  appearance: RuntimeChatAppearance,
): SxProps<Theme> {
  return embedIncomingPreviewBubbleSx(appearance);
}

/** Closed-widget last-message preview — matches incoming chat bubble colors. */
export function embedIncomingPreviewBubbleSx(
  appearance: RuntimeChatAppearance,
): SxProps<Theme> {
  const c = appearance.colors;
  return {
    maxWidth: 300,
    px: 1.5,
    py: 1.25,
    cursor: "pointer",
    borderRadius: `${Math.max(10, appearance.borderRadiusPx)}px`,
    bgcolor: c.incomingBubbleBg,
    color: c.incomingBubbleText,
    fontSize: c.bodyFontSizePx ?? 13,
    lineHeight: 1.45,
    fontFamily: c.fontFamily,
    border: `1px solid ${c.incomingBubbleBg}`,
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.1)",
    ...(appearance.motionEnabled
      ? {
          animation: "converge-widget-teaser-in 0.35s ease",
          "@keyframes converge-widget-teaser-in": {
            from: { opacity: 0, transform: "translateY(8px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
        }
      : {}),
  };
}

/** Primary CTA using widget brand colors (not app dashboard theme). */
export function embedPrimaryButtonSx(appearance: RuntimeChatAppearance): SxProps<Theme> {
  const c = appearance.colors;
  return {
    bgcolor: `${c.primary} !important`,
    color: `${c.outgoingBubbleText} !important`,
    borderRadius: `${appearance.borderRadiusPx}px`,
    fontSize: c.bodyFontSizePx,
    fontFamily: c.fontFamily,
    textTransform: "none",
    boxShadow: "none",
    "&:hover": {
      bgcolor: `${appearance.launcher.buttonHoverColor} !important`,
      color: `${c.outgoingBubbleText} !important`,
      boxShadow: "none",
    },
    "&.Mui-disabled": {
      bgcolor: `${c.talkToAgentBackground} !important`,
      color: `${c.mutedText} !important`,
      opacity: 0.85,
    },
  };
}

/** Pre-chat field labels — `chat.colors.labelColor`. */
export function embedLabelTextSx(appearance: RuntimeChatAppearance): SxProps<Theme> {
  const c = appearance.colors;
  return {
    color: `${c.labelText} !important`,
    fontFamily: c.fontFamily,
    fontSize: c.bodyFontSizePx,
  };
}

export function embedBodyTextSx(appearance: RuntimeChatAppearance): SxProps<Theme> {
  const c = appearance.colors;
  return {
    color: `${c.bodyText} !important`,
    fontFamily: c.fontFamily,
    fontSize: c.bodyFontSizePx,
  };
}

export function embedMutedTextSx(appearance: RuntimeChatAppearance): SxProps<Theme> {
  const c = appearance.colors;
  return {
    color: `${c.mutedText} !important`,
    fontFamily: c.fontFamily,
    fontSize: c.bodyFontSizePx,
  };
}

export function embedPanelPaperSx(appearance: RuntimeChatAppearance): SxProps<Theme> {
  const c = appearance.colors;
  return {
    ...resolveWidgetPanelSurfaceSx({
      style: appearance.panelSurfaceStyle,
      buttonColor: appearance.launcher.buttonColor,
      buttonHoverColor: appearance.launcher.buttonHoverColor,
      panelBackground: c.panelBackground,
      borderRadiusPx: appearance.borderRadiusPx,
    }),
    color: c.bodyText,
    fontFamily: c.fontFamily,
    overflow: "hidden" as const,
  };
}

export function embedPanelBodyBackgroundSx(
  appearance: RuntimeChatAppearance,
): SxProps<Theme> {
  if (appearance.panelSurfaceStyle === "glass") {
    return { bgcolor: "transparent" };
  }
  if (appearance.panelSurfaceStyle === "gradient") {
    return {
      bgcolor: "transparent",
      background: `linear-gradient(180deg, transparent 0%, ${appearance.chatBox.backgroundColor}88 100%)`,
    };
  }
  return { bgcolor: appearance.chatBox.backgroundColor };
}

export function embedInputFieldSx(appearance: RuntimeChatAppearance): SxProps<Theme> {
  const c = appearance.colors;
  const radius = Math.max(6, appearance.borderRadiusPx - 2);
  return {
    "& .MuiFormControl-root": {
      marginBottom: 0,
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: `${radius}px`,
      bgcolor: `${c.inputBackground} !important`,
      fontFamily: c.fontFamily,
      fontSize: c.inputFontSizePx,
      boxShadow: "none",
      "& fieldset": {
        border: `1px solid ${c.inputBorder} !important`,
      },
      "&::before, &::after": {
        display: "none !important",
      },
      "&:hover fieldset": {
        borderColor: `${c.primary} !important`,
      },
      "&.Mui-focused fieldset": {
        borderColor: `${c.primary} !important`,
        borderWidth: "1px !important",
      },
      "&.Mui-error fieldset": {
        borderColor: "inherit",
      },
      "& input, & textarea": {
        color: `${c.inputText} !important`,
        caretColor: c.inputText,
        WebkitTextFillColor: `${c.inputText} !important`,
      },
      "& input::placeholder, & textarea::placeholder": {
        color: `${c.inputPlaceholder} !important`,
        opacity: 1,
      },
    },
    "& .MuiFormHelperText-root": {
      color: `${c.mutedText} !important`,
      fontFamily: c.fontFamily,
    },
  };
}

export function embedNativeInputStyle(appearance: RuntimeChatAppearance): CSSProperties {
  const c = appearance.colors;
  return {
    width: "100%",
    borderRadius: Math.max(6, appearance.borderRadiusPx - 2),
    padding: appearance.densityTokens.inputPaddingPx,
    color: c.inputText,
    background: c.inputBackground,
    border: `1px solid ${c.inputBorder}`,
    fontFamily: c.fontFamily,
    fontSize: c.inputFontSizePx,
    outline: "none",
  };
}

export function embedInquiryPillSx(
  appearance: RuntimeChatAppearance,
  selected: boolean,
): SxProps<Theme> {
  const c = appearance.colors;
  if (selected) {
    return {
      ...embedPrimaryButtonSx(appearance),
      minHeight: 32,
      px: 1.5,
    };
  }
  return {
    bgcolor: `${c.inquiryIdleBg} !important`,
    color: `${c.inquiryIdleText} !important`,
    border: `1px solid ${c.inquiryIdleBorder} !important`,
    borderRadius: `${appearance.borderRadiusPx}px`,
    fontFamily: c.fontFamily,
    fontSize: c.bodyFontSizePx,
    textTransform: "none",
    boxShadow: "none",
    minHeight: 32,
    px: 1.5,
    "&:hover": {
      bgcolor: c.inquiryIdleBg,
      borderColor: c.primary,
      color: `${c.inquiryIdleText} !important`,
    },
  };
}

export function embedTalkToAgentButtonSx(appearance: RuntimeChatAppearance): SxProps<Theme> {
  const c = appearance.colors;
  return {
    bgcolor: `${c.talkToAgentBackground} !important`,
    color: `${c.talkToAgentText} !important`,
    border: `1px solid ${c.talkToAgentBorder} !important`,
    borderRadius: `${appearance.borderRadiusPx}px`,
    fontFamily: c.fontFamily,
    fontSize: c.bodyFontSizePx,
    textTransform: "none",
    boxShadow: "none",
    "&:hover": {
      bgcolor: c.talkToAgentBackground,
      borderColor: c.primary,
      color: `${c.talkToAgentText} !important`,
    },
  };
}

export function embedMessageBubbleSx(
  appearance: RuntimeChatAppearance,
  role: "visitor" | "assistant",
): SxProps<Theme> {
  const c = appearance.colors;
  if (role === "visitor") {
    return {
      bgcolor: `${c.outgoingBubbleBg} !important`,
      color: `${c.outgoingBubbleText} !important`,
    };
  }
  return {
    bgcolor: `${c.incomingBubbleBg} !important`,
    color: `${c.incomingBubbleText} !important`,
  };
}

export function embedChatBubbleShellSx(
  align: "start" | "end" = "start",
): SxProps<Theme> {
  return {
    alignSelf: align === "end" ? "flex-end" : "flex-start",
    maxWidth: embedChatBubbleMaxWidth(),
    width: "fit-content",
    mb: 0.75,
    minWidth: 0,
  };
}

export function embedChatAvatarSpacerSx(): SxProps<Theme> {
  return {
    width: EMBED_CHAT_AVATAR_SIZE_PX,
    height: EMBED_CHAT_AVATAR_SIZE_PX,
    flexShrink: 0,
  };
}

/** Assistant / greeting row with optional avatar (wizard-style). */
export function embedChatBubbleRowSx(
  align: "start" | "end" = "start",
): SxProps<Theme> {
  return {
    display: "flex",
    alignItems: "flex-start",
    gap: `${EMBED_CHAT_AVATAR_GAP_PX}px`,
    alignSelf: align === "end" ? "flex-end" : "flex-start",
    maxWidth: "100%",
    width: "fit-content",
    mb: 0.75,
    flexDirection: "row",
    justifyContent: align === "end" ? "flex-end" : "flex-start",
  };
}

export function embedChatBubbleInnerSx(
  appearance: RuntimeChatAppearance,
  role: "greeting" | "assistant" | "visitor",
): SxProps<Theme> {
  const c = appearance.colors;
  const accent = appearance.accentPalette;
  const radius = Math.max(10, appearance.borderRadiusPx);
  const bubbleShape =
    appearance.borderRadiusPx >= 20 ? "pill" : appearance.borderRadiusPx <= 6 ? "square" : "rounded";
  const tailRadius = bubbleShape === "pill" ? radius : bubbleShape === "square" ? 4 : 4;
  const base = {
    px: 1.5,
    py: 1.05,
    fontFamily: c.fontFamily,
    fontSize: c.bodyFontSizePx,
    lineHeight: 1.55,
    wordBreak: "break-word" as const,
    border: `1px solid ${accent.border}40`,
    boxShadow: `0 2px 6px ${accent.main}16`,
  };
  const surface = resolveBubbleSurfaceSx({
    style: appearance.bubbleSurfaceStyle,
    role,
    baseBg:
      role === "visitor"
        ? c.outgoingBubbleBg
        : role === "greeting"
          ? c.greetingBubbleBg
          : c.incomingBubbleBg,
    baseText:
      role === "visitor"
        ? c.outgoingBubbleText
        : role === "greeting"
          ? c.greetingBubbleText
          : c.incomingBubbleText,
    primary: c.primary,
    hover: appearance.launcher.buttonHoverColor,
  });

  if (role === "visitor") {
    return {
      ...base,
      borderRadius: `${radius}px ${radius}px ${tailRadius}px ${radius}px`,
      bgcolor: `${c.outgoingBubbleBg} !important`,
      color: `${c.outgoingBubbleText} !important`,
      borderColor: `${c.outgoingBubbleBg}55`,
      ...surface,
    };
  }
  if (role === "greeting") {
    return {
      ...base,
      borderRadius: `${radius}px`,
      bgcolor: `${c.greetingBubbleBg} !important`,
      color: `${c.greetingBubbleText} !important`,
      borderColor: `${accent.border}44`,
      boxShadow: `0 2px 8px ${accent.main}18`,
      ...surface,
    };
  }
  return {
    ...base,
    borderRadius: `${radius}px ${radius}px ${radius}px ${tailRadius}px`,
    bgcolor: `${c.incomingBubbleBg} !important`,
    color: `${c.incomingBubbleText} !important`,
    borderColor: `${accent.border}40`,
    ...surface,
  };
}

/** Transcript bubble (agent/visitor) — uses incoming/outgoing colors with chat tail radius. */
export function embedTranscriptBubbleInnerSx(
  appearance: RuntimeChatAppearance,
  role: "visitor" | "assistant",
): SxProps<Theme> {
  return embedChatBubbleInnerSx(
    appearance,
    role === "visitor" ? "visitor" : "assistant",
  );
}

/** @deprecated Prefer embedChatBubbleInnerSx — kept for call sites using flat Typography sx. */
export function embedGreetingBubbleSx(appearance: RuntimeChatAppearance): SxProps<Theme> {
  return embedChatBubbleInnerSx(appearance, "greeting");
}

/** Pre-chat form shell — full-width assistant bubble (chat-style form block). */
export function embedPrechatFormBubbleShellSx(): SxProps<Theme> {
  return {
    ...embedChatBubbleShellSx("start"),
    alignSelf: "stretch",
    width: "100%",
    maxWidth: "100%",
    mt: 0.25,
  };
}

/** Inner form bubble — published incoming bubble colors; fields use input tokens inside. */
export function embedPrechatFormBubbleInnerSx(
  appearance: RuntimeChatAppearance,
): SxProps<Theme> {
  const pad = appearance.densityTokens.panelPaddingPx / 8;
  return {
    ...embedChatBubbleInnerSx(appearance, "assistant"),
    alignSelf: "stretch",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    px: Math.max(1.35, pad * 0.9),
    py: Math.max(1.15, pad * 0.85),
  };
}

/** @deprecated Use embedPrechatFormBubble* — kept for any external imports. */
export function embedPrechatFormCardSx(appearance: RuntimeChatAppearance): SxProps<Theme> {
  return embedPrechatFormBubbleInnerSx(appearance);
}

export function embedPrechatSectionLabelSx(
  appearance: RuntimeChatAppearance,
): SxProps<Theme> {
  const c = appearance.colors;
  return {
    color: `${c.mutedText} !important`,
    fontFamily: c.fontFamily,
    fontSize: c.bodyFontSizePx,
    fontWeight: 600,
    letterSpacing: "0.02em",
    textTransform: "none",
    mb: 0.75,
  };
}

export function embedIconButtonAccentSx(appearance: RuntimeChatAppearance): SxProps<Theme> {
  const c = appearance.colors;
  return {
    color: `${c.primary} !important`,
    "&:hover": { bgcolor: `${c.primary}14` },
  };
}

/** Composer row — pill input + circular send (matches industrial embed pattern). */
export function embedComposerRowSx(appearance: RuntimeChatAppearance): SxProps<Theme> {
  void appearance;
  return {
    display: "flex",
    alignItems: "center",
    gap: 1,
    width: "100%",
    minHeight: 44,
    px: 0.25,
  };
}

export function embedComposerInputSx(appearance: RuntimeChatAppearance): SxProps<Theme> {
  const c = appearance.colors;
  const radius = Math.max(20, appearance.borderRadiusPx + 8);
  return {
    flex: 1,
    minWidth: 0,
    "& .MuiOutlinedInput-root": {
      borderRadius: `${radius}px`,
      bgcolor: `${c.inputBackground} !important`,
      fontFamily: c.fontFamily,
      fontSize: c.inputFontSizePx,
      minHeight: 42,
      px: 0.5,
      boxShadow: "none",
      "& fieldset": {
        border: `1px solid ${c.inputBorder} !important`,
      },
      "&:hover fieldset": {
        borderColor: `${c.primary} !important`,
      },
      "&.Mui-focused fieldset": {
        borderColor: `${c.primary} !important`,
        borderWidth: "1px !important",
      },
      "& input": {
        color: `${c.inputText} !important`,
        caretColor: c.inputText,
        WebkitTextFillColor: `${c.inputText} !important`,
        py: 1.1,
        px: 1.5,
        "&::placeholder": {
          color: `${c.inputPlaceholder} !important`,
          opacity: 1,
        },
      },
    },
  };
}

/** Composer send control — `chat.colors.button` + `outgoingMessageText`. */
export function embedSendButtonSx(appearance: RuntimeChatAppearance): SxProps<Theme> {
  const c = appearance.colors;
  return {
    bgcolor: c.primary,
    color: c.outgoingBubbleText,
    borderRadius: "50%",
    width: 42,
    height: 42,
    flexShrink: 0,
    "&:hover": {
      bgcolor: appearance.launcher.buttonHoverColor,
      color: c.outgoingBubbleText,
    },
  };
}
