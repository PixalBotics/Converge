"use client";

import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { EmbedVideoWelcome } from "@/components/embed/EmbedVideoWelcome";
import { EmbedWidgetBanner } from "@/components/embed/EmbedWidgetBanner";
import type { RuntimeChatAppearance } from "@/lib/widget-runtime/widget-runtime-appearance";
import {
  embedPrechatFormBubbleInnerSx,
  embedPrechatFormBubbleShellSx,
} from "@/lib/widget-runtime/embed-theme-sx";

/** Video / banner inside chat transcript — same full-width bubble as pre-chat form. */
export function EmbedChatMediaBubble({
  appearance,
  children,
}: {
  appearance: RuntimeChatAppearance;
  children: ReactNode;
}) {
  if (children === null || children === undefined) return null;

  return (
    <Box sx={embedPrechatFormBubbleShellSx()}>
      <Box
        sx={{
          ...embedPrechatFormBubbleInnerSx(appearance),
          width: "100%",
          maxWidth: "100%",
          p: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function hasEmbedBannerContent(appearance: RuntimeChatAppearance): boolean {
  const banner = appearance.banner;
  if (!banner.enabled) return false;
  const hasMedia = Boolean(
    (banner.mediaType === "video" && banner.videoUrl) || banner.imageUrl,
  );
  return hasMedia || Boolean(banner.title?.trim()) || Boolean(banner.description?.trim());
}

export function EmbedChatVideoBubble({
  appearance,
}: {
  appearance: RuntimeChatAppearance;
}) {
  if (!appearance.videoWelcome.enabled || !appearance.videoWelcome.url.trim()) {
    return null;
  }
  return (
    <EmbedChatMediaBubble appearance={appearance}>
      <EmbedVideoWelcome appearance={appearance} inset />
    </EmbedChatMediaBubble>
  );
}

export function EmbedChatBannerBubble({
  appearance,
  compact = false,
}: {
  appearance: RuntimeChatAppearance;
  compact?: boolean;
}) {
  if (!hasEmbedBannerContent(appearance)) return null;
  return (
    <EmbedChatMediaBubble appearance={appearance}>
      <EmbedWidgetBanner
        banner={appearance.banner}
        appearance={appearance}
        compact={compact}
        inset
      />
    </EmbedChatMediaBubble>
  );
}

/** Video welcome + promo banner as incoming chat bubbles (pre-chat / live transcript). */
export function EmbedChatMediaBubbles({
  appearance,
  compact = false,
}: {
  appearance: RuntimeChatAppearance;
  compact?: boolean;
}) {
  return (
    <>
      <EmbedChatVideoBubble appearance={appearance} />
      <EmbedChatBannerBubble appearance={appearance} compact={compact} />
    </>
  );
}
