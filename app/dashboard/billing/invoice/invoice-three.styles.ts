import type { SxProps, Theme } from "@mui/material/styles";

export const INVOICE_THREE_TEAL = "#2E9698";
export const INVOICE_THREE_TEAL_DARK = "#1A5C5F";
export const INVOICE_THREE_NAVY = "#0C2D3E";
export const INVOICE_THREE_TEXT = "#3D4F5C";
export const INVOICE_THREE_HEADING = "#0C2D3E";

export const INVOICE_THREE_GRADIENT =
  "linear-gradient(90deg, #3DB5B7 0%, #2E9698 35%, #1F6B6E 70%, #164F52 100%)";

export const invoiceThreePaperSx: SxProps<Theme> = {
  position: "relative",
  bgcolor: "#FFFFFF",
  color: INVOICE_THREE_TEXT,
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

export const invoiceThreeHeaderSx: SxProps<Theme> = {
  position: "relative",
  px: { xs: 2.5, sm: 4 },
  pt: { xs: 2.5, sm: 3.5 },
  pb: 2,
  minHeight: 120,
};

export const invoiceThreeHeaderCircleSx: SxProps<Theme> = {
  position: "absolute",
  top: -40,
  right: -30,
  width: { xs: 160, sm: 220 },
  height: { xs: 160, sm: 220 },
  borderRadius: "50%",
  bgcolor: "#F2F7F7",
  pointerEvents: "none",
  zIndex: 0,
};

export const invoiceThreeHeaderCircleArcSx: SxProps<Theme> = {
  position: "absolute",
  top: -40,
  right: -30,
  width: { xs: 160, sm: 220 },
  height: { xs: 160, sm: 220 },
  borderRadius: "50%",
  border: "14px solid transparent",
  borderRightColor: INVOICE_THREE_TEAL,
  borderBottomColor: "#5FC4C6",
  transform: "rotate(-12deg)",
  pointerEvents: "none",
  zIndex: 1,
  boxSizing: "border-box",
};

export const invoiceThreeHeaderContentSx: SxProps<Theme> = {
  position: "relative",
  zIndex: 2,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 2,
  flexWrap: "wrap",
};

export const invoiceThreeLogoImgSx: SxProps<Theme> = {
  display: "block",
  height: 44,
  width: "auto",
  maxWidth: 240,
};

export const invoiceThreeTitleBlockSx: SxProps<Theme> = {
  textAlign: "right",
  ml: "auto",
};

export const invoiceThreeTitleSx: SxProps<Theme> = {
  fontWeight: 800,
  fontSize: { xs: 42, sm: 56 },
  letterSpacing: "0.06em",
  color: INVOICE_THREE_NAVY,
  lineHeight: 1,
  mb: 1.25,
};

export const invoiceThreeMetaSx: SxProps<Theme> = {
  fontSize: 14,
  color: INVOICE_THREE_TEXT,
  lineHeight: 1.7,
};

export const invoiceThreeBodySx: SxProps<Theme> = {
  px: { xs: 2.5, sm: 4 },
  pb: 2,
};

export const invoiceThreePayableBlockSx: SxProps<Theme> = {
  mb: 2.5,
  maxWidth: 360,
};

export const invoiceThreeSectionTitleSx: SxProps<Theme> = {
  fontWeight: 800,
  fontSize: 13,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: INVOICE_THREE_HEADING,
  mb: 0.75,
};

export const invoiceThreeSectionBodySx: SxProps<Theme> = {
  fontSize: 14,
  color: INVOICE_THREE_TEXT,
  lineHeight: 1.75,
  mb: 2,
};

export const invoiceThreeTableHeaderBarSx: SxProps<Theme> = {
  background: INVOICE_THREE_GRADIENT,
  borderRadius: "9999px",
  display: "grid",
  gridTemplateColumns: "1fr 72px 88px 88px",
  alignItems: "center",
  py: 1.15,
  px: 2.5,
  mb: 0.5,
  color: "#FFFFFF",
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  "& > :nth-of-type(2)": { textAlign: "center" },
  "& > :nth-of-type(3), & > :nth-of-type(4)": { textAlign: "right" },
};

export const invoiceThreeTableRowSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: "1fr 72px 88px 88px",
  alignItems: "center",
  py: 1.1,
  px: 2.5,
  fontSize: 14,
  color: INVOICE_THREE_TEXT,
  borderBottom: "1px solid #E8EEF0",
  "&:last-of-type": { borderBottom: "none" },
  "& > :nth-of-type(2)": { textAlign: "center" },
  "& > :nth-of-type(3), & > :nth-of-type(4)": { textAlign: "right" },
};

export const invoiceThreeSummaryRowSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  gap: 3,
  flexWrap: "wrap",
  mt: 2.5,
  mb: 3,
};

export const invoiceThreeNotesSx: SxProps<Theme> = {
  flex: "1 1 280px",
  maxWidth: 420,
};

export const invoiceThreeNotesTitleSx: SxProps<Theme> = {
  fontWeight: 800,
  fontSize: 13,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: INVOICE_THREE_HEADING,
  mb: 0.75,
};

export const invoiceThreeNotesBodySx: SxProps<Theme> = {
  fontSize: 12,
  color: "#6B7B86",
  lineHeight: 1.65,
};

export const invoiceThreeTotalsSx: SxProps<Theme> = {
  flex: "0 0 auto",
  minWidth: 220,
  ml: "auto",
};

export const invoiceThreeTotalLineSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 3,
  py: 0.5,
  fontSize: 14,
  color: INVOICE_THREE_TEXT,
  minWidth: 220,
};

export const invoiceThreeGrandTotalSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 3,
  py: 0.75,
  mt: 0.5,
  fontSize: 15,
  fontWeight: 800,
  color: INVOICE_THREE_HEADING,
  minWidth: 220,
};

export const invoiceThreeFooterSx: SxProps<Theme> = {
  background: INVOICE_THREE_GRADIENT,
  py: 2.5,
  px: 2,
};

export const invoiceThreeFooterPillSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
  gap: { xs: 1.5, sm: 3 },
  bgcolor: INVOICE_THREE_NAVY,
  borderRadius: "9999px",
  py: 1.25,
  px: { xs: 2, sm: 4 },
  maxWidth: 720,
  mx: "auto",
};

export const invoiceThreeFooterItemSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.75,
  fontSize: 13,
  color: "#FFFFFF",
  fontWeight: 500,
};
