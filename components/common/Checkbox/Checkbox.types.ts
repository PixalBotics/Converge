import type { CheckboxProps as MuiCheckboxProps } from "@mui/material/Checkbox";

export interface CheckboxProps extends Omit<MuiCheckboxProps, "size"> {
  size?: "small" | "medium";
}
