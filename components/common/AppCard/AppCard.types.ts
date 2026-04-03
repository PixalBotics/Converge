import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";

export interface AppCardProps {
  children: ReactNode;
  maxWidth?: number | string;
  sx?: SxProps<Theme>;
}
