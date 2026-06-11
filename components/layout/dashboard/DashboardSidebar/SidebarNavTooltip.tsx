"use client";

import type { ReactElement } from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

type SidebarNavTooltipProps = {
  collapsed: boolean;
  title: string;
  children: ReactElement;
};

/** Icon-rail tooltips when the desktop sidebar is collapsed. */
export function SidebarNavTooltip({ collapsed, title, children }: SidebarNavTooltipProps) {
  if (!collapsed) return children;

  return (
    <Tooltip title={title} placement="right" arrow enterDelay={200}>
      <Box component="span" sx={{ display: "block", width: "100%" }}>
        {children}
      </Box>
    </Tooltip>
  );
}
