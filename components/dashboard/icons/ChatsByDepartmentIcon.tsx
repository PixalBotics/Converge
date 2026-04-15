"use client";

import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";

interface ChatsByDepartmentIconProps {
  sx?: SxProps<Theme>;
  width?: number;
  height?: number;
}

/** Rounded dark purple square, light lavender circle, white $ — for Chats by Department card */
export function ChatsByDepartmentIcon({ sx, width = 40, height = 40 }: ChatsByDepartmentIconProps) {
  return (
    <Box sx={sx} component="span" display="inline-flex">
      <svg
        width={width}
        height={height}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
      <rect
        x="0"
        y="0"
        width="40"
        height="40"
        rx="12"
        fill="#3A3258"
      />
      <circle
        cx="20"
        cy="20"
        r="12"
        fill="#B8A9E0"
      />
      <text
        x="20"
        y="25"
        textAnchor="middle"
        fill="white"
        fontSize="18"
        fontWeight="600"
        fontFamily="sans-serif"
      >
        $
      </text>
    </svg>
    </Box>
  );
}
