"use client";

import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import type { RuntimeBannerAppearance, RuntimeChatAppearance } from "@/lib/widget-runtime/widget-runtime-appearance";
import { embedBodyTextSx, embedMutedTextSx } from "@/lib/widget-runtime/embed-theme-sx";

export function EmbedWidgetBanner({
  banner,
  appearance,
}: {
  banner: RuntimeBannerAppearance;
  appearance: RuntimeChatAppearance;
}) {
  if (!banner.enabled) return null;

  return (
    <Box
      sx={{
        mb: 1.5,
        borderRadius: `${appearance.borderRadiusPx}px`,
        overflow: "hidden",
        border: `1px solid ${appearance.colors.inputBorder}`,
        bgcolor: appearance.chatBox.backgroundColor,
      }}
    >
      {banner.mediaType === "video" && banner.videoUrl ? (
        <Box
          component="video"
          src={banner.videoUrl}
          controls
          playsInline
          muted
          sx={{ width: "100%", maxHeight: 160, display: "block", bgcolor: "#000" }}
        />
      ) : banner.imageUrl ? (
        <Box
          component="img"
          src={banner.imageUrl}
          alt={banner.title || "Promotional banner"}
          sx={{ width: "100%", maxHeight: 120, objectFit: "cover", display: "block" }}
        />
      ) : null}
      {(banner.title || banner.description) && (
        <Box sx={{ px: 1.25, py: 1 }}>
          {banner.title ? (
            <Typography variant="subtitle2" sx={{ ...embedBodyTextSx(appearance), fontWeight: 700 }}>
              {banner.title}
            </Typography>
          ) : null}
          {banner.description ? (
            <Typography variant="body2" sx={embedMutedTextSx(appearance)}>
              {banner.description}
            </Typography>
          ) : null}
        </Box>
      )}
    </Box>
  );
}
