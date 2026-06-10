"use client";

import { useLayoutEffect } from "react";
import {
  postEmbedHostResize,
  type EmbedClosedChrome,
} from "./embed-host-messaging";
import type { RuntimeChatAppearance } from "./widget-runtime-appearance";

/** Tell parent `widget.js` the iframe size from configured appearance (not DOM measure). */
export function useEmbedHostResize(
  open: boolean,
  appearance: RuntimeChatAppearance,
  closedChrome?: EmbedClosedChrome,
): void {
  useLayoutEffect(() => {
    postEmbedHostResize(open, appearance, closedChrome);
    const id = window.setTimeout(
      () => postEmbedHostResize(open, appearance, closedChrome),
      0,
    );
    return () => window.clearTimeout(id);
  }, [open, appearance, closedChrome]);
}
