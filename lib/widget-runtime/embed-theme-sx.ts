import type { CSSProperties } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ChatParticipantRole } from "@/services/chat/chat.types";
import type { RuntimeChatAppearance } from "./widget-runtime-appearance";

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

/** Floating launcher FAB — flat, no MUI elevation shadow. */
export function embedLauncherFabSx(
  appearance: RuntimeChatAppearance,
  shape: string,
  sizePx: number,
): SxProps<Theme> {
  const radius =
    shape === "square" ? "10px" : shape === "rounded" ? "16px" : "50%";
  const noShadow = {
    boxShadow: "none !important",
    filter: "none",
    backgroundImage: "none",
  };
  return {
    width: sizePx,
    height: sizePx,
    minWidth: sizePx,
    minHeight: sizePx,
    flexShrink: 0,
    borderRadius: radius,
    bgcolor: `${appearance.launcher.buttonColor} !important`,
    color: `${appearance.launcher.iconColor} !important`,
    overflow: "hidden",
    border: "none",
    ...noShadow,
    transition: "background-color 0.15s ease",
    "&:hover": {
      bgcolor: `${appearance.launcher.buttonHoverColor} !important`,
      color: `${appearance.launcher.iconColor} !important`,
      ...noShadow,
    },
    "&:active": noShadow,
    "&:focus": noShadow,
    "&:focus-visible": {
      ...noShadow,
      outline: `2px solid ${appearance.colors.primary}`,
      outlineOffset: 2,
    },
    "&.Mui-focusVisible": noShadow,
    "&.MuiIconButton-root": noShadow,
  };
}

/** Single scroll region for chat transcript (avoids nested scrollbars). */
export function embedPanelMessageListSx(
  appearance: RuntimeChatAppearance,
): SxProps<Theme> {
  const c = appearance.colors;
  return {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    overflowX: "hidden",
    pr: 0.25,
    mr: -0.25,
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
  const pad = appearance.densityTokens.panelPaddingPx / 8;
  return {
    border: "none",
    borderRadius: 0,
    p: pad,
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

export function embedTeaserPreviewSx(
  appearance: RuntimeChatAppearance,
): SxProps<Theme> {
  return {
    maxWidth: 280,
    px: 1.5,
    py: 1,
    cursor: "pointer",
    borderRadius: `${Math.max(10, appearance.borderRadiusPx)}px`,
    bgcolor: appearance.chatBox.backgroundColor,
    color: appearance.bodyTextColor,
    fontSize: 13,
    lineHeight: 1.45,
    border: `1px solid ${appearance.colors.inputBorder}`,
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
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
      bgcolor: `${c.handoverBackground} !important`,
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
  const radius = Math.max(12, appearance.borderRadiusPx);
  return {
    borderRadius: `${radius}px`,
    bgcolor: c.panelBackground,
    color: c.bodyText,
    fontFamily: c.fontFamily,
    overflow: "hidden" as const,
    boxShadow: "none",
    border: `1px solid ${c.inputBorder}`,
  };
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

export function embedHandoverButtonSx(appearance: RuntimeChatAppearance): SxProps<Theme> {
  const c = appearance.colors;
  return {
    bgcolor: `${c.handoverBackground} !important`,
    color: `${c.handoverText} !important`,
    border: `1px solid ${c.handoverBorder} !important`,
    borderRadius: `${appearance.borderRadiusPx}px`,
    fontFamily: c.fontFamily,
    fontSize: c.bodyFontSizePx,
    textTransform: "none",
    boxShadow: "none",
    "&:hover": {
      bgcolor: c.handoverBackground,
      borderColor: c.primary,
      color: `${c.handoverText} !important`,
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
    maxWidth: "88%",
    width: "fit-content",
    mb: 0.5,
  };
}

export function embedChatBubbleInnerSx(
  appearance: RuntimeChatAppearance,
  role: "greeting" | "assistant" | "visitor",
): SxProps<Theme> {
  const c = appearance.colors;
  const radius = Math.max(10, appearance.borderRadiusPx);
  const base = {
    px: 1.25,
    py: 0.9,
    fontFamily: c.fontFamily,
    fontSize: c.bodyFontSizePx,
    lineHeight: 1.5,
    wordBreak: "break-word" as const,
    boxShadow: "none",
  };
  if (role === "visitor") {
    return {
      ...base,
      borderRadius: `${radius}px ${radius}px 4px ${radius}px`,
      bgcolor: `${c.outgoingBubbleBg} !important`,
      color: `${c.outgoingBubbleText} !important`,
    };
  }
  if (role === "greeting") {
    return {
      ...base,
      borderRadius: `${radius}px`,
      bgcolor: `${c.greetingBubbleBg} !important`,
      color: `${c.greetingBubbleText} !important`,
    };
  }
  return {
    ...base,
    borderRadius: `${radius}px ${radius}px ${radius}px 4px`,
    bgcolor: `${c.incomingBubbleBg} !important`,
    color: `${c.incomingBubbleText} !important`,
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
