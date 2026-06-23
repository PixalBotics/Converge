"use client";

import { useLayoutEffect } from "react";
import {
  postEmbedHostResize,
  type EmbedClosedChrome,
  type EmbedHostSurface,
} from "./embed-host-messaging";
import type { RuntimeChatAppearance } from "./widget-runtime-appearance";

/** Tell parent `widget.js` the iframe size from configured appearance (not DOM measure). */
export function useEmbedHostResize(
  open: boolean,
  appearance: RuntimeChatAppearance,
  closedChrome?: EmbedClosedChrome,
  disabled = false,
  surface?: EmbedHostSurface,
): void {
  useLayoutEffect(() => {
    if (disabled) return;
    const post = () =>
      postEmbedHostResize(open, appearance, closedChrome, surface);
    post();
    const id = window.setTimeout(post, 0);
    if (open) {
      window.addEventListener("resize", post);
      return () => {
        window.clearTimeout(id);
        window.removeEventListener("resize", post);
      };
    }
    return () => window.clearTimeout(id);
  }, [open, appearance, closedChrome, disabled, surface]);
}
