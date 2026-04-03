"use client";

import type { SxProps, Theme } from "@mui/material/styles";
import { Box } from "@mui/material";

interface WebsiteAssignIconProps {
  sx?: SxProps<Theme>;
  width?: number;
  height?: number;
}

export function WebsiteAssignIcon({ sx, width = 24, height = 24 }: WebsiteAssignIconProps) {
  const clipId = "clip0_website_assign";
  return (
    <Box
      component="svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      sx={sx}
    >
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M1.7695 19.8715C1.8735 21.149 2.851 22.1265 4.1285 22.2305C5.7425 22.3615 8.318 22.5 12 22.5C15.682 22.5 18.2575 22.3615 19.8715 22.2305C21.149 22.1265 22.1265 21.149 22.2305 19.8715C22.3615 18.2575 22.5 15.682 22.5 12C22.5 8.318 22.3615 5.7425 22.2305 4.1285C22.1265 2.851 21.149 1.8735 19.8715 1.7695C18.2575 1.6385 15.682 1.5 12 1.5C8.318 1.5 5.7425 1.6385 4.1285 1.7695C2.851 1.8735 1.8735 2.851 1.7695 4.1285C1.6385 5.7425 1.5 8.318 1.5 12C1.5 15.682 1.6385 18.2575 1.7695 19.8715Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M1.75 6.75H22.25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M5 4.25H6M9 4.25H10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </Box>
  );
}
