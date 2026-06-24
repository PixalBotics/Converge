import type { SxProps, Theme } from "@mui/material/styles";

export const attendanceMetricsGrid: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    lg: "repeat(2, minmax(0, 1fr))",
  },
  gap: { xs: 1.5, sm: 2 },
  mb: 3,
  width: "100%",
  minWidth: 0,
};
