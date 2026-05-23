import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

/** TableContainer: scroll enabled, scrollbar hidden (webkit + Firefox/IE) */
export const dataTableContainer: SxProps<Theme> = {
  overflowX: "auto",
  overflowY: "auto",
  boxShadow: "none",
  WebkitOverflowScrolling: "touch",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": { display: "none" },
};

/** No vertical scroll region — parent (e.g. `FormModal` with `fitContent`) scrolls; wide tables still pan horizontally. */
export const dataTableContainerHorizontalOnly: SxProps<Theme> = {
  overflowX: "auto",
  overflowY: "visible",
  boxShadow: "none",
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
    boxShadow: "none",
    "& th, & td": {
      borderColor: b,
      borderBottom: `1px solid ${b}`,
      textAlign: "left",
      verticalAlign: "middle",
      padding: "10px 16px",
      whiteSpace: "nowrap",
    },
  };
};

export const dataTableHeaderCell: SxProps<Theme> = (theme) => ({
  color:
    theme.palette.mode === "light"
      ? (theme as AppTheme).app.text.primary
      : (theme as AppTheme).app.dashboard.white80,
  fontWeight: 600,
  fontSize: 18,
});

export const dataTableCellDefault: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.text.primary,
});

export const dataTableCellMuted: SxProps<Theme> = (theme) => ({
  color:
    theme.palette.mode === "light"
      ? (theme as AppTheme).app.text.primary
      : (theme as AppTheme).app.text.primary,
});

export const dataTableActionButton: SxProps<Theme> = (theme) => ({
  color:
    theme.palette.mode === "light"
      ? (theme as AppTheme).app.text.primary
      : (theme as AppTheme).app.dashboard.white60,
});
