"use client";

import type { ReactNode } from "react";
import {
  ToolbarFilterPopoverPanelBody,
  ToolbarFilterPopoverPanelFooter,
  ToolbarFilterPopoverPanelRoot,
} from "./ToolbarFilterPopoverPanel.styles";

export type ToolbarFilterPopoverPanelProps = {
  children: ReactNode;
  /** Typically Reset / Clear + Done — keep actions in this slot so they stay pinned below scrollable fields. */
  footer: ReactNode;
};

/**
 * Standard layout for {@link ToolbarFilterPopover} content: scrollable form + pinned action row.
 * Prevents long filter forms from pushing **Done** below the viewport.
 */
export function ToolbarFilterPopoverPanel({ children, footer }: ToolbarFilterPopoverPanelProps) {
  return (
    <ToolbarFilterPopoverPanelRoot>
      <ToolbarFilterPopoverPanelBody>{children}</ToolbarFilterPopoverPanelBody>
      <ToolbarFilterPopoverPanelFooter>{footer}</ToolbarFilterPopoverPanelFooter>
    </ToolbarFilterPopoverPanelRoot>
  );
}
