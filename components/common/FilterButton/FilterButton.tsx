"use client";

import Box from "@mui/material/Box";
import { Button } from "@/components/common/Button";
import type { SxProps, Theme } from "@mui/material/styles";
import { Typography } from "@/components/common";

function FilterIcon({ sx }: { sx?: SxProps<Theme> }) {
  return (
    <Box component="span" sx={{ display: "inline-flex", lineHeight: 0, ...sx }}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.75 0.75H17.75C18.0152 0.75 18.2696 0.855357 18.4571 1.04289C18.6446 1.23043 18.75 1.48478 18.75 1.75V3.336C18.7499 3.60119 18.6446 3.85551 18.457 4.043L12.043 10.457C11.8555 10.6445 11.7501 10.8988 11.75 11.164V17.469C11.75 17.621 11.7153 17.771 11.6487 17.9076C11.582 18.0442 11.485 18.1638 11.3652 18.2573C11.2454 18.3508 11.1058 18.4158 10.9571 18.4473C10.8084 18.4788 10.6544 18.4759 10.507 18.439L8.507 17.939C8.29075 17.8848 8.09881 17.76 7.96166 17.5842C7.8245 17.4085 7.75001 17.1919 7.75 16.969V11.164C7.74994 10.8988 7.64455 10.6445 7.457 10.457L1.043 4.043C0.855451 3.85551 0.750057 3.60119 0.75 3.336V1.75C0.75 1.48478 0.855357 1.23043 1.04289 1.04289C1.23043 0.855357 1.48478 0.75 1.75 0.75Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
}

interface FilterButtonProps {
  sx?: SxProps<Theme>;
}

export function FilterButton({ sx }: FilterButtonProps) {
  return (
    <Button
      variant="outlined"
      sx={{
        borderRadius: "9999px",
        px: 2.5,
        py: 1.5,
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        borderColor: "#FFFFFF0F",
        color: "#E5E7EB",
        backgroundColor: "#16123F",
        "&:hover": {
          backgroundColor: "#16123F",
          borderColor: "#FFFFFF33",
        },
        ...((sx as object) ?? {}),
      }}
    >
      <FilterIcon sx={{ "& svg": { width: 18, height: 18 } }} />
      <Typography component="span" variant="medium" color="inherit">
        Filter
      </Typography>
    </Button>
  );
}

