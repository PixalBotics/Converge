import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import type { AppTheme } from "@/theme/theme";

export const emailTableCellTruncateSx: SystemStyleObject<Theme> = {
  display: "block",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: 0,
  maxWidth: "100%",
};

export const emailTablePanelSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    borderRadius: 2,
    border: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.75)}`,
    bgcolor: alpha(t.app.dashboard.overlayLight, 0.28),
    overflow: "hidden",
  };
};

function emailTableBaseSx(theme: Theme): Record<string, unknown> {
  const t = theme as AppTheme;
  return {
    tableLayout: "fixed",
    width: "100%",
    "& th": {
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      color: t.app.dashboard.textMuted,
      py: 1.25,
      px: 1.75,
      whiteSpace: "nowrap",
      overflow: "hidden",
      borderBottom: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.85)}`,
    },
    "& td": {
      fontSize: 14,
      py: 1.4,
      px: 1.75,
      overflow: "hidden",
      verticalAlign: "middle",
      borderBottom: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.55)}`,
    },
    "& tbody tr:hover td": {
      bgcolor: alpha(t.palette.primary.main, 0.05),
    },
    "& th:last-of-type, & td:last-of-type": {
      width: 112,
      minWidth: 112,
      maxWidth: 112,
      textAlign: "right",
      overflow: "visible",
      whiteSpace: "nowrap",
    },
  };
}

export const emailAssignmentsTableSx: SxProps<Theme> = (theme) => ({
  ...emailTableBaseSx(theme),
  "& th:nth-of-type(1), & td:nth-of-type(1)": { width: "14%", minWidth: 128 },
  "& th:nth-of-type(2), & td:nth-of-type(2)": { width: "11%", minWidth: 96 },
  "& th:nth-of-type(3), & td:nth-of-type(3)": { width: "34%", minWidth: 220 },
  "& th:nth-of-type(4), & td:nth-of-type(4)": {
    width: 104,
    minWidth: 104,
    maxWidth: 112,
    overflow: "visible",
    whiteSpace: "nowrap",
  },
  "& th:nth-of-type(5), & td:nth-of-type(5)": {
    width: "17%",
    minWidth: 148,
    whiteSpace: "normal",
    wordBreak: "break-word",
  },
});

export const emailResellerMailTableSx: SxProps<Theme> = (theme) => ({
  ...emailTableBaseSx(theme),
  "& th:nth-of-type(1), & td:nth-of-type(1)": { width: "18%", minWidth: 140 },
  "& th:nth-of-type(2), & td:nth-of-type(2)": { width: "14%", minWidth: 110 },
  "& th:nth-of-type(3), & td:nth-of-type(3)": { width: "42%", minWidth: 220 },
  "& th:nth-of-type(4), & td:nth-of-type(4)": {
    width: 104,
    minWidth: 104,
    maxWidth: 112,
    overflow: "visible",
    whiteSpace: "nowrap",
  },
});

export const emailPlatformDesignSummaryTableSx: SxProps<Theme> = (theme) => ({
  ...emailTableBaseSx(theme),
  "& th:nth-of-type(1), & td:nth-of-type(1)": { width: "42%", minWidth: 220 },
  "& th:nth-of-type(2), & td:nth-of-type(2)": {
    width: 120,
    minWidth: 120,
    maxWidth: 132,
    overflow: "visible",
  },
  "& th:nth-of-type(3), & td:nth-of-type(3)": { width: "28%", minWidth: 160 },
});

/** Platform SMTP/API singleton summary — 5 data columns + actions. */
export const emailPlatformMailSummaryTableSx: SxProps<Theme> = (theme) => ({
  ...emailTableBaseSx(theme),
  "& th:nth-of-type(1), & td:nth-of-type(1)": { width: "12%", minWidth: 96 },
  "& th:nth-of-type(2), & td:nth-of-type(2)": { width: "24%", minWidth: 180 },
  "& th:nth-of-type(3), & td:nth-of-type(3)": { width: "18%", minWidth: 120 },
  "& th:nth-of-type(4), & td:nth-of-type(4)": {
    width: 104,
    minWidth: 104,
    maxWidth: 112,
    overflow: "visible",
    whiteSpace: "nowrap",
  },
  "& th:nth-of-type(5), & td:nth-of-type(5)": {
    width: "22%",
    minWidth: 160,
    whiteSpace: "normal",
    wordBreak: "break-word",
  },
});

/** @deprecated use emailPlatformDesignSummaryTableSx or emailPlatformMailSummaryTableSx */
export const emailPlatformSummaryTableSx = emailPlatformDesignSummaryTableSx;

export const emailDesignCatalogTableSx: SxProps<Theme> = (theme) => ({
  ...emailTableBaseSx(theme),
  "& th:nth-of-type(1), & td:nth-of-type(1)": { width: "28%", minWidth: 160 },
  "& th:nth-of-type(2), & td:nth-of-type(2)": {
    width: 148,
    minWidth: 148,
    maxWidth: 168,
    overflow: "visible",
  },
  "& th:nth-of-type(3), & td:nth-of-type(3)": { width: "26%", minWidth: 160 },
});
