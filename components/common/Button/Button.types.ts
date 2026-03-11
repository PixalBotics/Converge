import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";

export interface ButtonProps extends Omit<MuiButtonProps, "variant"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outlined";
  fullWidth?: boolean;
  component?: React.ElementType;
  href?: string;
}
