import type { InputHTMLAttributes } from "react";

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
}
