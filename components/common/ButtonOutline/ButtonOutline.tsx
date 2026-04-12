"use client";

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { Typography } from "../Typography";

export interface ButtonOutlineProps {
  text: string;
  dotColor?: string;
  sx?: SxProps<Theme>;
}

export function ButtonOutline({ text, dotColor, sx }: ButtonOutlineProps) {
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
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          boxShadow: `
            inset 0 0 6px rgba(255,255,255,0.1),
            0 4px 20px rgba(0,0,0,0.2)
          `,
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
          color: "#fff",
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
