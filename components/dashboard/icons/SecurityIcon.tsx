"use client";

import type { SxProps, Theme } from "@mui/material/styles";

interface SecurityIconProps {
  sx?: SxProps<Theme>;
  width?: number;
  height?: number;
}

export function SecurityIcon({ sx, width = 24, height = 24 }: SecurityIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      sx={sx}
    >
      <path
        d="M18.709 3.495C16.817 2.554 14.5 2 12 2C9.5 2 7.184 2.554 5.291 3.495C4.363 3.957 3.899 4.188 3.45 4.914C3.001 5.64 3 6.343 3 7.748V11.238C3 16.921 7.542 20.081 10.173 21.434C10.907 21.811 11.273 22 12 22C12.727 22 13.093 21.811 13.827 21.434C16.457 20.08 21 16.92 21 11.237V7.748C21 6.343 21 5.64 20.55 4.914C20.1 4.188 19.637 3.957 18.709 3.495Z"
        stroke="#6769E9"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 9V10M11 9.5C11 9.76522 11.1054 10.0196 11.2929 10.2071C11.4804 10.3946 11.7348 10.5 12 10.5C12.2652 10.5 12.5196 10.3946 12.7071 10.2071C12.8946 10.0196 13 9.76522 13 9.5C13 9.23478 12.8946 8.98043 12.7071 8.79289C12.5196 8.60536 12.2652 8.5 12 8.5C11.7348 8.5 11.4804 8.60536 11.2929 8.79289C11.1054 8.98043 11 9.23478 11 9.5Z"
        stroke="#6769E9"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.75 14H11.25L12 10.5L12.75 14Z"
        stroke="#6769E9"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
