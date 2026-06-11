"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import MuiLink from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import { resolveSx } from "@/utils/resolveSx";

type AuthNavigationLinkProps = {
  href: string;
  children: ReactNode;
  sx?: SxProps<Theme>;
};

/**
 * In-app auth navigation: Next.js client transition + prefetch (SaaS-grade snappiness).
 */
export function AuthNavigationLink({ href, children, sx = {} }: AuthNavigationLinkProps) {
  const theme = useTheme();
  const resolvedSx = resolveSx(sx, theme);

  return (
    <MuiLink
      component={NextLink}
      href={href}
      prefetch
      scroll={false}
      underline="hover"
      sx={{
        color: theme.app.text.link,
        fontSize: "0.875rem",
        cursor: "pointer",
        transition: theme.transitions.create(["color", "opacity"], {
          duration: theme.transitions.duration.shorter,
        }),
        ...resolvedSx,
      }}
    >
      {children}
    </MuiLink>
  );
}
