import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";

export interface AppCardProps {
  children: ReactNode;
  maxWidth?: number | string;
  /** When `0`, removes MUI default paper shadow so custom glass `boxShadow` reads cleanly. */
  elevation?: number;
  sx?: SxProps<Theme>;
}
