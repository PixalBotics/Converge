/**
 * Converge embed loader — mounts `/embed/widget` in a fixed iframe on the host page.
 * Config, session, and chat run inside the iframe (React) against NEXT_PUBLIC_API_BASE_URL.
 *
 * <script src="{APP}/widget.js" data-widget-key="wgt_..." data-app-origin="{APP}" defer></script>
 */
(function () {
  "use strict";

  var RESIZE_MSG = "converge-widget-embed-resize";
  var LAUNCHER_SIZE_PX = 58;
  var DEFAULT_INSET_BOTTOM_PX = 16;
  var DEFAULT_INSET_SIDE_PX = 16;

  function currentScript() {
    return document.currentScript;
  }

  function pageHost() {
    try {
      return window.location.hostname || "localhost";
    } catch (_e) {
      return "localhost";
    }
  }

  function pageUrl() {
    try {
      return window.location.href;
    } catch (_e) {
      return "";
    }
  }

  function normalizeOrigin(origin) {
    return String(origin || "").replace(/\/+$/, "");
  }

  function applyFrameLayout(frame, payload) {
    var pos = payload.position === "left" || payload.position === "center"
      ? payload.position
      : "right";
    var bottom = typeof payload.insetBottomPx === "number"
      ? payload.insetBottomPx
      : DEFAULT_INSET_BOTTOM_PX;
    var side = typeof payload.insetSidePx === "number"
      ? payload.insetSidePx
      : DEFAULT_INSET_SIDE_PX;
    var width = typeof payload.width === "number" && payload.width > 0
      ? payload.width
      : LAUNCHER_SIZE_PX;
    var height = typeof payload.height === "number" && payload.height > 0
      ? payload.height
      : LAUNCHER_SIZE_PX;

    var vw = window.innerWidth || width;
    var vh = window.innerHeight || height;
    width = Math.min(Math.ceil(width), vw);
    height = Math.min(Math.ceil(height), vh);

    var style = frame.style;
    style.position = "fixed";
    style.border = "none";
    style.margin = "0";
    style.padding = "0";
    style.background = "transparent";
    style.colorScheme = "normal";
    style.zIndex = "2147483000";
    style.width = width + "px";
    style.height = height + "px";
    style.bottom = bottom + "px";
    style.maxWidth = "100vw";
    style.maxHeight = "100vh";
    style.overflow = "hidden";

    if (pos === "left") {
      style.left = side + "px";
      style.right = "auto";
      style.transform = "";
    } else if (pos === "center") {
      style.left = "50%";
      style.right = "auto";
      style.transform = "translateX(-50%)";
    } else {
      style.right = side + "px";
      style.left = "auto";
      style.transform = "";
    }
  }

  function bootstrap() {
    var script = currentScript();
    if (!script) {
      console.error("[widget] Could not find embed script tag.");
      return;
    }

    var widgetKey = (script.getAttribute("data-widget-key") || "").trim();
    var appOrigin = normalizeOrigin(
      script.getAttribute("data-app-origin") ||
        script.getAttribute("data-api-origin"),
    );

    if (!appOrigin && script.src) {
      try {
        appOrigin = normalizeOrigin(
          new URL(script.src, window.location.href).origin,
        );
      } catch (_e) {
        /* ignore */
      }
    }

    if (!widgetKey || !appOrigin) {
      console.error(
        "[widget] Missing data-widget-key or data-app-origin on the script tag.",
      );
      return;
    }

    var params = new URLSearchParams();
    params.set("widgetKey", widgetKey);
    params.set("parentHost", pageHost());
    params.set("parentPage", pageUrl());

    var iframe = document.createElement("iframe");
    iframe.setAttribute("title", "Chat widget");
    iframe.setAttribute("allow", "clipboard-write");
    iframe.setAttribute("aria-label", "Chat widget");
    iframe.src = appOrigin + "/embed/widget?" + params.toString();

    applyFrameLayout(iframe, {
      width: LAUNCHER_SIZE_PX,
      height: LAUNCHER_SIZE_PX,
      position: "right",
      insetBottomPx: DEFAULT_INSET_BOTTOM_PX,
      insetSidePx: DEFAULT_INSET_SIDE_PX,
      open: false,
    });

    window.addEventListener("message", function (event) {
      if (!event || !event.data || event.data.type !== RESIZE_MSG) return;
      if (event.origin !== appOrigin) return;
      applyFrameLayout(iframe, event.data);
    });

    if (document.body) {
      document.body.appendChild(iframe);
    } else {
      document.addEventListener("DOMContentLoaded", function () {
        document.body.appendChild(iframe);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();
