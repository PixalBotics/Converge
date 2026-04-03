import type { TypographyProps } from "@mui/material/Typography";

export type LabelVariant = "regular" | "mediumLarge" | "mediumSmall";

export interface LabelProps extends Omit<TypographyProps<"label">, "variant"> {
  children: React.ReactNode;
  variant?: LabelVariant;
  htmlFor?: string;
}
