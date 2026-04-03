import type { ReactNode } from "react";
import type { BoxProps } from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";

export interface DashboardCardProps extends Omit<BoxProps, "sx"> {
  children: ReactNode;
  sx?: SxProps<Theme>;
}
