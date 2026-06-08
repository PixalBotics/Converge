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
const CLOSED_INVITATION_GAP_PX = 8;
/** Conservative estimate for proactive teaser / unread preview above the FAB. */
const CLOSED_INVITATION_EST_HEIGHT_PX = 132;
const CLOSED_INVITATION_EST_WIDTH_PX = 300;

export type EmbedClosedChrome = {
  /** Invitation bubble or unread preview visible while the panel is closed. */
  hasInvitationBubble?: boolean;
};

/**
 * Parent iframe size (transparent, tight fit).
 * Page offsets (`insetBottomPx` / `insetSidePx`) are applied by `widget.js`, not here.
 */
export function computeEmbedHostFrameSize(
  open: boolean,
  appearance: RuntimeChatAppearance,
  closedChrome?: EmbedClosedChrome,
): { width: number; height: number } {
  const { chatBox } = appearance;

  if (!open) {
    if (!closedChrome?.hasInvitationBubble) {
      return { width: EMBED_LAUNCHER_SIZE_PX, height: EMBED_LAUNCHER_SIZE_PX };
    }
    return {
      width: Math.max(EMBED_LAUNCHER_SIZE_PX, CLOSED_INVITATION_EST_WIDTH_PX),
      height:
        EMBED_LAUNCHER_SIZE_PX +
        CLOSED_INVITATION_GAP_PX +
        CLOSED_INVITATION_EST_HEIGHT_PX,
    };
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
  closedChrome?: EmbedClosedChrome,
): void {
  if (typeof window === "undefined" || window.parent === window) return;

  const { width, height } = computeEmbedHostFrameSize(
    open,
    appearance,
    closedChrome,
  );
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

const DEFAULT_INSET_BOTTOM_PX = 16;
const DEFAULT_INSET_SIDE_PX = 16;

/** Mirror `widget.js` iframe layout — used by `/test/widget` preview host page. */
export function applyEmbedHostFrameLayout(
  frame: HTMLElement,
  payload: Partial<WidgetEmbedResizePayload>,
): void {
  const pos = payload.position === "left" || payload.position === "center"
    ? payload.position
    : "right";
  const bottom =
    typeof payload.insetBottomPx === "number"
      ? payload.insetBottomPx
      : DEFAULT_INSET_BOTTOM_PX;
  const side =
    typeof payload.insetSidePx === "number"
      ? payload.insetSidePx
      : DEFAULT_INSET_SIDE_PX;
  let width =
    typeof payload.width === "number" && payload.width > 0
      ? payload.width
      : EMBED_LAUNCHER_SIZE_PX;
  let height =
    typeof payload.height === "number" && payload.height > 0
      ? payload.height
      : EMBED_LAUNCHER_SIZE_PX;

  const vw = typeof window !== "undefined" ? window.innerWidth || width : width;
  const vh = typeof window !== "undefined" ? window.innerHeight || height : height;
  width = Math.min(Math.ceil(width), vw);
  height = Math.min(Math.ceil(height), vh);

  const style = frame.style;
  style.position = "fixed";
  style.border = "none";
  style.margin = "0";
  style.padding = "0";
  style.background = "transparent";
  style.colorScheme = "normal";
  style.zIndex = "2147483000";
  style.width = `${width}px`;
  style.height = `${height}px`;
  style.bottom = `${bottom}px`;
  style.maxWidth = "100vw";
  style.maxHeight = "100vh";
  style.overflow = "hidden";
  style.pointerEvents = "auto";

  if (pos === "left") {
    style.left = `${side}px`;
    style.right = "auto";
    style.transform = "";
  } else if (pos === "center") {
    style.left = "50%";
    style.right = "auto";
    style.transform = "translateX(-50%)";
  } else {
    style.right = `${side}px`;
    style.left = "auto";
    style.transform = "";
  }
}
