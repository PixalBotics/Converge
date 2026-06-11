"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { ContactPageOutlined as ContactPageOutlinedIcon } from "@mui/icons-material";
import { Typography } from "@/components/common";
import type { AppTheme } from "@/theme/theme";

type Props = {
  title?: string;
  description?: string;
};

export function EmptyPocListState({
  title = "No points of contact yet",
  description = "Complete company setup and save a POC on the child company. Active links will appear here automatically.",
}: Props) {
  const theme = useTheme() as AppTheme;
  return (
    <Box
      sx={{
        py: 6,
        px: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.25,
        borderRadius: 3,
        border: `1px dashed ${theme.app.dashboard.cardBorder}`,
        bgcolor: theme.app.dashboard.overlayLight,
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: theme.app.dashboard.pillBg,
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
        }}
      >
        <ContactPageOutlinedIcon sx={{ fontSize: 26, color: theme.app.dashboard.textMuted }} />
      </Box>
      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, textAlign: "center" }}>
        {title}
      </Typography>
      <Typography
        variant="small"
        sx={{ color: theme.app.dashboard.textMuted, textAlign: "center", maxWidth: 420 }}
      >
        {description}
      </Typography>
    </Box>
  );
}
