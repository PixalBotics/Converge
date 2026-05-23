"use client";

import { useLayoutEffect } from "react";
import { postEmbedHostResize } from "./embed-host-messaging";
import type { RuntimeChatAppearance } from "./widget-runtime-appearance";

/** Tell parent `widget.js` the iframe size from configured appearance (not DOM measure). */
export function useEmbedHostResize(
  open: boolean,
  appearance: RuntimeChatAppearance,
): void {
  useLayoutEffect(() => {
    postEmbedHostResize(open, appearance);
    const id = window.setTimeout(() => postEmbedHostResize(open, appearance), 0);
    return () => window.clearTimeout(id);
  }, [open, appearance]);
}
