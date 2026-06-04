import type { SxProps, Theme } from "@mui/material/styles";

/** Three-column step grid for the chat widget wizard (distribution pattern). */
export const widgetStepperGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
  gap: { xs: 1, md: 1.25 },
};
