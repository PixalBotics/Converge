"use client";

import type { ReactNode } from "react";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import MessageOutlined from "@mui/icons-material/MessageOutlined";
import ViewAgendaOutlined from "@mui/icons-material/ViewAgendaOutlined";
import RadioButtonChecked from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUnchecked from "@mui/icons-material/RadioButtonUnchecked";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { WidgetKind } from "@/lib/chat-widget/widgetDraft";

const CARD_ITEMS: {
  id: WidgetKind;
  title: string;
  description: string;
  icon: ReactNode;
  iconColor: string;
}[] = [
  {
    id: "chat",
    title: "Chat Widget",
    description: "Live chat launcher, pre-chat form, and agent inbox routing.",
    icon: <ChatBubbleOutline sx={{ fontSize: 18 }} />,
    iconColor: "#7DD3FC",
  },
  {
    id: "text",
    title: "Text Us Widget",
    description: "SMS-style visitor form with your branding and Twilio replies.",
    icon: <MessageOutlined sx={{ fontSize: 18 }} />,
    iconColor: "#FDBA74",
  },
  {
    id: "both",
    title: "Chat + Text Us",
    description: "One embed script — visitors choose chat or Text Us in the same panel.",
    icon: <ViewAgendaOutlined sx={{ fontSize: 18 }} />,
    iconColor: "#C4B5FD",
  },
];

export function WidgetTypeSelectionCards({
  selectedType,
  onSelect,
  disabled,
  allowedKinds,
}: {
  selectedType: WidgetKind;
  onSelect: (kind: WidgetKind) => void;
  disabled?: boolean;
  /** When set, only these widget types are shown (from reseller `chat_widget` / `text_us` modules). */
  allowedKinds?: readonly WidgetKind[];
}) {
  const theme = useTheme() as AppTheme;

  const visibleItems = allowedKinds?.length
    ? CARD_ITEMS.filter((item) => allowedKinds.includes(item.id))
    : CARD_ITEMS;

  if (visibleItems.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
        No widget products are enabled for this reseller. Turn on Chat Widget and/or Text Us under
        Services.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: visibleItems.length === 1 ? "1fr" : visibleItems.length === 2 ? "1fr 1fr" : "1fr 1fr 1fr",
        },
        gap: 1.25,
      }}
    >
      {visibleItems.map((item) => {
        const active = selectedType === item.id;
        return (
          <Box
            key={item.id}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-pressed={active}
            onClick={() => {
              if (disabled) return;
              onSelect(item.id);
            }}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(item.id);
              }
            }}
            sx={{
              borderRadius: 2,
              border: `1px solid ${active ? theme.app.dashboard.accentBlue : theme.app.dashboard.cardBorder}`,
              p: 2.25,
              cursor: disabled ? "not-allowed" : "pointer",
              background: theme.app.dashboard.overlayLight,
              opacity: disabled ? 0.65 : 1,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: item.iconColor,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0B1024",
                }}
              >
                {item.icon}
              </Box>
              {active ? (
                <RadioButtonChecked sx={{ color: theme.app.dashboard.accentBlue, fontSize: 20 }} />
              ) : (
                <RadioButtonUnchecked sx={{ color: theme.app.dashboard.textMuted, fontSize: 20 }} />
              )}
            </Box>
            <Typography variant="mediumLarge" color="white" sx={{ mb: 0.25 }}>
              {item.title}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
              {item.description}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
