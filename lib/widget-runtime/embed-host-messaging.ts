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

const FAB_PX = 58;
const FRAME_PAD_PX = 12;

/** Iframe dimensions for parent `widget.js` — closed = launcher only, open = panel + launcher. */
export function computeEmbedHostFrameSize(
  open: boolean,
  appearance: RuntimeChatAppearance,
): { width: number; height: number } {
  const { launcher, chatBox } = appearance;
  const maxW =
    typeof window !== "undefined"
      ? window.innerWidth - launcher.insetSidePx * 2 - FRAME_PAD_PX
      : chatBox.boxWidth;
  const maxH =
    typeof window !== "undefined" ? window.innerHeight * 0.9 : chatBox.boxHeight;

  if (!open) {
    return {
      width: launcher.insetSidePx + FAB_PX + FRAME_PAD_PX,
      height: launcher.insetBottomPx + FAB_PX + FRAME_PAD_PX,
    };
  }

  const panelW = Math.min(chatBox.boxWidth, maxW);
  const panelH = Math.min(chatBox.boxHeight, maxH);
  return {
    width: Math.max(panelW + launcher.insetSidePx + FRAME_PAD_PX, launcher.insetSidePx + FAB_PX + FRAME_PAD_PX),
    height: panelH + FAB_PX + 16 + launcher.insetBottomPx + FRAME_PAD_PX,
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
