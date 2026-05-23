import type { InputHTMLAttributes } from "react";
import type { SxProps, Theme } from "@mui/material/styles";

export interface InputFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size" | "color" | "style"
  > {
  label: string;
  placeholder?: string;
  /**
   * Mirrors HTML input types used across dashboard forms.
   * Keep narrow (instead of `string`) so usage stays consistent.
   */
  type?: "text" | "email" | "password" | "time" | "number" | "date";
  name?: string;
  id?: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  inputProps?: object;
  /** Merged after default TextField styles; use for page-specific input chrome. */
  sx?: SxProps<Theme>;
  /** For scroll-to-error: sets `data-setup-scroll-anchor` (comma-separated paths allowed). */
  scrollAnchorPath?: string;
  /** Smaller label + tighter spacing (side panels, dense forms). */
  dense?: boolean;
}
