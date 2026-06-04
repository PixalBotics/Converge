import type { ReactNode } from "react";
import type { BoxProps } from "@mui/material/Box";

/** Inherits MUI `Box` `sx` (including array fragments merged in `DashboardCard`). */
export interface DashboardCardProps extends Omit<BoxProps, "children"> {
  children: ReactNode;
}
