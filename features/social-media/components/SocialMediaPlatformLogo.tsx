"use client";

import Box from "@mui/material/Box";
import type { SocialUiPlatform } from "../social-media.constants";
import { getSocialPlatformMeta } from "../social-platform-meta";
import { socialPlatformIconSx } from "../styles/social-wizard-ui.styles";

export function SocialMediaPlatformLogo({
  platform,
  size = 48,
}: {
  platform: SocialUiPlatform | string;
  size?: number;
}) {
  const meta = getSocialPlatformMeta(platform);
  const accent = meta?.accent ?? "#1877F2";
  const label =
    platform === "whatsapp"
      ? "W"
      : platform === "instagram"
        ? "IG"
        : "f";

  return (
    <Box
      sx={{
        ...socialPlatformIconSx(accent),
        width: size,
        height: size,
        borderRadius: platform === "instagram" ? 2 : platform === "whatsapp" ? 1.75 : "50%",
        background:
          platform === "instagram"
            ? "linear-gradient(135deg, #F58529 0%, #DD2A7B 45%, #8134AF 100%)"
            : undefined,
        bgcolor: platform === "instagram" ? undefined : accent,
        color: "#fff",
        fontSize: platform === "facebook" ? size * 0.42 : size * 0.34,
      }}
      aria-hidden
    >
      {label}
    </Box>
  );
}
