"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { SocialUiPlatform } from "../social-media.constants";
import { SOCIAL_PLATFORMS } from "../social-media.constants";
import { getSocialPlatformMeta } from "../social-platform-meta";
import { socialPlatformCardSx, socialPlatformGridSx } from "../styles/social-wizard-ui.styles";
import { SocialMediaPlatformLogo } from "./SocialMediaPlatformLogo";

export type SocialMediaPlatformPickerProps = {
  value: SocialUiPlatform | "";
  onChange: (platform: SocialUiPlatform) => void;
};

export function SocialMediaPlatformPicker({ value, onChange }: SocialMediaPlatformPickerProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={socialPlatformGridSx}>
      {SOCIAL_PLATFORMS.map((platform) => {
        const selected = value === platform;
        const meta = getSocialPlatformMeta(platform);
        if (!meta) return null;

        return (
          <Box
            key={platform}
            component="button"
            type="button"
            onClick={() => onChange(platform)}
            aria-pressed={selected}
            sx={socialPlatformCardSx(selected)}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <SocialMediaPlatformLogo platform={platform} size={48} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="medium" fontWeight={700} color="white">
                  {meta.name}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                  {meta.subtitle}
                </Typography>
                {selected ? (
                  <Chip
                    label="Selected"
                    size="small"
                    sx={{
                      mt: 0.5,
                      height: 22,
                      fontSize: 11,
                      fontWeight: 600,
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      color: theme.palette.primary.light,
                    }}
                  />
                ) : null}
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
              {meta.blurb}
            </Typography>
            {!meta.oauthSupported ? (
              <Chip
                label="Manual setup"
                size="small"
                sx={{
                  alignSelf: "flex-start",
                  height: 22,
                  fontSize: 11,
                  fontWeight: 600,
                  bgcolor: alpha(theme.palette.warning.main, 0.16),
                  color: theme.palette.warning.light,
                }}
              />
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
}
