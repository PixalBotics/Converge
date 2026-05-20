import type { RuntimeChatAppearance } from "./widget-runtime-appearance";

export const WIDGET_EMBED_RESIZE_MESSAGE = "converge-widget-embed-resize";

export interface WidgetEmbedResizePayload {
  type: typeof WIDGET_EMBED_RESIZE_MESSAGE;
  open: boolean;
  width: number;
  height: number;
  position: "left" | "center" | "right";
  insetBottomPx: number;
  insetSidePx: number;
}

export const EMBED_LAUNCHER_SIZE_PX = 58;
const PANEL_FAB_GAP_PX = 8;

/**
 * Parent iframe size (transparent, tight fit).
 * Page offsets (`insetBottomPx` / `insetSidePx`) are applied by `widget.js`, not here.
 */
export function computeEmbedHostFrameSize(
  open: boolean,
  appearance: RuntimeChatAppearance,
): { width: number; height: number } {
  const { chatBox } = appearance;

  if (!open) {
    return { width: EMBED_LAUNCHER_SIZE_PX, height: EMBED_LAUNCHER_SIZE_PX };
  }

  /**
   * Use wizard-configured size only. Do NOT use `window.innerWidth` here — while the
   * parent iframe is still 58px wide, that would shrink the panel to ~40px and clip the UI.
   * `widget.js` caps to the host page viewport on the parent window.
   */
  return {
    width: chatBox.boxWidth,
    height: chatBox.boxHeight + EMBED_LAUNCHER_SIZE_PX + PANEL_FAB_GAP_PX,
  };
}

export function postEmbedHostResize(
  open: boolean,
  appearance: RuntimeChatAppearance,
): void {
  if (typeof window === "undefined" || window.parent === window) return;

  const { width, height } = computeEmbedHostFrameSize(open, appearance);
  const { launcher } = appearance;

  const payload: WidgetEmbedResizePayload = {
    type: WIDGET_EMBED_RESIZE_MESSAGE,
    open,
    width: Math.ceil(width),
    height: Math.ceil(height),
    position: launcher.position,
    insetBottomPx: launcher.insetBottomPx,
    insetSidePx: launcher.insetSidePx,
  };

  window.parent.postMessage(payload, "*");
}
