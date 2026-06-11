import type { SxProps, Theme } from "@mui/material/styles";

/** Invoice template 2 — navy wave header/footer design */
export const INVOICE_TWO_NAVY = "#152A47";
export const INVOICE_TWO_NAVY_MID = "#1E3D66";
export const INVOICE_TWO_NAVY_LIGHT = "#2A5082";
export const INVOICE_TWO_TEXT = "#111827";
export const INVOICE_TWO_BORDER = "#C5CED8";

export const invoiceTwoPaperSx: SxProps<Theme> = {
  position: "relative",
  bgcolor: "#FFFFFF",
  color: INVOICE_TWO_TEXT,
  borderRadius: 0,
  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
  maxWidth: 900,
  width: "100%",
  mx: "auto",
  overflow: "hidden",
  fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: 14,
  lineHeight: 1.5,
};

export const invoiceTwoWaveSx: SxProps<Theme> = {
  display: "block",
  width: "100%",
  height: "auto",
  lineHeight: 0,
};

export const invoiceTwoBodySx: SxProps<Theme> = {
  px: { xs: 2.5, sm: 4 },
  pt: { xs: 2, sm: 2.5 },
  pb: { xs: 3, sm: 4 },
};

export const invoiceTwoHeaderRowSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 2,
  flexWrap: "wrap",
  mb: 3,
};

export const invoiceTwoTitleSx: SxProps<Theme> = {
  fontFamily: 'Georgia, "Times New Roman", Times, serif',
  fontWeight: 700,
  fontSize: { xs: 40, sm: 52 },
  letterSpacing: "0.02em",
  color: INVOICE_TWO_TEXT,
  lineHeight: 1,
  mb: 1.5,
};

export const invoiceTwoMetaLineSx: SxProps<Theme> = {
  fontSize: 14,
  color: INVOICE_TWO_TEXT,
  lineHeight: 1.65,
};

export const invoiceTwoLogoImgSx: SxProps<Theme> = {
  display: "block",
  height: 44,
  width: "auto",
  maxWidth: 240,
  mt: 0.5,
};

export const invoiceTwoInfoRowSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
  gap: 3,
  mb: 3,
};

export const invoiceTwoSectionTitleSx: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: INVOICE_TWO_TEXT,
  mb: 1,
};

export const invoiceTwoSectionBodySx: SxProps<Theme> = {
  fontSize: 14,
  color: INVOICE_TWO_TEXT,
  lineHeight: 1.7,
};

export const invoiceTwoTableWrapSx: SxProps<Theme> = {
  border: `1px solid ${INVOICE_TWO_BORDER}`,
  mb: 2.5,
};

export const invoiceTwoTableSx: SxProps<Theme> = {
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed",
  "& th": {
    bgcolor: INVOICE_TWO_NAVY,
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    py: 1.15,
    px: 1.5,
    textAlign: "left",
    borderBottom: `1px solid ${INVOICE_TWO_NAVY}`,
  },
  "& th:nth-of-type(3), & th:nth-of-type(4)": { textAlign: "right" },
  "& td": {
    py: 1.1,
    px: 1.5,
    fontSize: 14,
    color: INVOICE_TWO_TEXT,
    borderBottom: `1px solid ${INVOICE_TWO_BORDER}`,
    verticalAlign: "middle",
  },
  "& tbody tr:last-of-type td": { borderBottom: "none" },
  "& td:nth-of-type(1)": { width: "10%", fontWeight: 600 },
  "& td:nth-of-type(3), & td:nth-of-type(4)": { textAlign: "right" },
};

export const invoiceTwoTotalsWrapSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "flex-end",
  mb: 3,
};

export const invoiceTwoTotalsBoxSx: SxProps<Theme> = {
  width: { xs: "100%", sm: 300 },
  minWidth: 260,
};

export const invoiceTwoSubtotalBoxSx: SxProps<Theme> = {
  border: `1px solid ${INVOICE_TWO_BORDER}`,
  mb: 0,
};

export const invoiceTwoSubtotalRowSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  py: 1,
  px: 1.5,
  fontSize: 14,
  fontWeight: 600,
  color: INVOICE_TWO_TEXT,
  borderBottom: `1px solid ${INVOICE_TWO_BORDER}`,
  "&:last-of-type": { borderBottom: "none" },
};

export const invoiceTwoGrandTotalBarSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  bgcolor: INVOICE_TWO_NAVY,
  color: "#FFFFFF",
  fontWeight: 700,
  fontSize: 14,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  py: 1.15,
  px: 1.5,
};

export const invoiceTwoTermsSx: SxProps<Theme> = {
  fontSize: 13,
  color: INVOICE_TWO_TEXT,
  lineHeight: 1.6,
  maxWidth: 480,
  "& strong": { fontWeight: 700, letterSpacing: "0.03em" },
};

export const invoiceTwoFooterBodySx: SxProps<Theme> = {
  px: { xs: 2.5, sm: 4 },
  pb: { xs: 2.5, sm: 3 },
  pt: 1,
};
