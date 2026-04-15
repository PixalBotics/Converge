"use client";

import MuiCheckbox from "@mui/material/Checkbox";
import { useTheme } from "@mui/material/styles";
import { checkboxStyles } from "./Checkbox.styles";
import type { CheckboxProps } from "./Checkbox.types";

export function Checkbox({ sx = {}, ...rest }: CheckboxProps) {
  const theme = useTheme();
  return (
    <MuiCheckbox size="small" sx={{ ...checkboxStyles(theme), ...sx }} {...rest} />
  );
}
