import type { SxProps, Theme } from "@mui/material/styles";

export interface TextLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  /** MUI sx: object or (theme) => object. Resolved with theme so no casts needed. */
  sx?: SxProps<Theme>;
}
