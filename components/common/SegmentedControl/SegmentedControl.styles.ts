import type { SxProps, Theme } from "@mui/material/styles";

const baseGroup: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "53.51px",
  p: 0.5,
  background: "#16123F",
  border: "0.51px solid #FFFFFF0F",
  "& .MuiToggleButtonGroup-grouped": {
    border: "none",
    borderRadius: "53.51px",
    textTransform: "none",
    padding: "6px 18px",
    fontSize: 13,
    "&:not(:first-of-type)": {
      marginLeft: 2,
    },
  },
};

/** Default variant: blue selected (Revenue Overview style) */
export const segmentedControlDefaultSx: SxProps<Theme> = {
  ...baseGroup,
  "& .MuiToggleButtonGroup-grouped": {
    border: "none",
    borderRadius: "53.51px",
    textTransform: "none",
    padding: "6px 18px",
    fontSize: 13,
    color: "rgba(148, 163, 184, 0.85)",
    "&:not(:first-of-type)": { marginLeft: 2 },
    "&.Mui-selected": {
      bgcolor: "#0048B70A",
      color: "#FFFFFF",
      border: "0.51px solid #D9D9D90F",
      boxShadow: "0 6px 18px rgba(15, 23, 42, 0.8)",
      "&:hover": { bgcolor: "#0048B70A" },
    },
  },
};

/** Secondary variant: purple selected (Chat Analytics style) */
export const segmentedControlSecondarySx: SxProps<Theme> = {
  ...baseGroup,
  "& .MuiToggleButtonGroup-grouped": {
    border: "none",
    borderRadius: "53.51px",
    textTransform: "none",
    padding: "6px 18px",
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.5)",
    "&:not(:first-of-type)": { marginLeft: 2 },
    "&.Mui-selected": {
      bgcolor: "#2B254D",
      color: "#FFFFFF",
      border: "0.51px solid #D9D9D90F",
      "&:hover": { bgcolor: "#2B254D" },
    },
  },
};
