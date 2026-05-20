"use client";

import Box from "@mui/material/Box";
import StorefrontOutlined from "@mui/icons-material/StorefrontOutlined";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { iconGlyphSx } from "@/lib/design-system";

export function EmailLockedResellerBanner({ label }: { label: string }) {
  const theme = useTheme() as AppTheme;
  const name = label.trim() || "Selected reseller";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.25,
        borderRadius: 1.5,
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
        background: theme.app.dashboard.pillBg,
      }}
    >
      <StorefrontOutlined
        sx={{
          ...(iconGlyphSx("sm") as object),
          color: theme.app.dashboard.white80,
          flexShrink: 0,
        }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
          Reseller
        </Typography>
        <Typography variant="medium" fontWeight={600} sx={{ color: theme.app.text.primary }}>
          {name}
        </Typography>
      </Box>
    </Box>
  );
}
