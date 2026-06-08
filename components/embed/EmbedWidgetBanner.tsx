"use client";

import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import type { RuntimeBannerAppearance, RuntimeChatAppearance } from "@/lib/widget-runtime/widget-runtime-appearance";
import { embedBodyTextSx, embedMutedTextSx } from "@/lib/widget-runtime/embed-theme-sx";

export function EmbedWidgetBanner({
  banner,
  appearance,
  compact = false,
  inset = false,
}: {
  banner: RuntimeBannerAppearance;
  appearance: RuntimeChatAppearance;
  /** Smaller media when stacked in chat. */
  compact?: boolean;
  /** Inside chat bubble — no outer margin/border. */
  inset?: boolean;
}) {
  if (!banner.enabled) return null;

  const hasMedia = Boolean(
    (banner.mediaType === "video" && banner.videoUrl) || banner.imageUrl,
  );
  if (!hasMedia && !banner.title?.trim() && !banner.description?.trim()) {
    return null;
  }

  return (
    <Box
      sx={{
        mb: inset ? 0 : compact ? 1 : 1.5,
        borderRadius: `${appearance.borderRadiusPx}px`,
        overflow: "hidden",
        border: inset ? "none" : `1px solid ${appearance.colors.inputBorder}`,
        bgcolor: inset ? "transparent" : appearance.chatBox.backgroundColor,
        width: "100%",
      }}
    >
      {banner.mediaType === "video" && banner.videoUrl ? (
        <Box
          component="video"
          src={banner.videoUrl}
          controls
          playsInline
          muted
          sx={{
            width: "100%",
            maxHeight: compact ? 100 : 160,
            display: "block",
            bgcolor: "#000",
          }}
        />
      ) : banner.imageUrl ? (
        <Box
          component="img"
          src={banner.imageUrl}
          alt={banner.title || "Promotional banner"}
          sx={{
            width: "100%",
            maxHeight: compact ? 72 : 120,
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : null}
      {(banner.title?.trim() || banner.description?.trim()) && (
        <Box sx={{ px: 1.25, py: 1 }}>
          {banner.title?.trim() ? (
            <Typography variant="subtitle2" sx={{ ...embedBodyTextSx(appearance), fontWeight: 700 }}>
              {banner.title.trim()}
            </Typography>
          ) : null}
          {banner.description?.trim() ? (
            <Typography variant="body2" sx={embedMutedTextSx(appearance)}>
              {banner.description.trim()}
            </Typography>
          ) : null}
        </Box>
      )}
    </Box>
  );
}
