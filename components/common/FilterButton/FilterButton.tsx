"use client";

import { Button } from "@/components/common/Button";
import type { SxProps, Theme } from "@mui/material/styles";
import { FilterList as FilterListIcon } from "@mui/icons-material";
import { Typography } from "@/components/common";

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
      <FilterListIcon sx={{ fontSize: 18 }} />
      <Typography component="span" variant="medium" color="inherit">
        Filter
      </Typography>
    </Button>
  );
}

