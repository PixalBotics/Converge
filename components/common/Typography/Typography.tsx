"use client";

import MuiTypography from "@mui/material/Typography";
import type { TypographyProps as MuiTypographyComponentProps } from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { TypographyProps } from "./Typography.types";
import { typographyVariants, type TypographyVariantKey } from "./typography.styles";

const customVariantKeys: TypographyVariantKey[] = ["medium", "mediumLarge", "small", "boldLarge", "regularLarge", "medium16"];
const titleVariantKeys: TypographyVariantKey[] = ["mediumLarge", "boldLarge", "regularLarge"];

export function Typography(props: TypographyProps) {
  const theme = useTheme() as AppTheme;
  const { variant, sx, ...rest } = props;
  const isCustomVariant = variant && customVariantKeys.includes(variant as TypographyVariantKey);
  const variantSx = isCustomVariant
    ? typographyVariants[variant as TypographyVariantKey]
    : undefined;
  const titleSpacingSx =
    isCustomVariant && titleVariantKeys.includes(variant as TypographyVariantKey)
      ? { mb: "8px" }
      : undefined;
  const muiVariant: MuiTypographyComponentProps["variant"] | undefined =
    isCustomVariant ? undefined : (variant as MuiTypographyComponentProps["variant"]);
  const sxArray = sx === undefined || sx === null ? [] : Array.isArray(sx) ? sx : [sx];
  return (
    <MuiTypography
      variant={muiVariant}
      sx={[
        variantSx ?? false,
        { color: theme.app.text.primary },
        ...sxArray,
        titleSpacingSx ?? false,
      ]}
      {...rest}
    />
  );
}
