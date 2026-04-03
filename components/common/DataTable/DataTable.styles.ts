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

export const dataTableRoot: SxProps<Theme> = (theme) => {
  const line = theme.app.dashboard.cardBorder;
  return {
    width: "100%",
    borderCollapse: "collapse",
    "& th, & td": {
      borderColor: line,
      borderBottom: `1px solid ${line}`,
      textAlign: "left",
      padding: "10px 16px",
      whiteSpace: "nowrap",
    },
  };
};

export const dataTableHeaderCell: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.secondary,
  fontWeight: 600,
  fontSize: 18,
});

export const dataTableCellDefault: SxProps<Theme> = (theme) => ({
  color: theme.palette.text.primary,
});

export const dataTableCellMuted: SxProps<Theme> = (theme) => ({
  color: theme.app.dashboard.textMuted,
});

export const dataTableActionButton: SxProps<Theme> = (theme) => ({
  color: theme.app.text.iconMuted,
});
