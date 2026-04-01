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
  width: "100%",
  borderCollapse: "collapse",
  "& th, & td": {
    borderColor: "rgba(255,255,255,0.08)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    textAlign: "left",
    padding: "10px 16px",
    whiteSpace: "nowrap",
  },
};

export const dataTableHeaderCell: SxProps<Theme> = {
  color: "rgba(255,255,255,0.8)",
  fontWeight: 600,
  fontSize: 18,
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
