"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { ToolbarFilterPopover } from "@/components/common";
import { chatLiveToolbarFilterRowSx } from "../styles/chat-live.styles";
import { hasActiveChatScopeFilters } from "../utils/chat-scope-filters-active";
import {
  ChatScopeFilterPopoverPanel,
  type ChatScopeFilterPopoverPanelProps,
} from "./ChatScopeFilterPopoverPanel";

export type ChatScopeFiltersToolbarProps = Omit<
  ChatScopeFilterPopoverPanelProps,
  "hasActiveFilters" | "onClose"
>;

/** Scope filters as a toolbar Filter button + popover (saves vertical space on chat workstations). */
export function ChatScopeFiltersToolbar(props: ChatScopeFiltersToolbarProps) {
  const [open, setOpen] = useState(false);
  const hasActive = useMemo(() => hasActiveChatScopeFilters(props.filters), [props.filters]);

  return (
    <Box sx={chatLiveToolbarFilterRowSx}>
      <ToolbarFilterPopover open={open} onOpenChange={setOpen} active={hasActive}>
        <ChatScopeFilterPopoverPanel
          {...props}
          hasActiveFilters={hasActive}
          onClose={() => setOpen(false)}
        />
      </ToolbarFilterPopover>
    </Box>
  );
}
