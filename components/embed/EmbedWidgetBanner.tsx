"use client";

import Box from "@mui/material/Box";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import { Typography } from "@/components/common";
import type { RuntimeBannerAppearance, RuntimeChatAppearance } from "@/lib/widget-runtime/widget-runtime-appearance";
import { embedBodyTextSx, embedMutedTextSx } from "@/lib/widget-runtime/embed-theme-sx";
import { resolveBannerMediaSx } from "@/lib/chat-widget/banner-media-height";

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
  const hasCta = Boolean(banner.ctaLabel?.trim() && banner.ctaHref?.trim());
  if (!hasMedia && !banner.title?.trim() && !hasCta) {
    return null;
  }

  const mediaHeight = banner.heightPx > 0 ? banner.heightPx : 0;
  const mediaSx = resolveBannerMediaSx(mediaHeight, {
    compact,
    bgcolor: banner.mediaType === "video" ? "#000" : undefined,
  });

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
          sx={mediaSx}
        />
      ) : banner.imageUrl ? (
        <Box
          component="img"
          src={banner.imageUrl}
          alt={banner.title || "Promotional banner"}
          sx={mediaSx}
        />
      ) : null}
      {(banner.title?.trim() || hasCta) && (
        <Box sx={{ px: 1.25, py: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
          {banner.title?.trim() ? (
            <Typography variant="subtitle2" sx={{ ...embedBodyTextSx(appearance), fontWeight: 700 }}>
              {banner.title.trim()}
            </Typography>
          ) : null}
          {hasCta ? (
            <Box
              component="a"
              href={banner.ctaHref.trim()}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                alignSelf: "flex-start",
                px: 1.25,
                py: 0.55,
                borderRadius: `${Math.max(6, appearance.borderRadiusPx - 2)}px`,
                bgcolor: appearance.colors.primary,
                color: "#fff",
                fontWeight: 700,
                fontSize: appearance.colors.bodyFontSizePx,
                fontFamily: appearance.colors.fontFamily,
                textDecoration: "none",
                "&:hover": { opacity: 0.92 },
              }}
            >
              {banner.ctaLabel.trim()}
              <OpenInNewRounded sx={{ fontSize: 16 }} />
            </Box>
          ) : null}
        </Box>
      )}
    </Box>
  );
}
