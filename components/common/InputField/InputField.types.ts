import type { InputHTMLAttributes } from "react";
import type { SxProps, Theme } from "@mui/material/styles";

export interface InputFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size" | "color" | "style"
  > {
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password";
  name?: string;
  id?: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  inputProps?: object;
  /** Merged after default TextField styles; use for page-specific input chrome. */
  sx?: SxProps<Theme>;
}
