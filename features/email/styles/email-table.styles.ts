import type { SxProps, Theme } from "@mui/material/styles";

export const emailAssignmentsTableSx: SxProps<Theme> = {
  tableLayout: "fixed",
  "& th:last-of-type, & td:last-of-type": {
    width: 96,
    textAlign: "right",
  },
};

export const emailResellerMailTableSx: SxProps<Theme> = {
  tableLayout: "fixed",
  "& th:last-of-type, & td:last-of-type": {
    width: 96,
    textAlign: "right",
  },
};

export const emailPlatformSummaryTableSx: SxProps<Theme> = {
  tableLayout: "fixed",
  "& th:last-of-type, & td:last-of-type": {
    width: 72,
    textAlign: "right",
  },
};
