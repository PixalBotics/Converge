"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { mergeSx } from "@/lib/mui/merge-sx";
import { chatOpsPageWrapper } from "@/features/chat-operations/styles/chat-operations.styles";
import {
  chatLiveAdminPageInsetSx,
  chatLivePageStackSx,
} from "../styles/chat-live.styles";

type ChatLivePageShellVariant = "workstation" | "admin";

type ChatLivePageShellProps = {
  variant?: ChatLivePageShellVariant;
  sx?: SxProps<Theme>;
  children: ReactNode;
};

/**
 * Workstation = full-bleed triage (inbox / monitor / QA).
 * Admin = standard dashboard rhythm (settings, reports, canned).
 */
export function ChatLivePageShell({
  variant = "admin",
  sx,
  children,
}: ChatLivePageShellProps) {
  const baseSx =
    variant === "workstation"
      ? mergeSx(chatOpsPageWrapper, chatLivePageStackSx)
      : mergeSx(chatLiveAdminPageInsetSx, chatLivePageStackSx);

  const workstationLayoutSx =
    variant === "workstation"
      ? { flex: 1, minHeight: 0, height: "100%", overflow: "hidden" as const }
      : undefined;

  return (
    <Box sx={sx ? mergeSx(baseSx, workstationLayoutSx, sx) : mergeSx(baseSx, workstationLayoutSx)}>
      {children}
    </Box>
  );
}
