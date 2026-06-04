"use client";

import { Typography } from "@/components/common";
import type { SxProps, Theme } from "@mui/material/styles";
import { resolveWebsiteRowUrlLabels } from "@/lib/websites/format-website-display-url";

type WebsiteUrlDisplayProps = {
  name?: string | null;
  url?: string | null;
  primaryVariant?: "body2" | "medium";
  sx?: SxProps<Theme>;
  mutedSx?: SxProps<Theme>;
};

/** Primary name + optional shortened URL (full URL in native tooltip). */
export function WebsiteUrlDisplay({
  name,
  url,
  primaryVariant = "body2",
  sx,
  mutedSx,
}: WebsiteUrlDisplayProps) {
  const { primary, secondary, full } = resolveWebsiteRowUrlLabels(name, url);
  const showTooltip = full !== "—" && full.length > (secondary ?? primary).length;

  return (
    <Typography
      component="span"
      sx={{ display: "flex", flexDirection: "column", gap: 0.35, minWidth: 0, ...sx }}
    >
      <Typography
        component="span"
        variant={primaryVariant}
        fontWeight={600}
        title={showTooltip && !secondary ? full : undefined}
        sx={{ color: "inherit", wordBreak: "break-word" }}
      >
        {primary}
      </Typography>
      {secondary ? (
        <Typography
          component="span"
          variant="caption"
          title={showTooltip ? full : undefined}
          sx={{
            color: "inherit",
            opacity: 0.72,
            wordBreak: "break-all",
            lineHeight: 1.45,
            ...mutedSx,
          }}
        >
          {secondary}
        </Typography>
      ) : null}
    </Typography>
  );
}
