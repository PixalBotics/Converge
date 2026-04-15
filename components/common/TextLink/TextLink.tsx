"use client";

import Link from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
import type { TextLinkProps } from "./TextLink.types";
import { resolveSx } from "@/utils/resolveSx";

export function TextLink({ href, children, onClick, sx = {} }: TextLinkProps) {
  const theme = useTheme();
  const resolvedSx = resolveSx(sx, theme);
  return (
    <Link
      href={href}
      onClick={onClick}
      underline="hover"
      sx={{
        color: theme.app.text.link,
        fontSize: "0.875rem",
        cursor: "pointer",
        ...resolvedSx,
      }}
    >
      {children}
    </Link>
  );
}
