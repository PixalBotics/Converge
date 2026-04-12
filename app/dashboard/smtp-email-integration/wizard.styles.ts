import type { SxProps, Theme } from "@mui/material/styles";

/** Two-column form row (password + from email) */
export const smtpWizardFormGrid2: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
  gap: 2,
  alignItems: "start",
};
