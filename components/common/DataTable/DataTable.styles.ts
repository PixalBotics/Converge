import type { SxProps, Theme } from "@mui/material/styles";

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
