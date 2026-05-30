"use client";

import Box from "@mui/material/Box";
import type { RuntimeChatAppearance } from "@/lib/widget-runtime/widget-runtime-appearance";

function toEmbedVideoSrc(url: string): string | null {
  const raw = url.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();
    if (host === "www.youtube.com" || host === "youtube.com") {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "www.youtube-nocookie.com" || host === "youtube-nocookie.com") {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === "player.vimeo.com") {
      return raw;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (/\.(mp4|webm|ogg)(\?|$)/i.test(u.pathname)) {
      return raw;
    }
  } catch {
    return null;
  }
  return null;
}

export function EmbedVideoWelcome({
  appearance,
  inset = false,
}: {
  appearance: RuntimeChatAppearance;
  /** Inside chat bubble — no outer margin/border (wrapper provides it). */
  inset?: boolean;
}) {
  const { videoWelcome } = appearance;
  if (!videoWelcome.enabled || !videoWelcome.url.trim()) return null;

  const src = toEmbedVideoSrc(videoWelcome.url);
  if (!src) return null;

  const isDirect = /\.(mp4|webm|ogg)(\?|$)/i.test(src);

  return (
    <Box
      sx={{
        mb: inset ? 0 : 1.5,
        borderRadius: `${appearance.borderRadiusPx}px`,
        overflow: "hidden",
        border: inset ? "none" : `1px solid ${appearance.colors.inputBorder}`,
        bgcolor: "#000",
        width: "100%",
      }}
    >
      {isDirect ? (
        <Box
          component="video"
          src={src}
          controls
          playsInline
          sx={{ width: "100%", maxHeight: 200, display: "block" }}
        />
      ) : (
        <Box
          component="iframe"
          src={src}
          title="Welcome video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sx={{ width: "100%", height: 200, border: 0, display: "block" }}
        />
      )}
    </Box>
  );
}
