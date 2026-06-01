"use client";

import { useMemo, useState, type ReactNode } from "react";
import ExpandMore from "@mui/icons-material/ExpandMore";
import NotificationsActiveOutlined from "@mui/icons-material/NotificationsActiveOutlined";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { chatSemanticSurface } from "../styles/chat-semantic";
import type { ChatMessage } from "@/services/chat/chat.types";
import {
  transcriptHasCloseFormLink,
  transcriptHasDistributionFormLink,
} from "../utils/inbox-transcript-messages";
import { ChatDistributionLinkBanner } from "./ChatDistributionLinkBanner";

type ContextItem = {
  id: string;
  tone: "info" | "warning" | "muted";
  title: string;
  content: ReactNode;
};

type Props = {
  readOnly?: boolean;
  availabilityHint?: string | null;
  distributionFormHref?: string | null;
  distributionSubmitted?: boolean;
  closeFormHref?: string | null;
  wrapUpSubmitted?: boolean;
  hasConversation: boolean;
  /** Hide duplicate wrap-up banner when the transcript already has the close-form card. */
  messages?: ChatMessage[];
};

export function ChatContextRail({
  readOnly = false,
  availabilityHint = null,
  distributionFormHref = null,
  distributionSubmitted = false,
  closeFormHref = null,
  wrapUpSubmitted = false,
  hasConversation,
  messages = [],
}: Props) {
  const theme = useTheme() as AppTheme;
  const [expanded, setExpanded] = useState(true);

  const items = useMemo((): ContextItem[] => {
    if (!hasConversation) return [];
    const list: ContextItem[] = [];

    if (readOnly) {
      list.push({
        id: "readonly",
        tone: "muted",
        title: "Read-only",
        content: (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 12, lineHeight: 1.45 }}>
            Closed conversation — transcript is read-only. New visitor messages may reopen the chat.
          </Typography>
        ),
      });
    }

    if (readOnly && distributionFormHref) {
      list.push({
        id: "distribution",
        tone: "info",
        title: "Distribution",
        content: (
          <ChatDistributionLinkBanner embedded href={distributionFormHref} submitted={distributionSubmitted} />
        ),
      });
    }

    if (
      readOnly &&
      closeFormHref &&
      !transcriptHasCloseFormLink(messages) &&
      !transcriptHasDistributionFormLink(messages)
    ) {
      list.push({
        id: "close-form",
        tone: "info",
        title: "Wrap-up",
        content: (
          <ChatDistributionLinkBanner
            embedded
            href={closeFormHref}
            submitted={wrapUpSubmitted}
            hint="This chat is closed. Complete the post-close wrap-up form to record disposition and session details."
            buttonLabel="Open wrap-up form"
            submittedHint="Wrap-up has been submitted for this conversation."
          />
        ),
      });
    }

    if (availabilityHint && !readOnly) {
      list.push({
        id: "availability",
        tone: "warning",
        title: "Service window",
        content: (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontSize: 12, lineHeight: 1.45 }}>
            {availabilityHint}
          </Typography>
        ),
      });
    }

    return list;
  }, [
    availabilityHint,
    distributionFormHref,
    distributionSubmitted,
    closeFormHref,
    wrapUpSubmitted,
    hasConversation,
    messages,
    readOnly,
    theme.app.dashboard.textMuted,
  ]);

  if (items.length === 0) return null;

  const railBorder = alpha(theme.app.dashboard.cardBorder, 0.28);

  return (
    <Box
      sx={{
        flexShrink: 0,
        mx: 2,
        mt: 1,
        borderRadius: 2,
        border: `1px solid ${railBorder}`,
        overflow: "hidden",
        bgcolor: alpha(theme.app.dashboard.overlayLight, 0.35),
      }}
    >
      <Accordion
        disableGutters
        expanded={expanded}
        onChange={(_, open) => setExpanded(open)}
        sx={{
          bgcolor: "transparent",
          "&:before": { display: "none" },
          boxShadow: "none",
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore sx={{ color: theme.app.dashboard.textMuted, fontSize: 20 }} />}
          sx={{
            minHeight: 40,
            px: 1.5,
            "& .MuiAccordionSummary-content": { my: 0.5, alignItems: "center", gap: 1 },
          }}
        >
          <NotificationsActiveOutlined sx={{ fontSize: 18, color: theme.app.dashboard.accentBlue }} />
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: theme.app.text.primary }}>
            Context
          </Typography>
          <Box
            component="span"
            sx={{
              ml: 0.5,
              px: 0.85,
              py: 0.15,
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 700,
              bgcolor: alpha(theme.app.dashboard.accentBlue, 0.16),
              color: theme.app.dashboard.accentBlue,
            }}
          >
            {items.length}
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 1.5, pb: 1.5, pt: 0, display: "flex", flexDirection: "column", gap: 1 }}>
          {items.map((item) => {
            const surface = chatSemanticSurface(theme, item.tone);
            return (
              <Box
                key={item.id}
                sx={{
                  borderRadius: 1.5,
                  border: surface.border,
                  bgcolor: surface.bgcolor,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.65,
                    borderBottom: `1px solid ${alpha(surface.accent, 0.2)}`,
                    bgcolor: surface.headerBg,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, fontSize: 11, color: surface.labelColor }}
                  >
                    {item.title}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.25 }}>{item.content}</Box>
              </Box>
            );
          })}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
