import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";

export interface ButtonProps extends Omit<MuiButtonProps, "variant" | "size"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outlined";
  /** Default matches existing pill CTAs; `compact` / `small` for toolbars and dense forms. */
  size?: "default" | "compact" | "small";
  fullWidth?: boolean;
  component?: React.ElementType;
  href?: string;
}
