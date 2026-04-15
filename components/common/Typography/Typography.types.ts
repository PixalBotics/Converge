import type { TypographyProps as MuiTypographyProps } from "@mui/material/Typography";
import type { TypographyVariantKey } from "./typography.styles";

export interface TypographyProps extends Omit<MuiTypographyProps, "variant"> {
  component?: React.ElementType;
  variant?: MuiTypographyProps["variant"] | TypographyVariantKey;
}
