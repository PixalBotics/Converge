import type { SxProps, Theme } from "@mui/material/styles";

/** Full-width add-training forms (dashboard card). */
export const aiTrainingFilterGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    lg: "repeat(3, minmax(0, 1fr))",
  },
  gap: 2,
  alignItems: "end",
  width: "100%",
  "& > *": { minWidth: 0 },
};

/** Narrow filter popover — single column so fields align with platform filter panels. */
export const aiTrainingFilterPopoverGridSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  width: "100%",
  "& > *": { minWidth: 0, width: "100%" },
};

export const aiTrainingStatGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
  gap: 1.25,
  mb: 2,
};

export function aiTrainingStatCardSx(accent: string): SxProps<Theme> {
  return (theme) => ({
    p: 1.5,
    borderRadius: 2,
    border: `1px solid ${theme.app.dashboard.cardBorder}`,
    background: `linear-gradient(145deg, ${accent}18 0%, rgba(15, 23, 42, 0.35) 100%)`,
  });
}

export const aiTrainingSectionDividerSx: SxProps<Theme> = (theme) => ({
  mt: 2.5,
  pt: 2.5,
  borderTop: `1px solid ${theme.app.dashboard.cardBorder}`,
});

export const aiTrainingOverviewCardSx: SxProps<Theme> = (theme) => ({
  p: { xs: 2, sm: 2.5 },
  borderRadius: 2.5,
  border: `1px solid ${theme.app.dashboard.accentBlue}44`,
  background: `linear-gradient(160deg, rgba(99, 102, 241, 0.1) 0%, rgba(15, 23, 42, 0.5) 55%)`,
  boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
});

export const aiTrainingSelectedBannerSx: SxProps<Theme> = (theme) => ({
  p: 1.5,
  mb: 2,
  borderRadius: 2,
  border: `1px solid ${theme.palette.success.main}55`,
  bgcolor: `${theme.palette.success.main}12`,
});
