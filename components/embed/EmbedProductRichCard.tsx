"use client";

import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { Typography } from "@/components/common";
import { ChatFormattedMessage } from "@/lib/safe-markdown/ChatFormattedMessage";
import type { RuntimeChatAppearance } from "@/lib/widget-runtime/widget-runtime-appearance";
import type { VisitorAiRichCard } from "@/services/chat/chat.types";

export function EmbedProductRichCard({
  card,
  text,
  appearance,
}: {
  card: VisitorAiRichCard;
  text: string;
  appearance?: RuntimeChatAppearance;
}) {
  const primary = appearance?.colors.primary ?? "#2563eb";
  const borderColor = appearance?.colors.inputBorder ?? "divider";
  const panelBg = appearance?.colors.panelBackground ?? "background.paper";

  return (
    <Stack spacing={1} sx={{ width: "100%", maxWidth: 320 }}>
      {text.trim() ? (
        <ChatFormattedMessage text={text} linkColor={primary} />
      ) : null}

      <Box
        sx={{
          borderRadius: 2,
          border: 1,
          borderColor,
          overflow: "hidden",
          bgcolor: panelBg,
        }}
      >
        {card.imageUrl ? (
          <Box
            component="img"
            src={card.imageUrl}
            alt={card.title}
            loading="lazy"
            sx={{
              display: "block",
              width: "100%",
              maxHeight: 160,
              objectFit: "cover",
              bgcolor: "action.hover",
            }}
          />
        ) : null}

        <Stack spacing={0.75} sx={{ p: 1.25 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.3 }}>
            {card.title}
          </Typography>

          {card.price ? (
            <Typography variant="body2" fontWeight={600} sx={{ color: primary }}>
              {card.price}
            </Typography>
          ) : null}

          {card.brand ? (
            <Typography variant="caption" color="text.secondary">
              {card.brand}
            </Typography>
          ) : null}

          {card.description ? (
            <Box
              sx={{
                maxHeight: 140,
                overflowY: "auto",
                pr: 0.5,
                "&::-webkit-scrollbar": { width: 4 },
                "&::-webkit-scrollbar-thumb": {
                  borderRadius: 4,
                  bgcolor: "action.disabled",
                },
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", whiteSpace: "pre-wrap", lineHeight: 1.45 }}
              >
                {card.description}
              </Typography>
            </Box>
          ) : null}

          {card.linkUrl ? (
            <Link
              href={card.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: primary,
              }}
            >
              View details
              <OpenInNewRounded sx={{ fontSize: 14 }} />
            </Link>
          ) : null}
        </Stack>
      </Box>
    </Stack>
  );
}

function readRichCard(metadata?: Record<string, unknown>): VisitorAiRichCard | null {
  if (!metadata) return null;
  const raw = metadata.richCard;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const card = raw as Record<string, unknown>;
  const title = typeof card.title === "string" ? card.title.trim() : "";
  if (!title) return null;
  return {
    title,
    ...(typeof card.description === "string" && card.description.trim()
      ? { description: card.description.trim() }
      : {}),
    ...(typeof card.imageUrl === "string" && card.imageUrl.trim()
      ? { imageUrl: card.imageUrl.trim() }
      : {}),
    ...(typeof card.linkUrl === "string" && card.linkUrl.trim()
      ? { linkUrl: card.linkUrl.trim() }
      : {}),
    ...(typeof card.price === "string" && card.price.trim()
      ? { price: card.price.trim() }
      : {}),
    ...(typeof card.brand === "string" && card.brand.trim()
      ? { brand: card.brand.trim() }
      : {}),
  };
}

export function readMessageRichCard(
  metadata?: Record<string, unknown>,
): VisitorAiRichCard | null {
  return readRichCard(metadata);
}

export function isRichCardMessage(metadata?: Record<string, unknown>): boolean {
  const mt =
    typeof metadata?.messageType === "string" ? metadata.messageType : "";
  return mt === "rich_card" || readRichCard(metadata) != null;
}
