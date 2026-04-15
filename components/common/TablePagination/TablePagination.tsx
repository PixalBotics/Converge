"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { resolveSx } from "@/utils/resolveSx";

export interface TablePaginationProps {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  sx?: SxProps<Theme>;
}

export function TablePagination({ page, pageCount, onPageChange, sx }: TablePaginationProps) {
  const theme = useTheme() as AppTheme;
  const app = theme.app;

  const handleChange = (nextPage: number) => {
    if (!onPageChange) return;
    if (nextPage < 1 || nextPage > pageCount) return;
    if (nextPage === page) return;
    onPageChange(nextPage);
  };

  const pages = Array.from({ length: pageCount }, (_, idx) => idx + 1);

  const edgeBtnSx = {
    width: 32,
    height: 32,
    borderRadius: "9999px",
    border: `1px solid ${app.dashboard.cardBorder}`,
    color: app.dashboard.textMuted,
    bgcolor: "transparent",
    "&.Mui-disabled": {
      opacity: 0.4,
      color: app.dashboard.textMuted,
    },
  } as const;

  return (
    <Box
      sx={[
        {
          display: "flex",
          alignItems: "center",
          gap: 0.75,
        },
        resolveSx(sx, theme),
      ] as SxProps<Theme>}
    >
      <IconButton
        size="small"
        onClick={() => handleChange(page - 1)}
        disabled={page <= 1 || !onPageChange}
        sx={edgeBtnSx}
      >
        <ChevronLeft fontSize="small" sx={{ color: "inherit" }} />
      </IconButton>

      {pages.map((p) => {
        const active = p === page;
        return (
          <IconButton
            key={p}
            size="small"
            onClick={() => handleChange(p)}
            disabled={!onPageChange}
            sx={{
              width: 32,
              height: 32,
              borderRadius: "9999px",
              border: `1px solid ${active ? app.dashboard.accentBlue : app.dashboard.cardBorder}`,
              bgcolor: active ? app.dashboard.navActiveBg : "transparent",
              color: active ? app.text.primary : app.dashboard.textMuted,
              fontSize: 13,
              "&.Mui-disabled": {
                opacity: active ? 1 : 0.9,
                cursor: "default",
              },
            }}
          >
            {p}
          </IconButton>
        );
      })}

      <IconButton
        size="small"
        onClick={() => handleChange(page + 1)}
        disabled={page >= pageCount || !onPageChange}
        sx={edgeBtnSx}
      >
        <ChevronRight fontSize="small" sx={{ color: "inherit" }} />
      </IconButton>
    </Box>
  );
}
