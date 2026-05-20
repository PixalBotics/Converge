import type { CSSProperties } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ChatParticipantRole } from "@/services/chat/chat.types";
import type { RuntimeChatAppearance } from "./widget-runtime-appearance";

/**
 * Published `chat.colors` only defines incoming/outgoing bubbles.
 * Agent + legacy `system` AI lines both use incoming tokens.
 */
export function resolveEmbedMessageBubbleRole(
  role: ChatParticipantRole,
): "visitor" | "assistant" {
  if (role === "visitor") return "visitor";
  return "assistant";
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
  return {
    borderRadius: `${appearance.borderRadiusPx}px`,
    bgcolor: c.panelBackground,
    color: c.bodyText,
    fontFamily: c.fontFamily,
    overflow: "hidden" as const,
  };
}

export function embedInputFieldSx(appearance: RuntimeChatAppearance): SxProps<Theme> {
  const c = appearance.colors;
  const radius = Math.max(6, appearance.borderRadiusPx - 2);
  return {
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

export function embedGreetingBubbleSx(appearance: RuntimeChatAppearance): SxProps<Theme> {
  const c = appearance.colors;
  return {
    bgcolor: c.greetingBubbleBg,
    color: `${c.greetingBubbleText} !important`,
  };
}

export function embedIconButtonAccentSx(appearance: RuntimeChatAppearance): SxProps<Theme> {
  const c = appearance.colors;
  return {
    color: `${c.primary} !important`,
    "&:hover": { bgcolor: `${c.primary}14` },
  };
}

/** Composer send control — `chat.colors.button` + `outgoingMessageText`. */
export function embedSendButtonSx(appearance: RuntimeChatAppearance): SxProps<Theme> {
  const c = appearance.colors;
  return {
    bgcolor: c.primary,
    color: c.outgoingBubbleText,
    borderRadius: "50%",
    "&:hover": {
      bgcolor: appearance.launcher.buttonHoverColor,
      color: c.outgoingBubbleText,
    },
  };
}
