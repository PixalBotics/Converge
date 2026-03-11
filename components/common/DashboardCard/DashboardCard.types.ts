import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";

export interface DashboardCardProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
}
