import type { SxProps, Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

/** Default variant: blue selected (Revenue Overview style) */
export const segmentedControlDefaultSx: SxProps<Theme> = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "53.51px",
  p: 0.5,
  background: theme.app.dashboard.pillBg,
  border: `0.51px solid ${alpha(theme.palette.text.primary, 0.06)}`,
  "& .MuiToggleButtonGroup-grouped": {
    border: "none",
    borderRadius: "53.51px",
    textTransform: "none",
    padding: "6px 18px",
    fontSize: 13,
    color: theme.palette.text.secondary,
    "&:not(:first-of-type)": { marginLeft: 2 },
    "&.Mui-selected": {
      bgcolor: theme.app.dashboard.primaryTint,
      color: theme.palette.text.primary,
      border: `0.51px solid ${alpha(theme.palette.text.primary, 0.06)}`,
      boxShadow: "0 6px 18px rgba(15, 23, 42, 0.8)",
      "&:hover": { bgcolor: theme.app.dashboard.primaryTint },
    },
  },
});

/** Secondary variant: purple selected (Chat Analytics style) */
export const segmentedControlSecondarySx: SxProps<Theme> = (theme) => ({
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "53.51px",
  p: 0.5,
  background: theme.app.dashboard.pillBg,
  border: `0.51px solid ${alpha(theme.palette.text.primary, 0.06)}`,
  "& .MuiToggleButtonGroup-grouped": {
    border: "none",
    borderRadius: "53.51px",
    textTransform: "none",
    padding: "6px 18px",
    fontSize: 13,
    color: alpha(theme.palette.text.primary, 0.55),
    "&:not(:first-of-type)": { marginLeft: 2 },
    "&.Mui-selected": {
      bgcolor: theme.app.dashboard.pillActive,
      color: theme.palette.text.primary,
      border: `0.51px solid ${alpha(theme.palette.text.primary, 0.06)}`,
      "&:hover": { bgcolor: theme.app.dashboard.pillActive },
    },
  },
});
