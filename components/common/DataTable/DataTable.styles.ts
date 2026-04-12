import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

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
  const app = (theme as AppTheme).app;
  const b = app.dashboard.cardBorder;
  return {
    width: "100%",
    borderCollapse: "collapse",
    "& th, & td": {
      borderColor: b,
      borderBottom: `1px solid ${b}`,
      textAlign: "left",
      padding: "10px 16px",
      whiteSpace: "nowrap",
    },
  };
};

export const dataTableHeaderCell: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.white80,
  fontWeight: 600,
  fontSize: 18,
});

export const dataTableCellDefault: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.text.primary,
});

export const dataTableCellMuted: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.white7,
});

export const dataTableActionButton: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.white60,
});
