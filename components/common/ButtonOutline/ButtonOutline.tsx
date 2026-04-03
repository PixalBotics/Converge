"use client";

import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "../Typography";

export interface ButtonOutlineProps {
  text: string;
  dotColor?: string;
  sx?: SxProps<Theme>;
}

export function ButtonOutline({ text, dotColor, sx }: ButtonOutlineProps) {
  const th = useTheme() as AppTheme;
  const ink = th.palette.text.primary;
  return (
    <Box
      sx={[
        {
          px: 2.5,
          py: 1,
          borderRadius: "80px",
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          background: alpha(ink, th.palette.mode === "dark" ? 0.08 : 0.06),
          backdropFilter: "blur(10px) saturate(150%)",
          WebkitBackdropFilter: "blur(10px) saturate(150%)",
          border: `1px solid ${alpha(ink, 0.16)}`,
          boxShadow: `inset 0 1px 0 ${alpha(ink, 0.08)}, 0 4px 20px rgba(0,0,0,${th.palette.mode === "dark" ? 0.22 : 0.08})`,
          transition: "border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease",
          "&:hover": {
            borderColor: alpha(th.palette.primary.main, 0.35),
            backgroundColor: alpha(th.palette.primary.main, th.palette.mode === "dark" ? 0.1 : 0.06),
          },
        },
        ...(sx ? (Array.isArray(sx) ? sx : [sx]) : []),
      ]}
    >
      {dotColor && (
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: dotColor,
          }}
        />
      )}
      <Typography
        sx={{
          color: "text.primary",
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: 1.2,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
