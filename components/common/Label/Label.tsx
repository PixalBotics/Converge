"use client";

import { Typography } from "@/components/common";
import type { ComponentType } from "react";
import { useTheme } from "@mui/material/styles";
import { labelVariants } from "./Label.styles";
import type { LabelProps, LabelVariant } from "./Label.types";

export function Label({
  children,
  variant = "mediumSmall",
  htmlFor,
  sx = {},
  ...rest
}: LabelProps) {
  const theme = useTheme();
  const variantStyles = labelVariants[variant as LabelVariant](theme);
  const MuiTypography = Typography as ComponentType<LabelProps>;

  return (
    <MuiTypography
      component="label"
      htmlFor={htmlFor}
      sx={{ display: "block", ...variantStyles, ...sx }}
      {...rest}
    >
      {children}
    </MuiTypography>
  );
}
