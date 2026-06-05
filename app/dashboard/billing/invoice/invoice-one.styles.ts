import type { SxProps, Theme } from "@mui/material/styles";

/** Invoice template 1 — light blue table design */
export const INVOICE_BLUE = "#3B8FD9";
export const INVOICE_BLUE_LIGHT = "#EAF4FC";
export const INVOICE_TEXT = "#1A1A1A";
export const INVOICE_MUTED = "#6B7280";
export const INVOICE_TERMS = "#9CA3AF";

export const invoiceOnePaperSx: SxProps<Theme> = {
  bgcolor: "#FFFFFF",
  color: INVOICE_TEXT,
  borderRadius: 0,
  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
  maxWidth: 900,
  width: "100%",
  mx: "auto",
  p: { xs: 2.5, sm: 4 },
  fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: 14,
  lineHeight: 1.45,
};

export const invoiceOneHeaderRowSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 2,
  flexWrap: "wrap",
};

export const invoiceOneBrandRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
};

export const invoiceOneLogoImgSx: SxProps<Theme> = {
  display: "block",
  height: 40,
  width: "auto",
  maxWidth: 220,
};

export const invoiceOneTitleSx: SxProps<Theme> = {
  fontWeight: 800,
  fontSize: { xs: 36, sm: 44 },
  letterSpacing: "0.02em",
  color: INVOICE_BLUE,
  lineHeight: 1,
  textAlign: "right",
};

export const invoiceOneSiteSx: SxProps<Theme> = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  color: INVOICE_TEXT,
  textAlign: "right",
  mt: 0.5,
};

export const invoiceOneDividerSx: SxProps<Theme> = {
  height: 2,
  bgcolor: INVOICE_BLUE,
  opacity: 0.35,
  my: 2.5,
  border: "none",
};

export const invoiceOneMetaRowSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  gap: 3,
  flexWrap: "wrap",
  mb: 2.5,
};

export const invoiceOneMetaLabelSx: SxProps<Theme> = {
  fontSize: 13,
  color: INVOICE_MUTED,
  mb: 0.5,
};

export const invoiceOneMetaNameSx: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: 15,
  color: INVOICE_TEXT,
  mb: 0.75,
};

export const invoiceOneMetaDetailSx: SxProps<Theme> = {
  fontSize: 13,
  color: INVOICE_TEXT,
  lineHeight: 1.6,
};

export const invoiceOneMetaRightSx: SxProps<Theme> = {
  textAlign: { xs: "left", sm: "right" },
};

export const invoiceOneTableSx: SxProps<Theme> = {
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed",
  mb: 0,
  "& th": {
    bgcolor: INVOICE_BLUE,
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    py: 1.1,
    px: 1.25,
    textAlign: "left",
    border: "none",
  },
  "& th:nth-of-type(3)": { textAlign: "center" },
  "& th:nth-of-type(4), & th:nth-of-type(5)": { textAlign: "right" },
  "& td": {
    py: 1,
    px: 1.25,
    fontSize: 13,
    color: INVOICE_TEXT,
    border: "none",
    verticalAlign: "middle",
  },
  "& tbody tr:nth-of-type(even) td": { bgcolor: INVOICE_BLUE_LIGHT },
  "& tbody tr:nth-of-type(odd) td": { bgcolor: "#FFFFFF" },
  "& td:nth-of-type(3)": { textAlign: "center" },
  "& td:nth-of-type(4), & td:nth-of-type(5)": { textAlign: "right" },
};

export const invoiceOneTotalsWrapSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "flex-end",
  mt: 0,
};

export const invoiceOneTotalsInnerSx: SxProps<Theme> = {
  width: { xs: "100%", sm: "42%" },
  minWidth: 260,
};

export const invoiceOneSubtotalRowSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  py: 0.75,
  px: 1.25,
  fontSize: 13,
  fontWeight: 600,
  color: INVOICE_TEXT,
};

export const invoiceOneGrandTotalBarSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  bgcolor: INVOICE_BLUE,
  color: "#FFFFFF",
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  py: 1.1,
  px: 1.25,
  mt: 0.25,
};

export const invoiceOneBottomRowSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 3,
  flexWrap: "wrap",
  mt: 3,
};

export const invoiceOnePaymentLabelBarSx: SxProps<Theme> = {
  display: "inline-block",
  bgcolor: INVOICE_BLUE,
  color: "#FFFFFF",
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  py: 0.6,
  px: 1.25,
  mb: 1,
};

export const invoiceOneThankYouSx: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: 14,
  color: INVOICE_TEXT,
  mt: 2,
  mb: 1.5,
};

export const invoiceOneTermsTitleSx: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: 13,
  color: INVOICE_TEXT,
  mb: 0.5,
};

export const invoiceOneTermsBodySx: SxProps<Theme> = {
  fontSize: 11,
  color: INVOICE_TERMS,
  lineHeight: 1.55,
  maxWidth: 340,
};

export const invoiceOneSignatureBlockSx: SxProps<Theme> = {
  textAlign: "right",
  minWidth: 200,
};

export const invoiceOneSignatureScriptSx: SxProps<Theme> = {
  fontFamily: '"Segoe Script", "Brush Script MT", cursive',
  fontSize: 28,
  color: "#B0B8C4",
  lineHeight: 1,
  mb: 0.5,
  fontStyle: "italic",
};

export const invoiceOneSignatureNameSx: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: 14,
  color: INVOICE_TEXT,
};

export const invoiceOneSignatureRoleSx: SxProps<Theme> = {
  fontSize: 13,
  color: INVOICE_TEXT,
};

export const invoiceOneFooterDividerSx: SxProps<Theme> = {
  height: 2,
  bgcolor: INVOICE_BLUE,
  opacity: 0.35,
  my: 2.5,
  border: "none",
};

export const invoiceOneFooterContactsSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexWrap: "wrap",
  gap: { xs: 2, sm: 4 },
};

export const invoiceOneFooterItemSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.75,
  fontSize: 12,
  color: INVOICE_TEXT,
  fontWeight: 500,
};
