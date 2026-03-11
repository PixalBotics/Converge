"use client";

import MuiTypography from "@mui/material/Typography";
import type { TypographyProps as MuiTypographyComponentProps } from "@mui/material/Typography";
import type { TypographyProps } from "./Typography.types";
import { typographyVariants, type TypographyVariantKey } from "./typography.styles";

const customVariantKeys: TypographyVariantKey[] = ["medium", "mediumLarge", "small", "boldLarge", "regularLarge", "medium16"];

export function Typography(props: TypographyProps) {
  const { variant, sx, ...rest } = props;
  const isCustomVariant = variant && customVariantKeys.includes(variant as TypographyVariantKey);
  const variantSx = isCustomVariant
    ? typographyVariants[variant as TypographyVariantKey]
    : undefined;
  const muiVariant: MuiTypographyComponentProps["variant"] | undefined =
    isCustomVariant ? undefined : (variant as MuiTypographyComponentProps["variant"]);
  return (
    <MuiTypography
      variant={muiVariant}
      sx={{ ...variantSx, ...sx }}
      {...rest}
    />
  );
}
