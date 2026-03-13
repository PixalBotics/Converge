"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";

export interface TablePaginationProps {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  sx?: SxProps<Theme>;
}

export function TablePagination({ page, pageCount, onPageChange, sx }: TablePaginationProps) {
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
          border: "1px solid rgba(148,163,184,0.5)",
          color: "rgba(148,163,184,0.9)",
          bgcolor: "transparent",
          "&.Mui-disabled": {
            opacity: 0.4,
            color: "rgba(148,163,184,0.6)",
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
            border: "1px solid rgba(148,163,184,0.5)",
            bgcolor: p === page ? "rgba(79,70,229,0.9)" : "transparent",
            color: p === page ? "white" : "rgba(148,163,184,0.9)",
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
          border: "1px solid rgba(148,163,184,0.5)",
          color: "rgba(148,163,184,0.9)",
          bgcolor: "transparent",
          "&.Mui-disabled": {
            opacity: 0.4,
            color: "rgba(148,163,184,0.6)",
          },
        }}
      >
        <ChevronRight fontSize="small" />
      </IconButton>
    </Box>
  );
}

