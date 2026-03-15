import type { SxProps, Theme } from "@mui/material/styles";

/** TableContainer: scroll enabled, scrollbar hidden (webkit + Firefox/IE) */
export const dataTableContainer: SxProps<Theme> = {
  overflowX: "auto",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": { display: "none" },
};

export const dataTableRoot: SxProps<Theme> = {
  "& .MuiTableCell-root": {
    borderColor: "rgba(255,255,255,0.08)",
  },
};

export const dataTableHeaderCell: SxProps<Theme> = {
  color: "rgba(255,255,255,0.8)",
  fontWeight: 600,
};

export const dataTableCellDefault: SxProps<Theme> = {
  color: "white",
};

export const dataTableCellMuted: SxProps<Theme> = {
  color: "rgba(255,255,255,0.7)",
};

export const dataTableActionButton: SxProps<Theme> = {
  color: "rgba(255,255,255,0.6)",
};
