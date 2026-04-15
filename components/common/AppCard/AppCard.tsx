"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useTheme } from "@mui/material/styles";
import { cardContentStyles, cardStyles } from "./AppCard.styles";
import type { AppCardProps } from "./AppCard.types";

export function AppCard({
  children,
  maxWidth = 440,
  elevation,
  sx = {},
}: AppCardProps) {
  const theme = useTheme();
  return (
    <Card
      {...(elevation !== undefined ? { elevation } : {})}
      sx={{ ...cardStyles(theme), maxWidth, ...sx }}
    >
      <CardContent sx={cardContentStyles}>{children}</CardContent>
    </Card>
  );
}
