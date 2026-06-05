"use client";

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "../Typography/Typography";

/** 14px / 20px — matches dashboard page subtitles and filter helper copy. */
export const filterPanelDescriptionSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    color: t.app.dashboard.textMuted,
    display: "block",
    mt: 0.25,
    fontSize: 14,
    lineHeight: "20px",
  };
};

export type FilterPanelHeaderProps = {
  title: string;
  description?: string;
  sx?: SxProps<Theme>;
};

/** Shared title + helper copy for toolbar filter popovers and filter panels. */
export function FilterPanelHeader({ title, description, sx }: FilterPanelHeaderProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={[{ mb: description ? 1.5 : 1 }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
      <Typography variant="mediumLarge" fontWeight={600} sx={{ color: theme.app.text.primary }}>
        {title}
      </Typography>
      {description ? (
        <Typography variant="medium" sx={filterPanelDescriptionSx}>
          {description}
        </Typography>
      ) : null}
    </Box>
  );
}
