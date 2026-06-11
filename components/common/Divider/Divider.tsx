"use client";

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";

export interface DividerProps {
  sx?: SxProps<Theme>;
}

export function Divider({ sx }: DividerProps) {
  return (
    <Box
      sx={{
        borderBottom: "0.5px solid #838080",
        my: 1.5,
        width: "100%",
        ...((sx as object) ?? {}),
      }}
    />
  );
}
