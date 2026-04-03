"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";

export interface TablePaginationProps {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  sx?: SxProps<Theme>;
}

export function TablePagination({ page, pageCount, onPageChange, sx }: TablePaginationProps) {
  const theme = useTheme();
  const borderColor = alpha(theme.palette.text.secondary, 0.45);
  const idleColor = theme.palette.text.secondary;
  const disabledBorder = alpha(theme.palette.text.secondary, 0.35);

  const handleChange = (nextPage: number) => {
    if (!onPageChange) return;
    if (nextPage < 1 || nextPage > pageCount) return;
    if (nextPage === page) return;
    onPageChange(nextPage);
  };

  const pages = Array.from({ length: pageCount }, (_, idx) => idx + 1);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        ...((sx as object) ?? {}),
      }}
    >
      <IconButton
        size="small"
        onClick={() => handleChange(page - 1)}
        disabled={page <= 1 || !onPageChange}
        sx={{
          width: 32,
          height: 32,
          borderRadius: "9999px",
          border: `1px solid ${borderColor}`,
          color: idleColor,
          bgcolor: "transparent",
          "&.Mui-disabled": {
            opacity: 0.4,
            color: disabledBorder,
          },
        }}
      >
        <ChevronLeft fontSize="small" />
      </IconButton>

      {pages.map((p) => (
        <IconButton
          key={p}
          size="small"
          onClick={() => handleChange(p)}
          disabled={!onPageChange}
          sx={{
            width: 32,
            height: 32,
            borderRadius: "9999px",
            border: `1px solid ${borderColor}`,
            bgcolor: p === page ? theme.palette.primary.main : "transparent",
            color: p === page ? theme.palette.primary.contrastText : idleColor,
            fontSize: 13,
            "&.Mui-disabled": {
              opacity: p === page ? 1 : 0.9,
              cursor: "default",
            },
          }}
        >
          {p}
        </IconButton>
      ))}

      <IconButton
        size="small"
        onClick={() => handleChange(page + 1)}
        disabled={page >= pageCount || !onPageChange}
        sx={{
          width: 32,
          height: 32,
          borderRadius: "9999px",
          border: `1px solid ${borderColor}`,
          color: idleColor,
          bgcolor: "transparent",
          "&.Mui-disabled": {
            opacity: 0.4,
            color: disabledBorder,
          },
        }}
      >
        <ChevronRight fontSize="small" />
      </IconButton>
    </Box>
  );
}

