import type { SxProps, Theme } from "@mui/material/styles";

export const overviewPageWrapper: SxProps<Theme> = {
  maxWidth: 1600,
  mx: "auto",
};

export const overviewHeader: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "flex-start", sm: "center" },
  justifyContent: "space-between",
  mb: 2.5,
  gap: 1.5,
};

export const overviewAddButtonWrapper: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: { xs: "flex-start", sm: "flex-end" },
  width: { xs: "100%", sm: "auto" },
};

export const overviewAddButton: SxProps<Theme> = {
  borderRadius: "9999px",
  px: 3,
  py: 1.25,
  display: "inline-flex",
  alignItems: "center",
  gap: 1,
  width: { xs: "100%", sm: "auto" },
  justifyContent: "center",
  background: "linear-gradient(135deg, #1F2937 0%, #020617 100%)",
  boxShadow: "0 10px 25px rgba(15,23,42,0.7)",
  border: "1px solid rgba(148,163,184,0.5)",
};

export const overviewCardsRow: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
  gap: 2,
  mb: 2.5,
};

export const overviewCard: SxProps<Theme> = {
  p: { xs: 1.5, sm: 2, md: 2.5 },
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
};

export const overviewStatValue: SxProps<Theme> = {
  display: "flex",
  alignItems: "baseline",
  gap: 0.5,
};

export const overviewTableCard: SxProps<Theme> = {
  p: { xs: 1.5, sm: 2, md: 2.5 },
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export const overviewTableCardHeader: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  alignItems: { xs: "flex-start", md: "center" },
  justifyContent: "space-between",
  gap: 1.5,
};

export const overviewIconBox: SxProps<Theme> = {
  width: 40,
  height: 40,
  borderRadius: "12px",
  background: "radial-gradient(100% 100% at 50% 0%, #A855F7 0%, #312E81 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 10px 30px rgba(15,23,42,0.85)",
};

export const overviewSearchRow: SxProps<Theme> = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 1,
  width: { xs: "100%", md: "auto" },
};

export const overviewSearchFieldWrapper: SxProps<Theme> = {
  flex: 1,
};

export const overviewFooterRow: SxProps<Theme> = {
  mt: 1,
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "flex-start", sm: "center" },
  justifyContent: "space-between",
  gap: 1.5,
  color: "rgba(148,163,184,0.9)",
  fontSize: 13,
};

export const overviewPaginationWrapper: SxProps<Theme> = {
  width: { xs: "100%", sm: "auto" },
  display: "flex",
  justifyContent: "flex-end",
  alignSelf: { xs: "stretch", sm: "auto" },
};
